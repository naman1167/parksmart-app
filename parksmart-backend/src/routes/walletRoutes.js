const express = require('express');
const router = express.Router();
const {
    getWalletBalance,
    getTransactionHistory,
    addMoney,
    convertPoints,
} = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');

// All wallet routes are protected (user must be logged in)
router.get('/', protect, getWalletBalance);
router.get('/transactions', protect, getTransactionHistory);
router.post('/add', protect, addMoney);
router.post('/convert-points', protect, convertPoints);

module.exports = router;
