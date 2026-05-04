const express = require('express');
const router = express.Router();
const { 
    getAllTransactions, 
    getAllPayouts,
    processPayout, 
    updatePlatformFee, 
    processRefund 
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/transactions', protect, authorize('admin'), getAllTransactions);
router.get('/payouts', protect, authorize('admin'), getAllPayouts);
router.post('/payout/process', protect, authorize('admin'), processPayout);
router.put('/platform-fee', protect, authorize('admin'), updatePlatformFee);
router.post('/refund', protect, authorize('admin'), processRefund);

module.exports = router;
