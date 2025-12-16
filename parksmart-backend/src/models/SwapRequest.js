const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        type: {
            type: String,
            enum: ['leaving', 'looking'], // 'leaving' (Seller), 'looking' (Buyer)
            required: true
        },
        location: {
            type: {
                type: String, // 'Point'
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true
            }
        },
        spotDetails: {
            spotNumber: String,
            parkingAreaName: String, // e.g., "Mall P1"
        },
        status: {
            type: String,
            enum: ['pending', 'matched', 'completed', 'cancelled'],
            default: 'pending'
        },
        matchedWith: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        askingPrice: {
            type: Number,
            default: 50 // Standard credit fee
        },
        expiresAt: {
            type: Date,
            default: () => Date.now() + 15 * 60 * 1000 // Expire in 15 mins
        }
    },
    {
        timestamps: true
    }
);

swapRequestSchema.index({ location: '2dsphere' }); // Crucial for geospatial queries
swapRequestSchema.index({ status: 1 });

module.exports = mongoose.model('SwapRequest', swapRequestSchema);
