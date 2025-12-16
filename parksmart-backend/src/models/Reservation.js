const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Reservation must belong to a user'],
        },
        slot: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Slot',
            required: [true, 'Reservation must have a slot'],
        },
        parkingSpot: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ParkingSpot',
            required: [true, 'Reservation must have a parking spot'],
        },
        startTime: {
            type: Date,
            required: [true, 'Please provide a start time'],
        },
        duration: {
            type: Number, // in hours
            required: [true, 'Please provide duration in hours'],
            min: [0.5, 'Minimum duration is 30 minutes'],
        },
        endTime: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'active', 'expired', 'cancelled', 'completed'],
            default: 'pending',
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 }, // TTL index - auto-delete when expiresAt is reached
        },
        qrCode: {
            type: String, // Base64 encoded QR code
        },
        entryTime: {
            type: Date,
        },
        exitTime: {
            type: Date,
        },
        estimatedPrice: {
            type: Number,
            required: true,
            min: [0, 'Price cannot be negative'],
        },
        finalPrice: {
            type: Number,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'refunded'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

// Calculate end time before saving
reservationSchema.pre('save', function (next) {
    if (this.isNew) {
        // Set end time based on start time and duration
        this.endTime = new Date(this.startTime.getTime() + this.duration * 60 * 60 * 1000);

        // Set expiry time to 15 minutes from creation if not checked in
        this.expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    }
    next();
});

// Pre-remove hook to free slot when reservation expires
reservationSchema.pre('remove', async function (next) {
    const Slot = mongoose.model('Slot');

    if (this.status === 'pending' || this.status === 'reserved') {
        await Slot.findByIdAndUpdate(this.slot, { status: 'empty' });
    }

    next();
});

module.exports = mongoose.model('Reservation', reservationSchema);
