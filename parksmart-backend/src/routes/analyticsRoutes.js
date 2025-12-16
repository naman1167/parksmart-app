const express = require('express');
const router = express.Router();
const {
    getTodayRevenue,
    getTotalBookings,
    getSlotOccupancy,
    getHourlyTraffic,
    getUserStats,
    getRecentActivity,
} = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All analytics routes are admin only
router.get('/revenue', protect, adminOnly, getTodayRevenue);
router.get('/bookings', protect, adminOnly, getTotalBookings);
router.get('/occupancy', protect, adminOnly, getSlotOccupancy);
router.get('/traffic', protect, adminOnly, getHourlyTraffic);
router.get('/users', protect, adminOnly, getUserStats);
router.get('/activity', protect, adminOnly, getRecentActivity);

module.exports = router;
