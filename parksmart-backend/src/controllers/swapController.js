const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');

// @desc    Create a swap request (Leaving or Looking)
// @route   POST /api/swap
// @access  Private
exports.createSwapRequest = async (req, res) => {
    try {
        const { type, location, spotDetails, askingPrice } = req.body;

        // Validation for geospatial data
        if (!location || !location.coordinates || location.coordinates.length !== 2) {
            return res.status(400).json({ message: 'Valid location coordinates are required.' });
        }

        const swapRequest = await SwapRequest.create({
            user: req.user._id,
            type,
            location: {
                type: 'Point',
                coordinates: location.coordinates
            },
            spotDetails,
            askingPrice: askingPrice || 50
        });

        // Broadcast to nearby matching users via Socket.IO
        // Logic: If 'leaving', find 'looking' users nearby. If 'looking', find 'leaving' users.
        const matchType = type === 'leaving' ? 'looking' : 'leaving';

        // Find potential matches in DB (optional, mainly for initial load)
        const nearbyMatches = await SwapRequest.find({
            type: matchType,
            status: 'pending',
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: location.coordinates
                    },
                    $maxDistance: 2000 // 2km radius
                }
            }
        });

        // Notify creator of immediate matches
        // Also broadcast this new request to the room 'swap-updates' (clients subscribe based on region ideally, but global for now)
        req.io.emit('swap:new', swapRequest);

        res.status(201).json({ success: true, data: swapRequest, matches: nearbyMatches });
    } catch (error) {
        console.error('Create Swap Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get nearby active swap requests
// @route   GET /api/swap/nearby
// @access  Private
exports.getNearbySwaps = async (req, res) => {
    try {
        const { lng, lat, type } = req.query;

        if (!lng || !lat) {
            return res.status(400).json({ message: 'Longitude and Latitude are required.' });
        }

        const query = {
            status: 'pending',
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: 2000 // 2km
                }
            }
        };

        if (type) {
            query.type = type;
        }

        const swaps = await SwapRequest.find(query)
            .populate('user', 'name')
            .limit(20);

        res.status(200).json({ success: true, count: swaps.length, data: swaps });
    } catch (error) {
        console.error('Get Nearby Swaps Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Initiate a handshake/match
// @route   POST /api/swap/:id/match
// @access  Private
exports.matchSwapRequest = async (req, res) => {
    try {
        const swapId = req.params.id;
        const userId = req.user._id;

        const swapRequest = await SwapRequest.findById(swapId);

        if (!swapRequest) {
            return res.status(404).json({ message: 'Swap request not found' });
        }

        if (swapRequest.status !== 'pending') {
            return res.status(400).json({ message: 'Swap request already matched or expired' });
        }

        if (swapRequest.user.toString() === userId.toString()) {
            return res.status(400).json({ message: 'Cannot match with your own request' });
        }

        // Update status to 'matched'
        swapRequest.status = 'matched';
        swapRequest.matchedWith = userId;
        await swapRequest.save();

        // Notify the original owner
        // In a real app, users would join a personal socket room. 
        // For simplicity, broadcasting with IDs.
        req.io.emit('swap:matched', {
            swapId: swapRequest._id,
            matchedBy: userId,
            ownerId: swapRequest.user
        });

        res.status(200).json({ success: true, data: swapRequest });
    } catch (error) {
        console.error('Match Swap Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Confirm and Complete Swap (Transfer Credits)
// @route   POST /api/swap/:id/complete
// @access  Private
exports.completeSwap = async (req, res) => {
    try {
        // Only the 'leaving' user (Seller) should probably confirm "I have left"
        // Or the 'looking' user (Buyer) confirms "I have parked"
        // Let's assume Buyer triggers completion to pay.

        const swapId = req.params.id;
        const buyerId = req.user._id;

        const swapRequest = await SwapRequest.findById(swapId);

        if (!swapRequest || swapRequest.status !== 'matched') {
            return res.status(400).json({ message: 'Invalid swap status' });
        }

        // Identify Seller and Buyer
        // If request type was 'leaving', user is Seller, matchedWith is Buyer
        // If request type was 'looking', user is Buyer, matchedWith is Seller

        let sellerId, finalBuyerId;

        if (swapRequest.type === 'leaving') {
            sellerId = swapRequest.user;
            finalBuyerId = swapRequest.matchedWith;
        } else {
            sellerId = swapRequest.matchedWith;
            finalBuyerId = swapRequest.user;
        }

        if (buyerId.toString() !== finalBuyerId.toString()) {
            return res.status(403).json({ message: 'Only the buyer can complete the transaction' });
        }

        // Transaction Logic
        const amount = swapRequest.askingPrice;

        const buyer = await User.findById(finalBuyerId);
        const seller = await User.findById(sellerId);

        if (buyer.walletBalance < amount) {
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        buyer.walletBalance -= amount;
        seller.walletBalance += amount;

        await buyer.save();
        await seller.save();

        swapRequest.status = 'completed';
        await swapRequest.save();

        req.io.emit('swap:completed', { swapId, amount });

        res.status(200).json({ success: true, message: 'Swap completed and funds transferred' });

    } catch (error) {
        console.error('Complete Swap Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
