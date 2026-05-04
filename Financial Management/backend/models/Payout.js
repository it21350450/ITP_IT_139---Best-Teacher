const mongoose = require('mongoose');

const PayoutSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  payoutAmount: {
    type: Number,
    required: true
  },
  payoutMethod: {
    type: String,
    enum: ['bank-transfer', 'demo'],
    default: 'demo'
  },
  payoutStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected'],
    default: 'pending'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  processedDate: {
    type: Date
  },
  adminNote: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payout', PayoutSchema);
