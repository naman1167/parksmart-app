const User = require('../models/User');
const Transaction = require('../models/Transaction');

/**
 * Deduct amount from user wallet
 * @param {String} userId - User ID
 * @param {Number} amount - Amount to deduct
 * @param {String} category - Transaction category
 * @param {Object} reference - Reference object {refModel, refId}
 * @param {String} description - Transaction description
 * @returns {Promise<Object>} Updated user and transaction
 */
const deductFromWallet = async (userId, amount, category, reference = {}, description = '') => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    if (user.walletBalance < amount) {
        throw new Error('Insufficient wallet balance');
    }

    // Deduct from wallet
    user.walletBalance -= amount;
    await user.save();

    // Create transaction record
    const transaction = await Transaction.create({
        user: userId,
        type: 'debit',
        amount,
        category,
        reference,
        balanceAfter: user.walletBalance,
        description: description || `${category} payment`,
    });

    return { user, transaction };
};

/**
 * Add amount to user wallet
 * @param {String} userId - User ID
 * @param {Number} amount - Amount to add
 * @param {String} category - Transaction category
 * @param {Object} reference - Reference object {refModel, refId}
 * @param {String} description - Transaction description
 * @returns {Promise<Object>} Updated user and transaction
 */
const addToWallet = async (userId, amount, category, reference = {}, description = '') => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    // Add to wallet
    user.walletBalance += amount;
    await user.save();

    // Create transaction record
    const transaction = await Transaction.create({
        user: userId,
        type: 'credit',
        amount,
        category,
        reference,
        balanceAfter: user.walletBalance,
        description: description || `${category} credit`,
    });

    return { user, transaction };
};

/**
 * Add reward points to user
 * @param {String} userId - User ID
 * @param {Number} points - Points to add
 * @param {Object} reference - Reference object {refModel, refId}
 * @returns {Promise<Object>} Updated user
 */
const addRewardPoints = async (userId, points, reference = {}) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    user.rewardPoints += points;
    await user.save();

    return user;
};

/**
 * Convert reward points to wallet balance
 * @param {String} userId - User ID
 * @param {Number} points - Points to convert
 * @returns {Promise<Object>} Updated user and transaction
 */
const convertPointsToDiscount = async (userId, points) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    if (user.rewardPoints < points) {
        throw new Error('Insufficient reward points');
    }

    // Conversion rate: 10 points = ₹1
    const amount = points / 10;

    // Deduct points
    user.rewardPoints -= points;
    user.walletBalance += amount;
    await user.save();

    // Create transaction record
    const transaction = await Transaction.create({
        user: userId,
        type: 'credit',
        amount,
        category: 'points_conversion',
        reference: {},
        balanceAfter: user.walletBalance,
        description: `Converted ${points} points to ₹${amount.toFixed(2)}`,
    });

    return { user, transaction };
};

/**
 * Get user wallet info
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Wallet info
 */
const getWalletInfo = async (userId) => {
    const user = await User.findById(userId).select('walletBalance rewardPoints');

    if (!user) {
        throw new Error('User not found');
    }

    return {
        walletBalance: user.walletBalance,
        rewardPoints: user.rewardPoints,
        pointsValue: (user.rewardPoints / 10).toFixed(2), // In rupees
    };
};

module.exports = {
    deductFromWallet,
    addToWallet,
    addRewardPoints,
    convertPointsToDiscount,
    getWalletInfo,
};
