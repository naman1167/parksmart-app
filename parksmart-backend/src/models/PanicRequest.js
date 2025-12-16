const mongoose = require('mongoose');

const panicRequestSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            required: true
        },
        spot: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ParkingSpot',
            required: true
        },
        issueType: {
            type: String,
            enum: ['Car not starting', 'Exit blocked', 'Lost ticket', 'Other', 'Safety concern'],
            required: true
        },
        message: {
            type: String,
            trim: true,
            required: false // Optional user message
        },
        status: {
            type: String,
            enum: ['Active', 'Resolved'],
            default: 'Active'
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: false
            }
        },
        resolvedAt: {
            type: Date
        },
        adminNotes: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

panicRequestSchema.index({ status: 1 }); // Index for fetching active requests

module.exports = mongoose.model('PanicRequest', panicRequestSchema);
