const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  grade: { type: String },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' }
}, { timestamps: true });

BookingSchema.post('save', async function(doc) {
  if (doc.status === 'confirmed' && doc.paymentStatus === 'unpaid') {
    try {
      const Transaction = require('./Transaction');
      const Payment = require('./Payment');
      const GlobalConfig = require('./GlobalConfig');
      const User = require('./User');
      const { v4: uuidv4 } = require('uuid');

      // Check if Payment already exists
      const existingPayment = await Payment.findOne({ bookingId: doc._id });
      if (!existingPayment) {
        // Get platform fee percentage
        const feeConfig = await GlobalConfig.findOne({ key: 'PLATFORM_FEE_PERCENTAGE' });
        const feePercentage = feeConfig ? feeConfig.value : 10;

        const platformFee = (doc.amount * feePercentage) / 100;
        const teacherEarning = doc.amount - platformFee;
        const transactionReference = `TXN-${uuidv4().slice(0, 8).toUpperCase()}`;

        // Create pending transaction
        const transaction = await Transaction.create({
          bookingId: doc._id,
          studentId: doc.studentId,
          teacherId: doc.teacherId,
          amount: doc.amount,
          platformFee,
          teacherEarning,
          paymentMethod: 'demo-payment',
          paymentStatus: 'pending',
          transactionReference
        });

        // Get teacher name
        const teacher = await User.findById(doc.teacherId);
        const teacherName = teacher ? teacher.name : 'Unknown';

        // Create pending payment
        await Payment.create({
          transactionId: transaction._id,
          bookingId: doc._id,
          paymentStatus: 'pending',
          subject: doc.subject,
          grade: doc.grade || 'Grade 10',
          teacherName,
          amount: doc.amount
        });
      }
    } catch (error) {
      console.error('Error in Booking post-save hook:', error);
    }
  }
});

module.exports = mongoose.model('Booking', BookingSchema);
