const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        const today = new Date();
        today.setHours(0,0,0,0);
        return value >= today; // Prevent past dates strictly at the DB level
      },
      message: 'Date must be today or in the future'
    }
  },
  startTime: {
    type: String, // format HH:mm
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid start time in HH:mm format']
  },
  endTime: {
    type: String, // format HH:mm
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid end time in HH:mm format']
  },
  message: {
    type: String,
    maxLength: 500,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  cancellationReason: {
    type: String,
  },
  completedAt: {
    type: Date,
  }
}, {
  timestamps: true // adds createdAt, updatedAt automatically
});

// Compound index for efficient querying and some level of uniqueness filtering
bookingSchema.index({ teacherId: 1, date: 1, startTime: 1 });
bookingSchema.index({ studentId: 1, date: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
