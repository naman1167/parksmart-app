const asyncHandler = require('express-async-handler');
const Slot = require('../models/Slot');

// @desc    Get all slots
// @route   GET /api/slots
// @access  Public
const getAllSlots = asyncHandler(async (req, res) => {
    const { parkingSpot, status, floor, type } = req.query;

    const filter = {};
    if (parkingSpot) filter.parkingSpot = parkingSpot;
    if (status) filter.status = status;
    if (floor) filter.floor = floor;
    if (type) filter.type = type;

    const slots = await Slot.find(filter)
        .populate('parkingSpot', 'location.name pricePerHour')
        .sort({ slotNumber: 1 });

    res.json({
        success: true,
        count: slots.length,
        data: slots,
    });
});

// @desc    Get single slot
// @route   GET /api/slots/:id
// @access  Public
const getSlotById = asyncHandler(async (req, res) => {
    const slot = await Slot.findById(req.params.id).populate('parkingSpot');

    if (!slot) {
        res.status(404);
        throw new Error('Slot not found');
    }

    res.json({
        success: true,
        data: slot,
    });
});

// @desc    Create new slot
// @route   POST /api/slots
// @access  Private/Admin/Owner
const createSlot = asyncHandler(async (req, res) => {
    const { slotNumber, parkingSpot, floor, type } = req.body;

    // Check if slot number already exists for this parking spot
    const existingSlot = await Slot.findOne({ slotNumber, parkingSpot });
    if (existingSlot) {
        res.status(400);
        throw new Error('Slot number already exists for this parking spot');
    }

    const slot = await Slot.create({
        slotNumber,
        parkingSpot,
        floor,
        type,
        status: 'empty',
    });

    // Emit socket event for real-time update
    if (req.io) {
        req.io.emit('slotCreated', slot);
    }

    res.status(201).json({
        success: true,
        data: slot,
    });
});

// @desc    Update slot status
// @route   PUT /api/slots/:id/status
// @access  Private/Admin/Owner
const updateSlotStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    if (!['empty', 'occupied', 'reserved'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status. Must be: empty, occupied, or reserved');
    }

    const slot = await Slot.findById(req.params.id);

    if (!slot) {
        res.status(404);
        throw new Error('Slot not found');
    }

    slot.status = status;
    slot.lastUpdated = Date.now();
    await slot.save();

    // Emit socket event for real-time update
    if (req.io) {
        req.io.emit('slotUpdated', {
            slotId: slot._id,
            status: slot.status,
            lastUpdated: slot.lastUpdated,
        });
    }

    res.json({
        success: true,
        data: slot,
    });
});

// @desc    Delete slot
// @route   DELETE /api/slots/:id
// @access  Private/Admin/Owner
const deleteSlot = asyncHandler(async (req, res) => {
    const slot = await Slot.findById(req.params.id);

    if (!slot) {
        res.status(404);
        throw new Error('Slot not found');
    }

    await slot.deleteOne();

    // Emit socket event
    if (req.io) {
        req.io.emit('slotDeleted', { slotId: slot._id });
    }

    res.json({
        success: true,
        message: 'Slot deleted successfully',
    });
});

// @desc    Get slots by parking spot
// @route   GET /api/slots/parking/:parkingSpotId
// @access  Public
const getSlotsByParkingSpot = asyncHandler(async (req, res) => {
    const slots = await Slot.find({ parkingSpot: req.params.parkingSpotId })
        .sort({ floor: 1, slotNumber: 1 });

    res.json({
        success: true,
        count: slots.length,
        data: slots,
    });
});

module.exports = {
    getAllSlots,
    getSlotById,
    createSlot,
    updateSlotStatus,
    deleteSlot,
    getSlotsByParkingSpot,
};
