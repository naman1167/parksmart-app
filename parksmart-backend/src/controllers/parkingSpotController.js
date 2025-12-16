const asyncHandler = require('express-async-handler');
const ParkingSpot = require('../models/ParkingSpot');

// @desc    Get all parking spots
// @route   GET /api/spots
// @access  Public
const getAllSpots = asyncHandler(async (req, res) => {
    const { available } = req.query;

    let query = {};
    if (available === 'true') {
        query.isAvailable = true;
    }

    const spots = await ParkingSpot.find(query).sort({ createdAt: -1 });

    res.json({
        success: true,
        count: spots.length,
        data: spots,
    });
});

// @desc    Get available parking spots
// @route   GET /api/spots/available
// @access  Public
const getAvailableSpots = asyncHandler(async (req, res) => {
    const spots = await ParkingSpot.find({ isAvailable: true }).sort({
        createdAt: -1,
    });

    res.json({
        success: true,
        count: spots.length,
        data: spots,
    });
});

// @desc    Get single parking spot by ID
// @route   GET /api/spots/:id
// @access  Public
const getSpotById = asyncHandler(async (req, res) => {
    const spot = await ParkingSpot.findById(req.params.id);

    if (!spot) {
        res.status(404);
        throw new Error('Parking spot not found');
    }

    res.json({
        success: true,
        data: spot,
    });
});

// @desc    Create new parking spot
// @route   POST /api/spots
// @access  Private/Admin
const createSpot = asyncHandler(async (req, res) => {
    const { spotNumber, location, pricePerHour, isAvailable } = req.body;

    // Validation
    if (!spotNumber || !location || !pricePerHour) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    if (!location.name || !location.address) {
        res.status(400);
        throw new Error('Please provide location name and address');
    }

    // Check if spot number already exists
    const spotExists = await ParkingSpot.findOne({ spotNumber });

    if (spotExists) {
        res.status(400);
        throw new Error('Parking spot with this number already exists');
    }

    const spot = await ParkingSpot.create({
        spotNumber,
        location,
        pricePerHour,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    // Emit socket event
    if (req.io) {
        req.io.emit('spot:updated', spot);
    }

    res.status(201).json({
        success: true,
        data: spot,
    });
});

// @desc    Update parking spot
// @route   PUT /api/spots/:id
// @access  Private/Admin
const updateSpot = asyncHandler(async (req, res) => {
    let spot = await ParkingSpot.findById(req.params.id);

    if (!spot) {
        res.status(404);
        throw new Error('Parking spot not found');
    }

    spot = await ParkingSpot.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (req.io) {
        req.io.emit('spot:updated', spot);
    }

    res.json({
        success: true,
        data: spot,
    });
});

// @desc    Delete parking spot
// @route   DELETE /api/spots/:id
// @access  Private/Admin
const deleteSpot = asyncHandler(async (req, res) => {
    const spot = await ParkingSpot.findById(req.params.id);

    if (!spot) {
        res.status(404);
        throw new Error('Parking spot not found');
    }

    await spot.deleteOne();

    if (req.io) {
        req.io.emit('spot:updated', { _id: req.params.id, deleted: true });
    }

    res.json({
        success: true,
        message: 'Parking spot deleted successfully',
    });
});

module.exports = {
    getAllSpots,
    getAvailableSpots,
    getSpotById,
    createSpot,
    updateSpot,
    deleteSpot,
};

