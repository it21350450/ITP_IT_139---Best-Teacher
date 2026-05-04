const { check, validationResult } = require('express-validator');

exports.validateQuiz = [
  check('title', 'Title is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('subject', 'Subject is required').not().isEmpty(),
  check('grade', 'Grade is required').not().isEmpty(),
  check('deadline', 'Deadline must be a valid date').isISO8601(),
  check('questions', 'At least one question is required').isArray({ min: 1 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

exports.validateSubmission = [
  check('answers', 'Answers must be an array').isArray(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
