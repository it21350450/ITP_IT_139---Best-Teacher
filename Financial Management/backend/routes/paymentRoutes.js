const express = require('express');
const router = express.Router();
const { 
    payBooking, 
    getPaymentHistory, 
    getInvoices, 
    createMockBooking, 
    getPendingBookings,
    updateBooking,
    deleteBooking 
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/pay-booking', protect, authorize('student'), payBooking);
router.post('/mock-booking', protect, authorize('student'), createMockBooking);
router.get('/pending-bookings', protect, authorize('student'), getPendingBookings);
router.put('/booking/:id', protect, authorize('student'), updateBooking);
router.delete('/booking/:id', protect, authorize('student'), deleteBooking);
router.get('/history', protect, authorize('student'), getPaymentHistory);
router.get('/invoices', protect, authorize('student'), getInvoices);

module.exports = router;
