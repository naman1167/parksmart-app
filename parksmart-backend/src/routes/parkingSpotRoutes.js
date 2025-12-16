const express = require('express');
const router = express.Router();
const {
    getAllSpots,
    getAvailableSpots,
    getSpotById,
    createSpot,
    updateSpot,
    deleteSpot,
} = require('../controllers/parkingSpotController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllSpots);
router.get('/available', getAvailableSpots);
router.get('/:id', getSpotById);

// Admin only routes
router.post('/', protect, adminOnly, createSpot);
router.put('/:id', protect, adminOnly, updateSpot);
router.delete('/:id', protect, adminOnly, deleteSpot);

module.exports = router;
