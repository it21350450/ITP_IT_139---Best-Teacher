const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paidAt: {
    type: Date
  },
  subject: {
    type: String
  },
  grade: {
    type: String
  },
  teacherName: {
    type: String
  },
  amount: {
    type: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', PaymentSchema);
