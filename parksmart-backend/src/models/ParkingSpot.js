const mongoose = require('mongoose');

const parkingSpotSchema = new mongoose.Schema(
    {
        spotNumber: {
            type: String,
            required: [true, 'Please provide a spot number'],
            unique: true,
            trim: true,
        },
        location: {
            name: {
                type: String,
                required: [true, 'Please provide a location name'],
                trim: true,
            },
            address: {
                type: String,
                required: [true, 'Please provide an address'],
                trim: true,
            },
            coordinates: {
                type: {
                    type: String,
                    enum: ['Point'],
                    default: 'Point',
                },
                coordinates: {
                    type: [Number], // [longitude, latitude]
                    required: false,
                },
            },
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        pricePerHour: {
            type: Number,
            required: [true, 'Please provide a price per hour'],
            min: [0, 'Price cannot be negative'],
        },
        difficultyLevel: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard'],
            default: 'Easy',
        },
        difficultyReasons: {
            type: [String],
            default: [],
        },
        difficultyNotes: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Create geospatial index for location-based queries
parkingSpotSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('ParkingSpot', parkingSpotSchema);
