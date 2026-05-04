const Transaction = require('../models/Transaction');
const Payout = require('../models/Payout');
const GlobalConfig = require('../models/GlobalConfig');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private/Admin
const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({})
            .populate('studentId', 'name email')
            .populate('teacherId', 'name email')
            .sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions' });
    }
};

// @desc    Get all payout requests
// @route   GET /api/admin/payouts
// @access  Private/Admin
const getAllPayouts = async (req, res) => {
    try {
        const payouts = await Payout.find({})
            .populate('teacherId', 'name email')
            .sort({ createdAt: -1 });
        res.json(payouts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payouts' });
    }
};

// @desc    Process teacher payout (Approve/Reject)
// @route   POST /api/admin/payout/process
// @access  Private/Admin
const processPayout = async (req, res) => {
    const { payoutId, status, adminNote } = req.body; // status: completed or rejected

    try {
        const payout = await Payout.findById(payoutId);

        if (!payout) {
            return res.status(404).json({ message: 'Payout request not found' });
        }

        if (payout.payoutStatus !== 'pending' && payout.payoutStatus !== 'processing') {
            return res.status(400).json({ message: 'Payout is already processed' });
        }

        payout.payoutStatus = status;
        payout.adminNote = adminNote;
        payout.processedDate = Date.now();

        if (status === 'rejected') {
            // Refund balance to teacher
            const teacher = await User.findById(payout.teacherId);
            teacher.balance += payout.payoutAmount;
            await teacher.save();
        }

        await payout.save();
        res.json({ message: `Payout request ${status}`, payout });
    } catch (error) {
        res.status(500).json({ message: 'Error processing payout' });
    }
};

// @desc    Update platform fee
// @route   PUT /api/admin/platform-fee
// @access  Private/Admin
const updatePlatformFee = async (req, res) => {
    const { percentage } = req.body;

    try {
        let feeConfig = await GlobalConfig.findOne({ key: 'PLATFORM_FEE_PERCENTAGE' });

        if (feeConfig) {
            feeConfig.value = percentage;
            await feeConfig.save();
        } else {
            await GlobalConfig.create({ key: 'PLATFORM_FEE_PERCENTAGE', value: percentage });
        }

        res.json({ message: 'Platform fee updated successfully', percentage });
    } catch (error) {
        res.status(500).json({ message: 'Error updating platform fee' });
    }
};

// @desc    Process refund
// @route   POST /api/admin/refund
// @access  Private/Admin
const processRefund = async (req, res) => {
    const { transactionId } = req.body;

    try {
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        if (transaction.paymentStatus === 'refunded') {
            return res.status(400).json({ message: 'Transaction already refunded' });
        }

        // Update Transaction
        transaction.paymentStatus = 'refunded';
        await transaction.save();

        // Update Payment
        const payment = await Payment.findOne({ transactionId: transaction._id });
        if (payment) {
            payment.paymentStatus = 'failed'; // Or 'refunded' if added to enum
            await payment.save();
        }

        // Update Booking
        const booking = await Booking.findById(transaction.bookingId);
        if (booking) {
            booking.paymentStatus = 'unpaid';
            booking.status = 'cancelled';
            await booking.save();
        }

        // Deduct from teacher balance
        const teacher = await User.findById(transaction.teacherId);
        if (teacher) {
            teacher.balance -= transaction.teacherEarning;
            teacher.totalEarnings -= transaction.teacherEarning;
            await teacher.save();
        }

        res.json({ message: 'Refund processed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error processing refund' });
    }
};

module.exports = {
    getAllTransactions,
    getAllPayouts,
    processPayout,
    updatePlatformFee,
    processRefund
};
