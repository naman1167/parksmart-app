const express = require('express');
const router = express.Router();

const {
    registerUser,
    loginUser,
    getMe,
    getAllUsers,
} = require('../controllers/authController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

/**
 * ✅ IMPORTANT:
 * Explicit OPTIONS handler to avoid CORS issues on auth routes
 * (especially /login from Vercel)
 */
router.options('*', (req, res) => {
    res.sendStatus(204);
});

/**
 * @route   POST /api/auth/register
 * @access  Public
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/auth/login
 * @access  Public
 */
router.post('/login', loginUser);

/**
 * @route   GET /api/auth/me
 * @access  Private
 */
router.get('/me', protect, getMe);

/**
 * @route   GET /api/auth/users
 * @access  Private (Admin)
 */
router.get('/users', protect, adminOnly, getAllUsers);

module.exports = router;
