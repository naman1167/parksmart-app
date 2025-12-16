const express = require('express');
const router = express.Router();
const {
    purchaseSubscription,
    getMySubscription,
    cancelSubscription,
    toggleAutoRenew,
    checkSubscriptionDiscount,
    getAllSubscriptions,
} = require('../controllers/subscriptionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// User routes
router.post('/', protect, purchaseSubscription);
router.get('/my', protect, getMySubscription);
router.delete('/:id', protect, cancelSubscription);
router.put('/:id/autorenew', protect, toggleAutoRenew);
router.get('/check-discount', protect, checkSubscriptionDiscount);

// Admin routes
router.get('/', protect, adminOnly, getAllSubscriptions);

module.exports = router;
