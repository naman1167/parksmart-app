const mongoose = require('mongoose');

const pricingRuleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a rule name'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        peakHours: [{
            start: {
                type: Number, // 0-23 (hour of day)
                required: true,
                min: 0,
                max: 23,
            },
            end: {
                type: Number, // 0-23 (hour of day)
                required: true,
                min: 0,
                max: 23,
            },
        }],
        multiplier: {
            type: Number, // Percentage multiplier (e.g., 1.5 = 150% = 50% increase)
            required: [true, 'Please provide a multiplier'],
            min: [0, 'Multiplier cannot be negative'],
            default: 1,
        },
        daysOfWeek: [{
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        }],
        isActive: {
            type: Boolean,
            default: true,
        },
        parkingSpot: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ParkingSpot',
            // Optional - if null, applies to all parking spots
        },
        priority: {
            type: Number,
            default: 0, // Higher priority rules are applied first
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
pricingRuleSchema.index({ isActive: 1, priority: -1 });

module.exports = mongoose.model('PricingRule', pricingRuleSchema);
