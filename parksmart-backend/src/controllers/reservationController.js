const asyncHandler = require('express-async-handler');
const Reservation = require('../models/Reservation');
const Slot = require('../models/Slot');
const ParkingSpot = require('../models/ParkingSpot');
const { generateQRCode } = require('../utils/qrGenerator');
const pricingService = require('../services/pricingService');
const walletService = require('../services/walletService');

// @desc    Create new reservation
// @route   POST /api/reservations
// @access  Private
const createReservation = asyncHandler(async (req, res) => {
    const { slotId, startTime, duration } = req.body;

    // Validate input
    if (!slotId || !startTime || !duration) {
        res.status(400);
        throw new Error('Please provide slot, start time, and duration');
    }

    // Check if slot exists and is available
    const slot = await Slot.findById(slotId).populate('parkingSpot');

    if (!slot) {
        res.status(404);
        throw new Error('Slot not found');
    }

    if (slot.status !== 'empty') {
        res.status(400);
        throw new Error('Slot is not available');
    }

    // Calculate price using dynamic pricing
    const priceInfo = await pricingService.calculateDynamicPrice(
        slot.parkingSpot._id,
        new Date(startTime),
        duration,
        slot.parkingSpot.pricePerHour
    );

    // Check if user has sufficient wallet balance
    const walletInfo = await walletService.getWalletInfo(req.user._id);
    if (walletInfo.walletBalance < priceInfo.finalPrice) {
        res.status(400);
        throw new Error('Insufficient wallet balance. Please add money to your wallet.');
    }

    // Create reservation
    const reservation = await Reservation.create({
        user: req.user._id,
        slot: slotId,
        parkingSpot: slot.parkingSpot._id,
        startTime: new Date(startTime),
        duration,
        estimatedPrice: priceInfo.finalPrice,
        status: 'pending',
    });

    // Generate QR code
    const qrData = {
        reservationId: reservation._id.toString(),
        userId: req.user._id.toString(),
        slotNumber: slot.slotNumber,
        timestamp: Date.now(),
    };

    const qrCode = await generateQRCode(qrData);
    reservation.qrCode = qrCode;
    await reservation.save();

    // Update slot status to reserved
    slot.status = 'reserved';
    await slot.save();

    // Emit socket event
    if (req.io) {
        req.io.emit('slotUpdated', {
            slotId: slot._id,
            status: 'reserved',
            lastUpdated: slot.lastUpdated,
        });
    }

    // Populate before sending response
    await reservation.populate(['slot', 'parkingSpot', 'user']);

    res.status(201).json({
        success: true,
        message: 'Reservation created successfully',
        data: reservation,
        priceInfo,
    });
});

// @desc    Get user's reservations
// @route   GET /api/reservations/my
// @access  Private
const getUserReservations = asyncHandler(async (req, res) => {
    const { status } = req.query;

    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const reservations = await Reservation.find(filter)
        .populate('slot')
        .populate('parkingSpot', 'location pricePerHour')
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        count: reservations.length,
        data: reservations,
    });
});

// @desc    Get reservation by ID
// @route   GET /api/reservations/:id
// @access  Private
const getReservationById = asyncHandler(async (req, res) => {
    const reservation = await Reservation.findById(req.params.id)
        .populate('slot')
        .populate('parkingSpot')
        .populate('user', 'name email');

    if (!reservation) {
        res.status(404);
        throw new Error('Reservation not found');
    }

    // Check if user owns this reservation or is admin
    if (reservation.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to view this reservation');
    }

    res.json({
        success: true,
        data: reservation,
    });
});

// @desc    Cancel reservation
// @route   DELETE /api/reservations/:id
// @access  Private
const cancelReservation = asyncHandler(async (req, res) => {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
        res.status(404);
        throw new Error('Reservation not found');
    }

    // Check ownership
    if (reservation.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to cancel this reservation');
    }

    // Can only cancel pending or active reservations
    if (!['pending', 'active'].includes(reservation.status)) {
        res.status(400);
        throw new Error('Cannot cancel this reservation');
    }

    // Refund if payment was made
    if (reservation.paymentStatus === 'paid') {
        await walletService.addToWallet(
            req.user._id,
            reservation.estimatedPrice,
            'refund',
            { refModel: 'Reservation', refId: reservation._id },
            `Refund for cancelled reservation`
        );
    }

    // Free the slot
    await Slot.findByIdAndUpdate(reservation.slot, { status: 'empty' });

    // Update reservation status
    reservation.status = 'cancelled';
    await reservation.save();

    // Emit socket event
    if (req.io) {
        req.io.emit('slotUpdated', {
            slotId: reservation.slot,
            status: 'empty',
        });
    }

    res.json({
        success: true,
        message: 'Reservation cancelled successfully',
        data: reservation,
    });
});

// @desc    Check in to reservation (convert to active booking)
// @route   PUT /api/reservations/:id/checkin
// @access  Private
const checkInReservation = asyncHandler(async (req, res) => {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
        res.status(404);
        throw new Error('Reservation not found');
    }

    // Check ownership
    if (reservation.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized');
    }

    if (reservation.status !== 'pending') {
        res.status(400);
        throw new Error('Reservation is not in pending status');
    }

    // Deduct from wallet
    await walletService.deductFromWallet(
        reservation.user,
        reservation.estimatedPrice,
        'payment',
        { refModel: 'Reservation', refId: reservation._id },
        `Payment for parking reservation`
    );

    // Add reward points (5 points per booking)
    await walletService.addRewardPoints(
        reservation.user,
        5,
        { refModel: 'Reservation', refId: reservation._id }
    );

    // Update reservation
    reservation.status = 'active';
    reservation.entryTime = new Date();
    reservation.paymentStatus = 'paid';
    await reservation.save();

    // Update slot to occupied
    await Slot.findByIdAndUpdate(reservation.slot, { status: 'occupied' });

    // Emit socket event
    if (req.io) {
        req.io.emit('slotUpdated', {
            slotId: reservation.slot,
            status: 'occupied',
        });
    }

    res.json({
        success: true,
        message: 'Checked in successfully',
        data: reservation,
    });
});

module.exports = {
    createReservation,
    getUserReservations,
    getReservationById,
    cancelReservation,
    checkInReservation,
};
