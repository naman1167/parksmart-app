const asyncHandler = require('express-async-handler');
const Subscription = require('../models/Subscription');
const walletService = require('../services/walletService');

// Subscription plan prices
const SUBSCRIPTION_PRICES = {
    monthly: 499,
    quarterly: 1299,
    yearly: 4999,
};

// @desc    Purchase subscription
// @route   POST /api/subscriptions
// @access  Private
const purchaseSubscription = asyncHandler(async (req, res) => {
    const { plan, autoRenew } = req.body;

    if (!plan || !['monthly', 'quarterly', 'yearly'].includes(plan)) {
        res.status(400);
        throw new Error('Please provide a valid subscription plan');
    }

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
        user: req.user._id,
        isActive: true,
    });

    if (existingSubscription) {
        res.status(400);
        throw new Error('You already have an active subscription');
    }

    const price = SUBSCRIPTION_PRICES[plan];

    // Check wallet balance
    const walletInfo = await walletService.getWalletInfo(req.user._id);
    if (walletInfo.walletBalance < price) {
        res.status(400);
        throw new Error(`Insufficient wallet balance. Subscription costs ₹${price}`);
    }

    // Deduct from wallet
    await walletService.deductFromWallet(
        req.user._id,
        price,
        'subscription',
        {},
        `${plan} subscription purchase`
    );

    // Create subscription
    const subscription = await Subscription.create({
        user: req.user._id,
        plan,
        price,
        autoRenew: autoRenew || false,
        isActive: true,
    });

    res.status(201).json({
        success: true,
        message: 'Subscription purchased successfully',
        data: subscription,
    });
});

// @desc    Get user's active subscription
// @route   GET /api/subscriptions/my
// @access  Private
const getMySubscription = asyncHandler(async (req, res) => {
    const subscription = await Subscription.findOne({
        user: req.user._id,
        isActive: true,
    });

    if (!subscription) {
        return res.json({
            success: true,
            data: null,
            message: 'No active subscription',
        });
    }

    res.json({
        success: true,
        data: subscription,
    });
});

// @desc    Cancel subscription
// @route   DELETE /api/subscriptions/:id
// @access  Private
const cancelSubscription = asyncHandler(async (req, res) => {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
        res.status(404);
        throw new Error('Subscription not found');
    }

    // Check ownership
    if (subscription.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to cancel this subscription');
    }

    // Disable auto-renew
    subscription.autoRenew = false;
    subscription.isActive = false;
    await subscription.save();

    res.json({
        success: true,
        message: 'Subscription cancelled successfully',
        data: subscription,
    });
});

// @desc    Toggle auto-renew
// @route   PUT /api/subscriptions/:id/autorenew
// @access  Private
const toggleAutoRenew = asyncHandler(async (req, res) => {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
        res.status(404);
        throw new Error('Subscription not found');
    }

    // Check ownership
    if (subscription.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized');
    }

    subscription.autoRenew = !subscription.autoRenew;
    await subscription.save();

    res.json({
        success: true,
        message: `Auto-renew ${subscription.autoRenew ? 'enabled' : 'disabled'}`,
        data: subscription,
    });
});

// @desc    Check if user has active subscription (for booking discount)
// @route   GET /api/subscriptions/check-discount
// @access  Private
const checkSubscriptionDiscount = asyncHandler(async (req, res) => {
    const subscription = await Subscription.findOne({
        user: req.user._id,
        isActive: true,
        endDate: { $gte: new Date() },
    });

    if (!subscription) {
        return res.json({
            success: true,
            hasDiscount: false,
            discountPercentage: 0,
        });
    }

    res.json({
        success: true,
        hasDiscount: true,
        discountPercentage: subscription.benefits.discountPercentage,
        subscription,
    });
});

// @desc    Get all subscriptions (admin)
// @route   GET /api/subscriptions
// @access  Private/Admin
const getAllSubscriptions = asyncHandler(async (req, res) => {
    const { isActive } = req.query;

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const subscriptions = await Subscription.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        count: subscriptions.length,
        data: subscriptions,
    });
});

module.exports = {
    purchaseSubscription,
    getMySubscription,
    cancelSubscription,
    toggleAutoRenew,
    checkSubscriptionDiscount,
    getAllSubscriptions,
    SUBSCRIPTION_PRICES,
};
