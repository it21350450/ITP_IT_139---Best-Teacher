const express = require('express');
const router = express.Router();
const {
    createReview,
    getTeacherReviews,
    getTeacherSummary,
    deleteReview
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('student'), createReview);
router.get('/teacher/:teacherId', getTeacherReviews);
router.get('/teacher/:teacherId/summary', getTeacherSummary);
router.delete('/:id', protect, authorize('admin'), deleteReview);

module.exports = router;
