const Message = require('../models/Message');
const SwapRequest = require('../models/SwapRequest');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const { swapId, content, receiverId } = req.body;
        const senderId = req.user._id;

        const message = await Message.create({
            sender: senderId,
            receiver: receiverId,
            swapRequest: swapId,
            content
        });

        // Emit socket event for real-time update
        // We emit to the specific swap room or user
        req.io.emit('chat:message', {
            _id: message._id,
            swapId,
            sender: senderId,
            receiver: receiverId,
            content,
            createdAt: message.createdAt
        });

        res.status(201).json({ success: true, data: message });
    } catch (error) {
        console.error('Send Message Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get messages for a swap
// @route   GET /api/messages/:swapId
// @access  Private
exports.getMessages = async (req, res) => {
    try {
        const { swapId } = req.params;

        const messages = await Message.find({ swapRequest: swapId })
            .sort({ createdAt: 1 }); // Oldest first

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        console.error('Get Messages Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
