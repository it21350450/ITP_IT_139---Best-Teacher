const Transaction = require('../models/Transaction');
const Payout = require('../models/Payout');
const User = require('../models/User');

// @desc    Get teacher earnings summary
// @route   GET /api/earnings
// @access  Private/Teacher
const getEarnings = async (req, res) => {
    try {
        const teacher = await User.findById(req.user._id);
        
        // Detailed transaction history
        const completedTransactions = await Transaction.find({ 
            teacherId: req.user._id, 
            paymentStatus: 'completed' 
        }).populate('studentId', 'name email').sort({ createdAt: -1 });

        // Pending payouts
        const pendingPayouts = await Payout.find({ 
            teacherId: req.user._id, 
            payoutStatus: { $in: ['pending', 'processing'] } 
        });

        const pendingPayoutAmount = pendingPayouts.reduce((acc, curr) => acc + curr.payoutAmount, 0);

        res.json({
            totalEarnings: teacher.totalEarnings,
            availableBalance: teacher.balance,
            pendingPayoutAmount,
            transactions: completedTransactions
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching earnings' });
    }
};

// @desc    Request a payout
// @route   POST /api/payout/request
// @access  Private/Teacher
const requestPayout = async (req, res) => {
    const { amount, method } = req.body;

    try {
        const teacher = await User.findById(req.user._id);

        if (amount <= 0) {
            return res.status(400).json({ message: 'Invalid payout amount' });
        }

        if (teacher.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Create Payout Request
        const payout = await Payout.create({
            teacherId: req.user._id,
            payoutAmount: amount,
            payoutMethod: method || 'demo',
            payoutStatus: 'pending'
        });

        // Deduct from balance immediately (lock funds)
        teacher.balance -= amount;
        await teacher.save();

        res.status(201).json({
            message: 'Payout request submitted successfully',
            payout
        });
    } catch (error) {
        res.status(500).json({ message: 'Error processing payout request' });
    }
};

// @desc    Get teacher payout history
// @route   GET /api/payout/history
// @access  Private/Teacher
const getPayoutHistory = async (req, res) => {
    try {
        const payouts = await Payout.find({ teacherId: req.user._id }).sort({ createdAt: -1 });
        res.json(payouts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payout history' });
    }
};

// @desc    Update a pending payout request
// @route   PUT /api/teacher/payout/:id
// @access  Private/Teacher
const updatePayoutRequest = async (req, res) => {
    const { amount } = req.body;
    try {
        const payout = await Payout.findById(req.params.id);
        if (!payout) return res.status(404).json({ message: 'Payout request not found' });
        
        if (payout.teacherId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (payout.payoutStatus !== 'pending') {
            return res.status(400).json({ message: 'Cannot update a payout that is already being processed' });
        }

        const teacher = await User.findById(req.user._id);
        
        // Return original amount to balance first
        teacher.balance += payout.payoutAmount;
        
        if (teacher.balance < amount) {
            teacher.balance -= payout.payoutAmount; // Restore if failed
            return res.status(400).json({ message: 'Insufficient balance for new amount' });
        }

        // Deduct new amount
        teacher.balance -= amount;
        await teacher.save();

        payout.payoutAmount = amount;
        await payout.save();

        res.json({ message: 'Payout request updated', payout });
    } catch (error) {
        res.status(500).json({ message: 'Error updating payout request' });
    }
};

// @desc    Delete a pending payout request
// @route   DELETE /api/teacher/payout/:id
// @access  Private/Teacher
const deletePayoutRequest = async (req, res) => {
    try {
        const payout = await Payout.findById(req.params.id);
        if (!payout) return res.status(404).json({ message: 'Payout request not found' });
        
        if (payout.teacherId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (payout.payoutStatus !== 'pending') {
            return res.status(400).json({ message: 'Cannot delete a payout that is already being processed' });
        }

        // Return funds to teacher balance
        const teacher = await User.findById(req.user._id);
        teacher.balance += payout.payoutAmount;
        await teacher.save();

        await Payout.findByIdAndDelete(req.params.id);
        res.json({ message: 'Payout request cancelled and funds returned to balance' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting payout request' });
    }
};

module.exports = {
    getEarnings,
    requestPayout,
    getPayoutHistory,
    updatePayoutRequest,
    deletePayoutRequest
};
