const express = require('express');
const router = express.Router();
const {
    createTicket,
    getStudentTickets,
    getTeacherTickets,
    getAdminTickets,
    respondToTicket,
    updateTicketStatus,
    getTicketById,
    updateTicket,
    deleteTicket
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('student', 'teacher', 'admin'), createTicket);
router.get('/student', protect, authorize('student', 'teacher', 'admin'), getStudentTickets);
router.get('/teacher', protect, authorize('teacher'), getTeacherTickets);
router.get('/admin', protect, authorize('admin'), getAdminTickets);
router.get('/:id', protect, getTicketById);
router.put('/:id', protect, updateTicket);
router.post('/:id/respond', protect, respondToTicket);
router.patch('/:id/status', protect, authorize('teacher', 'admin'), updateTicketStatus);
router.delete('/:id', protect, authorize('student', 'teacher', 'admin'), deleteTicket);

module.exports = router;
