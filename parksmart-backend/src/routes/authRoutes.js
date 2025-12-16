const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
} = require('../controllers/authController');

const {
  protect,
  adminOnly,
} = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/me', protect, getMe);
router.get('/users', protect, adminOnly, getAllUsers);

module.exports = router;
