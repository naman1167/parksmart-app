const express = require('express');
const router = express.Router();
const {
    createReservation,
    getUserReservations,
    getReservationById,
    cancelReservation,
    checkInReservation,
} = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');

// All reservation routes are protected
router.post('/', protect, createReservation);
router.get('/my', protect, getUserReservations);
router.get('/:id', protect, getReservationById);
router.delete('/:id', protect, cancelReservation);
router.put('/:id/checkin', protect, checkInReservation);

module.exports = router;
