const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Booking must belong to a user'],
        },
        spot: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ParkingSpot',
            required: [true, 'Booking must have a parking spot'],
        },
        startTime: {
            type: Date,
            required: [true, 'Please provide a start time'],
        },
        endTime: {
            type: Date,
            required: [true, 'Please provide an end time'],
        },
        amountPaid: {
            type: Number,
            required: [true, 'Please provide the amount paid'],
            min: [0, 'Amount cannot be negative'],
        },
        vehicleNumber: {
            type: String,
            required: [true, 'Please provide a vehicle number'],
            trim: true,
            uppercase: true,
        },
        status: {
            type: String,
            enum: ['active', 'completed', 'cancelled'],
            default: 'active',
        },
        referenceCode: {
            type: String,
            unique: true,
            required: true,
        },
        paymentId: {
            type: String,
        },
        orderId: {
            type: String,
        },
        paymentSignature: {
            type: String,
        },
        paymentStatus: {
            type: String,
            default: 'pending', // pending, completed, failed, demo
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Booking', bookingSchema);
