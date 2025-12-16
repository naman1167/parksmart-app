const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const Slot = require('../models/Slot');
const mongoose = require('mongoose');

// @desc    Get today's revenue
// @route   GET /api/analytics/revenue
// @access  Private/Admin
const getTodayRevenue = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().setHours(0, 0, 0, 0));
    const end = endDate ? new Date(endDate) : new Date(new Date().setHours(23, 59, 59, 999));

    // Aggregate from both Booking and Reservation collections
    const bookingRevenue = await Booking.aggregate([
        {
            $match: {
                createdAt: { $gte: start, $lte: end },
                status: { $ne: 'cancelled' },
            },
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$amountPaid' },
                count: { $sum: 1 },
            },
        },
    ]);

    const reservationRevenue = await Reservation.aggregate([
        {
            $match: {
                createdAt: { $gte: start, $lte: end },
                paymentStatus: 'paid',
                status: { $ne: 'cancelled' },
            },
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$finalPrice' },
                count: { $sum: 1 },
            },
        },
    ]);

    const bookingTotal = bookingRevenue[0] || { totalRevenue: 0, count: 0 };
    const reservationTotal = reservationRevenue[0] || { totalRevenue: 0, count: 0 };

    res.json({
        success: true,
        data: {
            totalRevenue: bookingTotal.totalRevenue + reservationTotal.totalRevenue,
            bookings: bookingTotal.count,
            reservations: reservationTotal.count,
            period: { start, end },
        },
    });
});

// @desc    Get total bookings stats
// @route   GET /api/analytics/bookings
// @access  Private/Admin
const getTotalBookings = asyncHandler(async (req, res) => {
    const totalBookings = await Booking.countDocuments();
    const totalReservations = await Reservation.countDocuments();

    const activeBookings = await Booking.countDocuments({ status: 'active' });
    const activeReservations = await Reservation.countDocuments({ status: 'active' });

    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const completedReservations = await Reservation.countDocuments({ status: 'completed' });

    res.json({
        success: true,
        data: {
            total: totalBookings + totalReservations,
            active: activeBookings + activeReservations,
            completed: completedBookings + completedReservations,
            bookings: totalBookings,
            reservations: totalReservations,
        },
    });
});

// @desc    Get slot occupancy stats
// @route   GET /api/analytics/occupancy
// @access  Private/Admin
const getSlotOccupancy = asyncHandler(async (req, res) => {
    const totalSlots = await Slot.countDocuments();
    const emptySlots = await Slot.countDocuments({ status: 'empty' });
    const occupiedSlots = await Slot.countDocuments({ status: 'occupied' });
    const reservedSlots = await Slot.countDocuments({ status: 'reserved' });

    const occupancyRate = totalSlots > 0 ? ((occupiedSlots + reservedSlots) / totalSlots) * 100 : 0;

    res.json({
        success: true,
        data: {
            total: totalSlots,
            empty: emptySlots,
            occupied: occupiedSlots,
            reserved: reservedSlots,
            occupancyRate: parseFloat(occupancyRate.toFixed(2)),
        },
    });
});

// @desc    Get hourly traffic
// @route   GET /api/analytics/traffic
// @access  Private/Admin
const getHourlyTraffic = asyncHandler(async (req, res) => {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const traffic = await Reservation.aggregate([
        {
            $match: {
                createdAt: { $gte: startOfDay, $lte: endOfDay },
            },
        },
        {
            $group: {
                _id: { $hour: '$createdAt' },
                count: { $sum: 1 },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);

    // Fill in missing hours with 0
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
        const found = traffic.find(t => t._id === hour);
        return {
            hour,
            count: found ? found.count : 0,
        };
    });

    res.json({
        success: true,
        data: hourlyData,
    });
});

// @desc    Get user registration stats
// @route   GET /api/analytics/users
// @access  Private/Admin
const getUserStats = asyncHandler(async (req, res) => {
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const userStats = await User.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
            },
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' },
                },
                count: { $sum: 1 },
            },
        },
        {
            $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
        },
    ]);

    const totalUsers = await User.countDocuments();
    const roleDistribution = await User.aggregate([
        {
            $group: {
                _id: '$role',
                count: { $sum: 1 },
            },
        },
    ]);

    res.json({
        success: true,
        data: {
            total: totalUsers,
            registrationsByDay: userStats,
            roleDistribution,
        },
    });
});

// @desc    Get recent activity (bookings and users)
// @route   GET /api/analytics/activity
// @access  Private/Admin
const getRecentActivity = asyncHandler(async (req, res) => {
    // Fetch last 5 bookings with user and spot details
    const recentBookings = await Booking.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email')
        .populate('spot', 'spotNumber location');

    // Fetch last 5 new users
    const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role createdAt');

    // Combine and standardize
    const activities = [
        ...recentBookings.map(booking => ({
            type: 'booking',
            id: booking._id,
            title: 'New booking created',
            description: `Spot ${booking.spot?.spotNumber || 'Unknown'} booked by ${booking.user?.name || 'Unknown User'}`,
            timestamp: booking.createdAt,
            color: 'green'
        })),
        ...recentUsers.map(user => ({
            type: 'user',
            id: user._id,
            title: 'New user registered',
            description: `${user.email} joined ParkSmart`,
            timestamp: user.createdAt,
            color: 'blue'
        }))
    ];

    // Sort combined list by timestamp desc and take top 10
    const sortedActivity = activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);

    res.json({
        success: true,
        data: sortedActivity,
    });
});

module.exports = {
    getTodayRevenue,
    getTotalBookings,
    getSlotOccupancy,
    getHourlyTraffic,
    getUserStats,
    getRecentActivity,
};
