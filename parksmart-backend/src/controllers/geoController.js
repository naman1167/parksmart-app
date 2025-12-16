const asyncHandler = require('express-async-handler');
const ParkingSpot = require('../models/ParkingSpot');
const Slot = require('../models/Slot');

// @desc    Get nearby parking spots
// @route   GET /api/parkings/nearby
// @access  Public
const getNearbyParkings = asyncHandler(async (req, res) => {
    const { lat, lng, maxDistance = 5000 } = req.query; // maxDistance in meters, default 5km

    if (!lat || !lng) {
        res.status(400);
        throw new Error('Please provide latitude and longitude');
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
        res.status(400);
        throw new Error('Invalid coordinates');
    }

    // Find nearby parking spots using geospatial query
    const parkingSpots = await ParkingSpot.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [longitude, latitude],
                },
                distanceField: 'distance',
                maxDistance: parseInt(maxDistance),
                spherical: true,
            },
        },
        {
            $limit: 20,
        },
    ]);

    // Get slot availability for each parking spot
    const parkingSpotsWithSlots = await Promise.all(
        parkingSpots.map(async (spot) => {
            const totalSlots = await Slot.countDocuments({ parkingSpot: spot._id });
            const availableSlots = await Slot.countDocuments({
                parkingSpot: spot._id,
                status: 'empty',
            });

            return {
                ...spot,
                totalSlots,
                availableSlots,
                occupancyRate: totalSlots > 0 ? ((totalSlots - availableSlots) / totalSlots) * 100 : 0,
                distanceKm: (spot.distance / 1000).toFixed(2),
            };
        })
    );

    res.json({
        success: true,
        count: parkingSpotsWithSlots.length,
        data: parkingSpotsWithSlots,
    });
});

// @desc    Get parking spots with filters
// @route   GET /api/parkings/search
// @access  Public
const searchParkings = asyncHandler(async (req, res) => {
    const { minPrice, maxPrice, hasAvailableSlots } = req.query;

    const filter = {};

    if (minPrice || maxPrice) {
        filter.pricePerHour = {};
        if (minPrice) filter.pricePerHour.$gte = parseFloat(minPrice);
        if (maxPrice) filter.pricePerHour.$lte = parseFloat(maxPrice);
    }

    let parkingSpots = await ParkingSpot.find(filter);

    // Filter by availability if requested
    if (hasAvailableSlots === 'true') {
        const parkingWithSlots = await Promise.all(
            parkingSpots.map(async (spot) => {
                const availableSlots = await Slot.countDocuments({
                    parkingSpot: spot._id,
                    status: 'empty',
                });
                return availableSlots > 0 ? spot : null;
            })
        );
        parkingSpots = parkingWithSlots.filter(spot => spot !== null);
    }

    res.json({
        success: true,
        count: parkingSpots.length,
        data: parkingSpots,
    });
});

module.exports = {
    getNearbyParkings,
    searchParkings,
};
