const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const ParkingSpot = require('../models/ParkingSpot');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
    const { spot, startTime, endTime, amountPaid, paymentId, orderId, paymentSignature, paymentStatus, vehicleNumber } = req.body;

    // Validation
    if (!spot || !startTime || !endTime || !amountPaid || !vehicleNumber) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    // Check if parking spot exists
    const parkingSpot = await ParkingSpot.findById(spot);

    if (!parkingSpot) {
        res.status(404);
        throw new Error('Parking spot not found');
    }

    // Check if spot is available
    if (!parkingSpot.isAvailable) {
        res.status(400);
        throw new Error('This parking spot is not available');
    }

    // Generate Reference Code (Batch ID)
    const referenceCode = 'ORD-' + Date.now().toString().slice(-6) + Math.random().toString(36).substring(2, 5).toUpperCase();

    // Create booking
    const booking = await Booking.create({
        user: req.user._id,
        spot,
        startTime,
        endTime,
        amountPaid,
        amountPaid,
        referenceCode,
        paymentId,
        orderId,
        paymentSignature,
        paymentStatus: paymentStatus || 'pending',
        vehicleNumber,
    });

    // Optionally update spot availability
    // parkingSpot.isAvailable = false;
    // await parkingSpot.save();

    const populatedBooking = await Booking.findById(booking._id)
        .populate('user', 'name email')
        .populate('spot');

    // Emit socket events
    if (req.io) {
        req.io.emit('booking:new', populatedBooking);
        req.io.emit('spot:updated', { _id: spot });
    }

    res.status(201).json({
        success: true,
        data: populatedBooking,
    });
});

// @desc    Get logged-in user's bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id })
        .populate('spot')
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        count: bookings.length,
        data: bookings,
    });
});

// @desc    Get all bookings
// @route   GET /api/bookings/all
// @access  Private/Admin
const getAllBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find()
        .populate('user', 'name email role')
        .populate('spot')
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        count: bookings.length,
        data: bookings,
    });
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private
const updateBookingStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    if (!status || !['active', 'completed', 'cancelled'].includes(status)) {
        res.status(400);
        throw new Error('Please provide a valid status');
    }

    let booking = await Booking.findById(req.params.id);

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    // Check if user owns this booking or is admin
    if (
        booking.user.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin'
    ) {
        res.status(403);
        throw new Error('Not authorized to update this booking');
    }

    booking.status = status;
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
        .populate('user', 'name email')
        .populate('spot');

    res.json({
        success: true,
        data: populatedBooking,
    });
});

// @desc    Get booking by batch ID (reference code)
// @route   GET /api/bookings/batch/:batchId
// @access  Private
const getBookingByBatchId = asyncHandler(async (req, res) => {
    const { batchId } = req.params;

    const booking = await Booking.findOne({ referenceCode: batchId })
        .populate('user', 'name email')
        .populate('spot');

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found with this Batch ID');
    }

    // Check if user owns this booking or is admin
    if (
        booking.user._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin'
    ) {
        res.status(403);
        throw new Error('Not authorized to view this booking');
    }

    res.json({
        success: true,
        data: booking,
    });
});

module.exports = {
    createBooking,
    getMyBookings,
    getAllBookings,
    updateBookingStatus,
    getBookingByBatchId,
};



