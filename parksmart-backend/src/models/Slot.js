const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
    {
        slotNumber: {
            type: String,
            required: [true, 'Please provide a slot number'],
            trim: true,
        },
        parkingSpot: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ParkingSpot',
            required: [true, 'Slot must belong to a parking spot'],
        },
        status: {
            type: String,
            enum: ['empty', 'occupied', 'reserved'],
            default: 'empty',
        },
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
        floor: {
            type: String,
            default: 'Ground',
        },
        type: {
            type: String,
            enum: ['regular', 'compact', 'large', 'handicap', 'electric'],
            default: 'regular',
        },
    },
    {
        timestamps: true,
    }
);

// Update lastUpdated on status change
slotSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        this.lastUpdated = Date.now();
    }
    next();
});

module.exports = mongoose.model('Slot', slotSchema);
