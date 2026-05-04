const Transaction = require('../models/Transaction');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const User = require('../models/User');
const GlobalConfig = require('../models/GlobalConfig');
const { v4: uuidv4 } = require('uuid');

// @desc    Pay for a booking
// @route   POST /api/payments/pay-booking
// @access  Private/Student
const payBooking = async (req, res) => {
    const { bookingId, paymentMethod } = req.body;

    try {
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.studentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to pay for this booking' });
        }

        if (booking.paymentStatus === 'paid') {
            return res.status(400).json({ message: 'Booking is already paid' });
        }

        // Get platform fee percentage
        const feeConfig = await GlobalConfig.findOne({ key: 'PLATFORM_FEE_PERCENTAGE' });
        const feePercentage = feeConfig ? feeConfig.value : 10; // Default 10%

        const platformFee = (booking.amount * feePercentage) / 100;
        const teacherEarning = booking.amount - platformFee;

        // Find existing pending transaction
        let transaction = await Transaction.findOne({ bookingId: booking._id, paymentStatus: 'pending' });
        
        if (!transaction) {
            const transactionReference = `TXN-${uuidv4().slice(0, 8).toUpperCase()}`;
            transaction = await Transaction.create({
                bookingId,
                studentId: req.user._id,
                teacherId: booking.teacherId,
                amount: booking.amount,
                platformFee,
                teacherEarning,
                paymentMethod: paymentMethod || 'demo-payment',
                paymentStatus: 'completed',
                transactionReference
            });
        } else {
            transaction.paymentStatus = 'completed';
            transaction.paymentMethod = paymentMethod || 'demo-payment';
            await transaction.save();
        }

        // Find existing pending payment
        let payment = await Payment.findOne({ bookingId: booking._id, paymentStatus: 'pending' });
        
        if (!payment) {
            await Payment.create({
                transactionId: transaction._id,
                bookingId,
                paymentStatus: 'completed',
                paidAt: Date.now()
            });
        } else {
            payment.paymentStatus = 'completed';
            payment.paidAt = Date.now();
            await payment.save();
        }

        // Generate Invoice
        const invoiceNumber = `INV-${Date.now()}-${uuidv4().slice(0, 4).toUpperCase()}`;
        await Invoice.create({
            invoiceNumber,
            bookingId,
            studentId: req.user._id,
            teacherId: booking.teacherId,
            amount: booking.amount,
            platformFee,
            total: booking.amount
        });

        // Update Booking
        booking.paymentStatus = 'paid';
        await booking.save();

        // Update Teacher Balance & Earnings
        const teacher = await User.findById(booking.teacherId);
        if (teacher) {
            teacher.balance += teacherEarning;
            teacher.totalEarnings += teacherEarning;
            await teacher.save();
        }

        res.status(201).json({
            message: 'Payment completed successfully',
            transactionReference: transaction.transactionReference,
            invoiceNumber
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during payment' });
    }
};

// @desc    Get student payment history
// @route   GET /api/payments/history
// @access  Private/Student
const getPaymentHistory = async (req, res) => {
    try {
        const transactions = await Transaction.find({ studentId: req.user._id })
            .populate('teacherId', 'name email')
            .populate('bookingId', 'subject status')
            .sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payment history' });
    }
};

// @desc    Get student invoices
// @route   GET /api/invoices
// @access  Private/Student
const getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({ studentId: req.user._id })
            .populate('teacherId', 'name email')
            .sort({ createdAt: -1 });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invoices' });
    }
};

// @desc    Get student pending bookings
// @route   GET /api/payments/pending-bookings
// @access  Private/Student
const getPendingBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ 
            studentId: req.user._id, 
            paymentStatus: 'unpaid' 
        }).populate('teacherId', 'name email');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending bookings' });
    }
};

// @desc    Create a mock booking for testing
// @route   POST /api/payments/mock-booking
// @access  Private/Student
const createMockBooking = async (req, res) => {
    const { subject, amount, teacherName, grade } = req.body;

    try {
        // Find the single demo teacher so that balances update consistently for the Teacher View
        let teacher = await User.findOne({ email: 'demo-teacher@example.com' });
        if (!teacher) {
            teacher = await User.create({
                name: 'Demo Teacher',
                email: 'demo-teacher@example.com',
                password: 'hashed_password',
                role: 'teacher'
            });
        }

        const booking = await Booking.create({
            studentId: req.user._id,
            teacherId: teacher._id,
            subject: subject || 'New lesson',
            grade: grade || 'Grade 10',
            amount: amount || 50,
            status: 'confirmed',
            paymentStatus: 'unpaid'
        });

        res.status(201).json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating mock booking' });
    }
};

// @desc    Update a pending lesson request
// @route   PUT /api/payments/booking/:id
// @access  Private/Student
const updateBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        if (booking.studentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (booking.paymentStatus === 'paid') {
            return res.status(400).json({ message: 'Cannot update a paid lesson' });
        }

        const { subject, amount } = req.body;
        booking.subject = subject || booking.subject;
        booking.amount = amount || booking.amount;

        await booking.save();
        res.json({ message: 'Lesson request updated', booking });
    } catch (error) {
        console.error('Error in updateBooking:', error);
        res.status(500).json({ message: 'Error updating lesson' });
    }
};

// @desc    Delete a pending lesson request
// @route   DELETE /api/payments/booking/:id
// @access  Private/Student
const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        
        if (booking.studentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (booking.paymentStatus === 'paid') {
            return res.status(400).json({ message: 'Cannot delete a paid lesson' });
        }

        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Lesson request deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting lesson' });
    }
};

module.exports = {
    payBooking,
    getPaymentHistory,
    getInvoices,
    getPendingBookings,
    createMockBooking,
    updateBooking,
    deleteBooking
};
