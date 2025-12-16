const asyncHandler = require('express-async-handler');
const PricingRule = require('../models/PricingRule');
const pricingService = require('../services/pricingService');

// @desc    Create pricing rule
// @route   POST /api/pricing/rules
// @access  Private/Admin
const createPricingRule = asyncHandler(async (req, res) => {
    const { name, description, peakHours, multiplier, daysOfWeek, parkingSpot, priority } = req.body;

    const rule = await PricingRule.create({
        name,
        description,
        peakHours,
        multiplier,
        daysOfWeek,
        parkingSpot,
        priority: priority || 0,
        isActive: true,
    });

    res.status(201).json({
        success: true,
        data: rule,
    });
});

// @desc    Get all pricing rules
// @route   GET /api/pricing/rules
// @access  Private/Admin
const getAllRules = asyncHandler(async (req, res) => {
    const { isActive, parkingSpot } = req.query;

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (parkingSpot) filter.parkingSpot = parkingSpot;

    const rules = await PricingRule.find(filter)
        .populate('parkingSpot', 'location.name')
        .sort({ priority: -1, createdAt: -1 });

    res.json({
        success: true,
        count: rules.length,
        data: rules,
    });
});

// @desc    Get pricing rule by ID
// @route   GET /api/pricing/rules/:id
// @access  Private/Admin
const getRuleById = asyncHandler(async (req, res) => {
    const rule = await PricingRule.findById(req.params.id).populate('parkingSpot');

    if (!rule) {
        res.status(404);
        throw new Error('Pricing rule not found');
    }

    res.json({
        success: true,
        data: rule,
    });
});

// @desc    Update pricing rule
// @route   PUT /api/pricing/rules/:id
// @access  Private/Admin
const updatePricingRule = asyncHandler(async (req, res) => {
    const rule = await PricingRule.findById(req.params.id);

    if (!rule) {
        res.status(404);
        throw new Error('Pricing rule not found');
    }

    const { name, description, peakHours, multiplier, daysOfWeek, isActive, priority } = req.body;

    if (name !== undefined) rule.name = name;
    if (description !== undefined) rule.description = description;
    if (peakHours !== undefined) rule.peakHours = peakHours;
    if (multiplier !== undefined) rule.multiplier = multiplier;
    if (daysOfWeek !== undefined) rule.daysOfWeek = daysOfWeek;
    if (isActive !== undefined) rule.isActive = isActive;
    if (priority !== undefined) rule.priority = priority;

    await rule.save();

    res.json({
        success: true,
        data: rule,
    });
});

// @desc    Delete pricing rule
// @route   DELETE /api/pricing/rules/:id
// @access  Private/Admin
const deletePricingRule = asyncHandler(async (req, res) => {
    const rule = await PricingRule.findById(req.params.id);

    if (!rule) {
        res.status(404);
        throw new Error('Pricing rule not found');
    }

    await rule.deleteOne();

    res.json({
        success: true,
        message: 'Pricing rule deleted successfully',
    });
});

// @desc    Calculate price for given parameters
// @route   POST /api/pricing/calculate
// @access  Public
const calculatePrice = asyncHandler(async (req, res) => {
    const { parkingSpotId, startTime, duration, basePrice } = req.body;

    if (!parkingSpotId || !startTime || !duration || !basePrice) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    const priceInfo = await pricingService.calculateDynamicPrice(
        parkingSpotId,
        new Date(startTime),
        duration,
        basePrice
    );

    res.json({
        success: true,
        data: priceInfo,
    });
});

module.exports = {
    createPricingRule,
    getAllRules,
    getRuleById,
    updatePricingRule,
    deletePricingRule,
    calculatePrice,
};
