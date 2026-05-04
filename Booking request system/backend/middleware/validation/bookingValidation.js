const { body, param, query, validationResult } = require('express-validator');

// Validation middleware generic error check
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Common timing logic for both create and update
const validateBookingTimes = (req, res, next) => {
  const { date, startTime, endTime } = req.body;
  if (!date || !startTime || !endTime) return next();

  // Check if the date provided is today but time is in the past
  const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date.split('T')[0];
  const startObj = new Date(`${dateStr}T${startTime}:00`);
  const endObj = new Date(`${dateStr}T${endTime}:00`);
  const now = new Date();
  
  if (startObj < now) {
     return res.status(400).json({ success: false, message: 'Cannot book in the past' });
  }
  if (endObj <= startObj) {
     return res.status(400).json({ success: false, message: 'End time must be after start time' });
  }
  next();
};

exports.validateCreateBooking = [
  body('teacherId').isMongoId().withMessage('Valid Teacher ID is required'),
  body('date').isISO8601().toDate().withMessage('Valid date is required (ISO8601 format)'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time required (HH:mm)'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time required (HH:mm)'),
  body('message').optional().isString().isLength({ max: 500 }).withMessage('Message must be string under 500 chars'),
  validate,
  validateBookingTimes
];

exports.validateUpdateBooking = [
  param('id').isMongoId().withMessage('Valid Booking ID is required'),
  body('date').isISO8601().toDate().withMessage('Valid date is required (ISO8601 format)'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time required (HH:mm)'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time required (HH:mm)'),
  body('message').optional().isString().isLength({ max: 500 }).withMessage('Message must be string under 500 chars'),
  validate,
  validateBookingTimes
];

exports.validateUpdateStatus = [
  param('id').isMongoId().withMessage('Valid Booking ID is required'),
  body('status').isIn(['confirmed', 'completed', 'cancelled']).withMessage('Invalid status transition'),
  body('cancellationReason').if(body('status').equals('cancelled')).isString().optional(),
  validate
];

exports.validatePagination = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional({ checkFalsy: true }).isIn(['pending', 'confirmed', 'completed', 'cancelled']),
  validate
];
