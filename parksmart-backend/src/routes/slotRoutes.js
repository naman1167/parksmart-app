const express = require('express');
const router = express.Router();
const {
    getAllSlots,
    getSlotById,
    createSlot,
    updateSlotStatus,
    deleteSlot,
    getSlotsByParkingSpot,
} = require('../controllers/slotController');
const { protect, roleMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllSlots);
router.get('/parking/:parkingSpotId', getSlotsByParkingSpot);
router.get('/:id', getSlotById);

// Protected routes - Admin/Owner only
router.post('/', protect, roleMiddleware(['admin', 'owner']), createSlot);
router.put('/:id/status', protect, roleMiddleware(['admin', 'owner']), updateSlotStatus);
router.delete('/:id', protect, roleMiddleware(['admin', 'owner']), deleteSlot);

module.exports = router;
