const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    getAllBookings,
    updateBookingStatus,
    getBookingByBatchId,
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All booking routes require authentication
router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/batch/:batchId', protect, getBookingByBatchId);
router.put('/:id', protect, updateBookingStatus);

// Admin only
router.get('/all', protect, adminOnly, getAllBookings);

module.exports = router;
