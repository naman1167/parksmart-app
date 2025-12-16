const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * @desc    Protect routes (JWT required)
 */
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Authorization: Bearer <token>
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        token = req.headers.authorization.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                res.status(401);
                throw new Error('User not found');
            }

            req.user = user;
            return next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized, token invalid');
        }
    }

    // ❗ IMPORTANT: return here
    res.status(401);
    throw new Error('Not authorized, no token');
});

/**
 * @desc    Admin-only access
 */
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }

    res.status(403);
    throw new Error('Admin access only');
};

/**
 * @desc    Role-based access (optional)
 */
const roleMiddleware = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401);
            throw new Error('Not authenticated');
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403);
            throw new Error(
                `Access denied. Allowed roles: ${allowedRoles.join(', ')}`
            );
        }

        next();
    };
};

module.exports = {
    protect,
    adminOnly,
    roleMiddleware,
};
