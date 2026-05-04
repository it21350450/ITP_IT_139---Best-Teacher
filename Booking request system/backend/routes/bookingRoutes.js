const express = require('express');
const {
  createBooking,
  getMyBookings,
  getSingleBooking,
  updateBookingStatus,
  updateBooking
} = require('../controllers/bookingController');
const {
  validateCreateBooking,
  validateUpdateStatus,
  validateUpdateBooking,
  validatePagination
} = require('../middleware/validation/bookingValidation');

// Mock Authentication Middleware
// In the actual system, use your existing JWT auth middleware here
// e.g., const { protect } = require('../middleware/auth');
const protect = (req, res, next) => {
  // Simulating an authenticated user for tests.
  // REMOVE THIS and map to your real `protect` token middleware
  
  // Dynamic mock user decoding from headers set by frontend role switcher
  const mockRole = req.headers['x-mock-role'] || 'student';
  
  // Valid hexadecimal ObjectId mock strings (24 chars)
  const mockStudentId = '651edc4e1a2b3c4d5e6f7a8a';
  const mockTeacherId = '651edc4e1a2b3c4d5e6f7a8b'; // Must match frontend UI creation ID

  req.user = {
    _id: mockRole === 'teacher' ? mockTeacherId : mockStudentId,
    role: mockRole
  };
  
  next();
};

const router = express.Router();

router.use(protect); // Apply auth middleware to all booking routes

// Routes
router.route('/')
  .post(validateCreateBooking, createBooking)
  .get(validatePagination, getMyBookings);

router.route('/:id')
  .get(getSingleBooking)
  .put(validateUpdateBooking, updateBooking);

router.route('/:id/status')
  .patch(validateUpdateStatus, updateBookingStatus);

module.exports = router;
