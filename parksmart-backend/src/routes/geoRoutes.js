const express = require('express');
const router = express.Router();
const {
    getNearbyParkings,
    searchParkings,
} = require('../controllers/geoController');

// Public routes for finding parking spots
router.get('/nearby', getNearbyParkings);
router.get('/search', searchParkings);

module.exports = router;
