const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { createPanicRequest, getActivePanicRequests, resolvePanicRequest } = require('../controllers/panicController');

router.post('/', protect, createPanicRequest);
router.get('/active', protect, adminOnly, getActivePanicRequests);
router.patch('/:id/resolve', protect, adminOnly, resolvePanicRequest);

module.exports = router;
