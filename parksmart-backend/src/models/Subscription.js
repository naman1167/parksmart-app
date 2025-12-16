const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Subscription must belong to a user'],
            unique: true, // One active subscription per user
        },
        plan: {
            type: String,
            enum: ['monthly', 'quarterly', 'yearly'],
            required: [true, 'Please provide a subscription plan'],
        },
        startDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        endDate: {
            type: Date,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        autoRenew: {
            type: Boolean,
            default: false,
        },
        price: {
            type: Number,
            required: [true, 'Please provide subscription price'],
            min: [0, 'Price cannot be negative'],
        },
        benefits: {
            discountPercentage: {
                type: Number,
                default: 20, // 20% discount on all bookings
                min: 0,
                max: 100,
            },
            freeHoursPerMonth: {
                type: Number,
                default: 0,
            },
            priorityBooking: {
                type: Boolean,
                default: false,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Calculate end date before saving
subscriptionSchema.pre('save', function (next) {
    if (this.isNew) {
        const start = this.startDate;
        let endDate = new Date(start);

        switch (this.plan) {
            case 'monthly':
                endDate.setMonth(endDate.getMonth() + 1);
                break;
            case 'quarterly':
                endDate.setMonth(endDate.getMonth() + 3);
                break;
            case 'yearly':
                endDate.setFullYear(endDate.getFullYear() + 1);
                break;
        }

        this.endDate = endDate;
    }
    next();
});

// Index for cron job to find expired subscriptions
subscriptionSchema.index({ endDate: 1, isActive: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
