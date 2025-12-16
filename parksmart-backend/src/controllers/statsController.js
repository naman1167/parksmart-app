const asyncHandler = require('express-async-handler');
const ParkingSpot = require('../models/ParkingSpot');
const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/stats/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    // Get total parking spots
    const totalSpots = await ParkingSpot.countDocuments();

    // Get total bookings
    const totalBookings = await Booking.countDocuments();

    // Get active users (users who have made at least one booking)
    const activeUsersCount = await Booking.distinct('user').then(users => users.length);

    // Calculate total revenue from all completed and active bookings
    const revenueData = await Booking.aggregate([
        {
            $match: {
                status: { $in: ['active', 'completed'] }
            }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$amountPaid' }
            }
        }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Get available spots count
    const availableSpots = await ParkingSpot.countDocuments({ isAvailable: true });

    // Get active bookings count
    const activeBookings = await Booking.countDocuments({ status: 'active' });

    res.json({
        success: true,
        data: {
            totalSpots,
            totalBookings,
            activeUsers: activeUsersCount,
            totalRevenue,
            availableSpots,
            activeBookings,
            updatedAt: new Date().toISOString()
        }
    });
});

module.exports = {
    getDashboardStats,
};
