const asyncHandler = require('express-async-handler');
const walletService = require('../services/walletService');
const Transaction = require('../models/Transaction');

// @desc    Get wallet balance and reward points
// @route   GET /api/wallet
// @access  Private
const getWalletBalance = asyncHandler(async (req, res) => {
    const walletInfo = await walletService.getWalletInfo(req.user._id);

    res.json({
        success: true,
        data: walletInfo,
    });
});

// @desc    Get transaction history
// @route   GET /api/wallet/transactions
// @access  Private
const getTransactionHistory = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, type, category } = req.query;

    const filter = { user: req.user._id };
    if (type) filter.type = type;
    if (category) filter.category = category;

    const transactions = await Transaction.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('reference.refId');

    const count = await Transaction.countDocuments(filter);

    res.json({
        success: true,
        data: transactions,
        pagination: {
            total: count,
            page: parseInt(page),
            pages: Math.ceil(count / limit),
        },
    });
});

// @desc    Add money to wallet
// @route   POST /api/wallet/add
// @access  Private
const addMoney = asyncHandler(async (req, res) => {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
        res.status(400);
        throw new Error('Please provide a valid amount');
    }

    // In production, integrate with payment gateway here
    // For now, directly add to wallet
    const result = await walletService.addToWallet(
        req.user._id,
        amount,
        'wallet_topup',
        {},
        `Added ₹${amount} to wallet`
    );

    res.json({
        success: true,
        message: `₹${amount} added to wallet successfully`,
        data: {
            walletBalance: result.user.walletBalance,
            transaction: result.transaction,
        },
    });
});

// @desc    Convert reward points to wallet balance
// @route   POST /api/wallet/convert-points
// @access  Private
const convertPoints = asyncHandler(async (req, res) => {
    const { points } = req.body;

    if (!points || points <= 0) {
        res.status(400);
        throw new Error('Please provide valid points to convert');
    }

    if (points % 10 !== 0) {
        res.status(400);
        throw new Error('Points must be in multiples of 10');
    }

    const result = await walletService.convertPointsToDiscount(req.user._id, points);

    const amountAdded = points / 10;

    res.json({
        success: true,
        message: `${points} points converted to ₹${amountAdded.toFixed(2)}`,
        data: {
            walletBalance: result.user.walletBalance,
            rewardPoints: result.user.rewardPoints,
            transaction: result.transaction,
        },
    });
});

module.exports = {
    getWalletBalance,
    getTransactionHistory,
    addMoney,
    convertPoints,
};
