const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.get('/my-submissions', authenticate, authorize('student'), submissionController.getMySubmissions);
router.get('/:id', authenticate, submissionController.getSubmissionById);
router.patch('/:id/grade', authenticate, authorize('teacher'), submissionController.adjustGrade);

module.exports = router;
