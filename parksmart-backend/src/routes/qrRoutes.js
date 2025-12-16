const express = require('express');
const router = express.Router();
const {
    validateEntryQR,
    validateExitQR,
} = require('../controllers/qrController');
const { protect, roleMiddleware } = require('../middleware/authMiddleware');

// QR validation routes - Admin/Owner only
router.post('/entry', protect, roleMiddleware(['admin', 'owner']), validateEntryQR);
router.post('/exit', protect, roleMiddleware(['admin', 'owner']), validateExitQR);

module.exports = router;
