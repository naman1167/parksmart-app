const PanicRequest = require('../models/PanicRequest');
const Booking = require('../models/Booking');

// @desc    Create a panic request
// @route   POST /api/panic
// @access  Private (User who has the booking)
exports.createPanicRequest = async (req, res) => {
    try {
        const { bookingId, issueType, message, location } = req.body;

        const booking = await Booking.findById(bookingId).populate('spot');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Verify user owns the booking
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized for this booking' });
        }

        // Check for existing active panic request for this booking
        const existingPanic = await PanicRequest.findOne({
            booking: bookingId,
            status: 'Active'
        });

        if (existingPanic) {
            return res.status(400).json({ message: 'Active panic request already exists for this booking' });
        }

        const panicRequest = await PanicRequest.create({
            user: req.user._id,
            booking: bookingId,
            spot: booking.spot._id,
            issueType,
            message,
            location
        });

        // Populate specific fields for the socket event
        const populatedPanic = await PanicRequest.findById(panicRequest._id)
            .populate('user', 'name email')
            .populate('spot', 'spotNumber location');

        // Emit socket event to Admins
        // Using req.io since it's attached in server.js middleware
        req.io.emit('panic:new', populatedPanic);

        res.status(201).json({ success: true, data: panicRequest });
    } catch (error) {
        console.error('Create Panic Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all active panic requests
// @route   GET /api/panic/active
// @access  Private (Admin)
exports.getActivePanicRequests = async (req, res) => {
    try {
        const requests = await PanicRequest.find({ status: 'Active' })
            .populate('user', 'name email') // Removed phone as it might not exist in User model
            .populate('spot', 'spotNumber location')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (error) {
        console.error('Get Panic Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Resolve a panic request
// @route   PATCH /api/panic/:id/resolve
// @access  Private (Admin)
exports.resolvePanicRequest = async (req, res) => {
    try {
        const { adminNotes } = req.body;

        const panicRequest = await PanicRequest.findById(req.params.id);

        if (!panicRequest) {
            return res.status(404).json({ message: 'Panic request not found' });
        }

        if (panicRequest.status === 'Resolved') {
            return res.status(400).json({ message: 'Request already resolved' });
        }

        panicRequest.status = 'Resolved';
        panicRequest.resolvedAt = Date.now();
        panicRequest.adminNotes = adminNotes;

        await panicRequest.save();

        // Notify admins (and potentially the user)
        req.io.emit('panic:resolved', panicRequest._id);

        res.status(200).json({ success: true, data: panicRequest });
    } catch (error) {
        console.error('Resolve Panic Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
