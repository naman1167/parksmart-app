const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Transaction must belong to a user'],
        },
        type: {
            type: String,
            enum: ['credit', 'debit'],
            required: true,
        },
        amount: {
            type: Number,
            required: [true, 'Please provide an amount'],
            min: [0, 'Amount cannot be negative'],
        },
        category: {
            type: String,
            enum: ['payment', 'reward', 'refund', 'wallet_topup', 'subscription', 'points_conversion'],
            required: true,
        },
        reference: {
            refModel: {
                type: String,
                enum: ['Booking', 'Reservation', 'Subscription', ''],
            },
            refId: {
                type: mongoose.Schema.Types.ObjectId,
            },
        },
        balanceAfter: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster user transaction queries
transactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
