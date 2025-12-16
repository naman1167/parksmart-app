const asyncHandler = require('express-async-handler');
const Reservation = require('../models/Reservation');
const { verifyQRCode } = require('../utils/qrGenerator');
const Slot = require('../models/Slot');
const walletService = require('../services/walletService');

// @desc    Validate entry QR code
// @route   POST /api/qr/entry
// @access  Private/Admin/Owner
const validateEntryQR = asyncHandler(async (req, res) => {
    const { qrData } = req.body;

    if (!qrData) {
        res.status(400);
        throw new Error('Please provide QR code data');
    }

    // Verify and parse QR code
    let data;
    try {
        data = verifyQRCode(qrData);
    } catch (error) {
        res.status(400);
        throw new Error('Invalid or tampered QR code');
    }

    // Find reservation
    const reservation = await Reservation.findById(data.reservationId)
        .populate('slot')
        .populate('parkingSpot')
        .populate('user', 'name email');

    if (!reservation) {
        res.status(404);
        throw new Error('Reservation not found');
    }

    // Verify reservation belongs to scanned QR
    if (reservation.user._id.toString() !== data.userId) {
        res.status(403);
        throw new Error('QR code does not match reservation user');
    }

    // Check if already checked in
    if (reservation.entryTime) {
        res.status(400);
        throw new Error('Already checked in');
    }

    // Check if reservation is valid (not expired or cancelled)
    if (!['pending', 'active'].includes(reservation.status)) {
        res.status(400);
        throw new Error('Reservation is not valid');
    }

    // Update entry time
    reservation.entryTime = new Date();
    reservation.status = 'active';
    await reservation.save();

    // Update slot status
    await Slot.findByIdAndUpdate(reservation.slot._id, { status: 'occupied' });

    // Emit socket event
    if (req.io) {
        req.io.emit('slotUpdated', {
            slotId: reservation.slot._id,
            status: 'occupied',
        });
    }

    res.json({
        success: true,
        message: 'Entry validated successfully',
        data: {
            reservation,
            entryTime: reservation.entryTime,
        },
    });
});

// @desc    Validate exit QR code and process payment
// @route   POST /api/qr/exit
// @access  Private/Admin/Owner
const validateExitQR = asyncHandler(async (req, res) => {
    const { qrData } = req.body;

    if (!qrData) {
        res.status(400);
        throw new Error('Please provide QR code data');
    }

    // Verify and parse QR code
    let data;
    try {
        data = verifyQRCode(qrData);
    } catch (error) {
        res.status(400);
        throw new Error('Invalid or tampered QR code');
    }

    // Find reservation
    const reservation = await Reservation.findById(data.reservationId)
        .populate('slot')
        .populate('parkingSpot')
        .populate('user', 'name email walletBalance');

    if (!reservation) {
        res.status(404);
        throw new Error('Reservation not found');
    }

    // Check if already exited
    if (reservation.exitTime) {
        res.status(400);
        throw new Error('Already checked out');
    }

    // Must have entry time
    if (!reservation.entryTime) {
        res.status(400);
        throw new Error('No entry record found');
    }

    // Calculate actual time spent and price
    const exitTime = new Date();
    const timeSpentMs = exitTime - new Date(reservation.entryTime);
    const hoursSpent = Math.ceil(timeSpentMs / (1000 * 60 * 60)); // Round up to nearest hour

    let finalPrice = reservation.estimatedPrice;

    // If actual time exceeds reserved time, charge extra
    if (hoursSpent > reservation.duration) {
        const extraHours = hoursSpent - reservation.duration;
        const extraCharge = extraHours * reservation.parkingSpot.pricePerHour;
        finalPrice += extraCharge;
    }

    // Deduct payment if not already paid
    if (reservation.paymentStatus !== 'paid') {
        await walletService.deductFromWallet(
            reservation.user._id,
            finalPrice,
            'payment',
            { refModel: 'Reservation', refId: reservation._id },
            `Payment for parking (${hoursSpent} hours)`
        );

        // Add reward points
        await walletService.addRewardPoints(
            reservation.user._id,
            5,
            { refModel: 'Reservation', refId: reservation._id }
        );
    }

    // Update reservation
    reservation.exitTime = exitTime;
    reservation.finalPrice = finalPrice;
    reservation.status = 'completed';
    reservation.paymentStatus = 'paid';
    await reservation.save();

    // Free the slot
    await Slot.findByIdAndUpdate(reservation.slot._id, { status: 'empty' });

    // Emit socket event
    if (req.io) {
        req.io.emit('slotUpdated', {
            slotId: reservation.slot._id,
            status: 'empty',
        });
    }

    res.json({
        success: true,
        message: 'Exit processed successfully',
        data: {
            reservation,
            exitTime: reservation.exitTime,
            timeSpent: `${hoursSpent} hours`,
            finalPrice: reservation.finalPrice,
        },
    });
});

module.exports = {
    validateEntryQR,
    validateExitQR,
};
