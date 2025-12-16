const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createSwapRequest,
    getNearbySwaps,
    matchSwapRequest,
    completeSwap
} = require('../controllers/swapController');

router.post('/', protect, createSwapRequest);
router.get('/nearby', protect, getNearbySwaps);
router.post('/:id/match', protect, matchSwapRequest);
router.post('/:id/complete', protect, completeSwap);

module.exports = router;
