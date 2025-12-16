const express = require('express');
const router = express.Router();
const {
    createPricingRule,
    getAllRules,
    getRuleById,
    updatePricingRule,
    deletePricingRule,
    calculatePrice,
} = require('../controllers/pricingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public route for price calculation
router.post('/calculate', calculatePrice);

// Admin only routes
router.post('/rules', protect, adminOnly, createPricingRule);
router.get('/rules', protect, adminOnly, getAllRules);
router.get('/rules/:id', protect, adminOnly, getRuleById);
router.put('/rules/:id', protect, adminOnly, updatePricingRule);
router.delete('/rules/:id', protect, adminOnly, deletePricingRule);

module.exports = router;
