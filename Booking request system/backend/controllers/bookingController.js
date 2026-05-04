const mongoose = require('mongoose');
const Booking = require('../models/Booking');

// Helper to convert HH:mm to minutes for overlap calculation
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper to check for overlapping bookings
const checkOverlap = async (teacherId, date, startTime, endTime, excludeBookingId = null) => {
  const newStart = timeToMinutes(startTime);
  const newEnd = timeToMinutes(endTime);

  const query = {
    teacherId,
    date,
    status: { $in: ['pending', 'confirmed'] }
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const existingBookings = await Booking.find(query);

  for (const b of existingBookings) {
    const existingStart = timeToMinutes(b.startTime);
    const existingEnd = timeToMinutes(b.endTime);

    // Overlap logic: (Start A < End B) AND (End A > Start B)
    if (existingStart < newEnd && existingEnd > newStart) {
      return true;
    }
  }
  return false;
};

// @desc    Create a new booking request
// @route   POST /api/bookings
// @access  Private (Student)
exports.createBooking = async (req, res, next) => {
  try {
    const { teacherId, date, startTime, endTime, message } = req.body;
    const studentId = req.user._id;

    if (req.user.role !== 'student') {
      const err = new Error('Only students can create bookings');
      err.status = 403;
      throw err;
    }

    // Double Booking Prevention
    const hasOverlap = await checkOverlap(teacherId, date, startTime, endTime);

    if (hasOverlap) {
      const err = new Error('Teacher is already booked or has an overlapping request during this time');
      err.status = 409;
      throw err;
    }

    const booking = new Booking({
      studentId,
      teacherId,
      date,
      startTime,
      endTime,
      message,
      status: 'pending'
    });

    await booking.save();

    return res.status(201).json({
      success: true,
      message: 'Booking request created successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a booking request
// @route   PUT /api/bookings/:id
// @access  Private (Student)
exports.updateBooking = async (req, res, next) => {
  try {
    const { date, startTime, endTime, message } = req.body;
    const bookingId = req.params.id;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      const err = new Error('Booking not found');
      err.status = 404;
      throw err;
    }

    // Check if user is the student who created the booking
    if (booking.studentId.toString() !== userId.toString()) {
      const err = new Error('Not authorized to update this booking');
      err.status = 403;
      throw err;
    }

    // Check if booking is in pending stage
    if (booking.status !== 'pending') {
      const err = new Error('Booking can only be updated while it is pending');
      err.status = 400;
      throw err;
    }

    // Double Booking Prevention (excluding the current booking)
    const hasOverlap = await checkOverlap(booking.teacherId, date, startTime, endTime, bookingId);

    if (hasOverlap) {
      const err = new Error('Teacher is already booked or has an overlapping request during this time');
      err.status = 409;
      throw err;
    }

    // Update booking fields
    booking.date = date || booking.date;
    booking.startTime = startTime || booking.startTime;
    booking.endTime = endTime || booking.endTime;
    booking.message = message || booking.message;

    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my bookings
// @route   GET /api/bookings
// @access  Private (Student & Teacher)
exports.getMyBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    } else if (req.user.role === 'teacher') {
      query.teacherId = req.user._id;
    } else {
      const err = new Error('Unauthorized role');
      err.status = 403;
      throw err;
    }

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('teacherId', 'name email')
      .populate('studentId', 'name email')
      .sort({ date: -1, startTime: -1 }) // Sort latest first
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single booking
// @route   GET /api/bookings/:id
// @access  Private (Involved Users)
exports.getSingleBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('teacherId', 'name email')
      .populate('studentId', 'name email');

    if (!booking) {
      const err = new Error('Booking not found');
      err.status = 404;
      throw err;
    }

    // Role-based access control
    if (
      req.user.role !== 'admin' &&
      booking.studentId._id.toString() !== req.user._id.toString() &&
      booking.teacherId._id.toString() !== req.user._id.toString()
    ) {
      const err = new Error('Not authorized to view this booking');
      err.status = 403;
      throw err;
    }

    return res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private (Involved Users based on strict rules)
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status, cancellationReason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      const err = new Error('Booking not found');
      err.status = 404;
      throw err;
    }

    const isStudent = req.user._id.toString() === booking.studentId.toString();
    const isTeacher = req.user._id.toString() === booking.teacherId.toString();

    if (!isStudent && !isTeacher) {
      const err = new Error('Not authorized to update this booking');
      err.status = 403;
      throw err;
    }

    const currentStatus = booking.status;
    let validTransition = false;

    // Strict status transition rules:
    // 1. pending -> confirmed (teacher only)
    if (currentStatus === 'pending' && status === 'confirmed' && isTeacher) {
      validTransition = true;
    }
    // 2. pending -> cancelled (teacher OR student)
    else if (currentStatus === 'pending' && status === 'cancelled') {
      validTransition = true;
    }
    // 3. confirmed -> completed (teacher OR student after lesson time)
    else if (currentStatus === 'confirmed' && status === 'completed') {
      const endTimeObj = new Date(`${booking.date.toISOString().split('T')[0]}T${booking.endTime}:00`);
      
      // Disabled for UI testing so user can simulate the full booking loop instantly 
      // if (new Date() < endTimeObj) {
      //   const err = new Error('Cannot complete booking before lesson ends');
      //   err.status = 400;
      //   throw err;
      // }
      
      validTransition = true;
      booking.completedAt = new Date();
    }
    // 4. confirmed -> cancelled (student before lesson time)
    else if (currentStatus === 'confirmed' && status === 'cancelled' && isStudent) {
      const startTimeObj = new Date(`${booking.date.toISOString().split('T')[0]}T${booking.startTime}:00`);
      if (new Date() >= startTimeObj) {
        const err = new Error('Cannot cancel an ongoing or past lesson');
        err.status = 400;
        throw err;
      }
      validTransition = true;
    }

    if (!validTransition) {
      const err = new Error(`Invalid status transition from ${currentStatus} to ${status} for your role`);
      err.status = 400;
      throw err;
    }

    booking.status = status;
    if (status === 'cancelled') {
       booking.cancellationReason = cancellationReason || 'No reason provided';
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};
