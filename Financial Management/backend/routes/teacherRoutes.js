const express = require('express');
const router = express.Router();
const { 
    getEarnings, 
    requestPayout, 
    getPayoutHistory,
    updatePayoutRequest,
    deletePayoutRequest 
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/earnings', protect, authorize('teacher'), getEarnings);
router.post('/payout/request', protect, authorize('teacher'), requestPayout);
router.get('/payout/history', protect, authorize('teacher'), getPayoutHistory);
router.put('/payout/:id', protect, authorize('teacher'), updatePayoutRequest);
router.delete('/payout/:id', protect, authorize('teacher'), deletePayoutRequest);

module.exports = router;
