const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const submissionController = require('../controllers/submissionController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { validateQuiz, validateSubmission } = require('../middleware/validateMiddleware');

// Teacher Routes
router.post('/', authenticate, authorize('teacher'), validateQuiz, quizController.createQuiz);
router.get('/teacher', authenticate, authorize('teacher'), quizController.getTeacherQuizzes);
router.put('/:id', authenticate, authorize('teacher'), quizController.updateQuiz);
router.delete('/:id', authenticate, authorize('teacher'), quizController.deleteQuiz);
router.patch('/:id/publish', authenticate, authorize('teacher'), quizController.togglePublish);
router.get('/:id/submissions', authenticate, authorize('teacher'), submissionController.getQuizSubmissions);

// Student Routes
router.get('/available', authenticate, authorize('student'), quizController.getAvailableQuizzes);
router.get('/:id', authenticate, quizController.getQuizDetails); // Details accessible by student/teacher
router.post('/:id/submit', authenticate, authorize('student'), validateSubmission, submissionController.submitQuiz);

module.exports = router;
