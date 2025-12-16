require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const ParkingSpot = require('../models/ParkingSpot');
const Booking = require('../models/Booking');

// Sample data
const users = [
    {
        name: 'Admin User',
        email: 'admin@parksmart.com',
        password: 'admin123',
        role: 'admin',
    },
    {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user',
    },
    {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'user',
    },
];

const parkingSpots = [
    // Navi Mumbai Spots
    {
        spotNumber: 'NM-101',
        location: {
            name: 'Inorbit Mall, Vashi',
            address: 'Palm Beach Rd, Vashi, Navi Mumbai',
            coordinates: {
                type: 'Point',
                coordinates: [72.9978, 19.0660],
            },
        },
        isAvailable: true,
        pricePerHour: 50,
    },
    {
        spotNumber: 'NM-102',
        location: {
            name: 'Inorbit Mall, Vashi',
            address: 'Palm Beach Rd, Vashi, Navi Mumbai',
            coordinates: {
                type: 'Point',
                coordinates: [72.9979, 19.0661],
            },
        },
        isAvailable: false,
        pricePerHour: 50,
    },
    {
        spotNumber: 'NM-201',
        location: {
            name: 'Seawoods Grand Central',
            address: 'Seawoods Station Rd, Nerul, Navi Mumbai',
            coordinates: {
                type: 'Point',
                coordinates: [73.0186, 19.0213],
            },
        },
        isAvailable: true,
        pricePerHour: 60,
    },
    {
        spotNumber: 'NM-301',
        location: {
            name: 'DY Patil Stadium',
            address: 'Sector 7, Nerul, Navi Mumbai',
            coordinates: {
                type: 'Point',
                coordinates: [73.0270, 19.0435],
            },
        },
        isAvailable: true,
        pricePerHour: 100,
    },
    {
        spotNumber: 'NM-401',
        location: {
            name: 'Belapur CBD',
            address: 'Sector 15, CBD Belapur, Navi Mumbai',
            coordinates: {
                type: 'Point',
                coordinates: [73.0388, 19.0188],
            },
        },
        isAvailable: true,
        pricePerHour: 40,
    },

    // Mumbai Spots
    {
        spotNumber: 'M-501',
        location: {
            name: 'Phoenix Market City',
            address: 'LBS Marg, Kurla West, Mumbai',
            coordinates: {
                type: 'Point',
                coordinates: [72.8888, 19.0865],
            },
        },
        isAvailable: true,
        pricePerHour: 80,
    },
    {
        spotNumber: 'M-601',
        location: {
            name: 'Bandra-Kurla Complex',
            address: 'G Block BKC, Bandra East, Mumbai',
            coordinates: {
                type: 'Point',
                coordinates: [72.8777, 19.0607],
            },
        },
        isAvailable: true,
        pricePerHour: 120,
    },
    {
        spotNumber: 'M-701',
        location: {
            name: 'Chhatrapati Shivaji Maharaj Airport',
            address: 'T2 Terminal, Andheri East, Mumbai',
            coordinates: {
                type: 'Point',
                coordinates: [72.8679, 19.0886],
            },
        },
        isAvailable: true,
        pricePerHour: 200,
    },
    {
        spotNumber: 'M-702',
        location: {
            name: 'Chhatrapati Shivaji Maharaj Airport',
            address: 'T2 Terminal, Andheri East, Mumbai',
            coordinates: {
                type: 'Point',
                coordinates: [72.8680, 19.0887],
            },
        },
        isAvailable: false,
        pricePerHour: 200,
    },
    {
        spotNumber: 'M-801',
        location: {
            name: 'Juhu Beach Parking',
            address: 'Juhu Tara Rd, Juhu, Mumbai',
            coordinates: {
                type: 'Point',
                coordinates: [72.8267, 19.1024],
            },
        },
        isAvailable: true,
        pricePerHour: 70,
    },
];

// Seed database
const seedDatabase = async () => {
    try {
        // Connect to database
        await connectDB();

        console.log('🗑️  Clearing existing data...');

        // Clear existing data
        await User.deleteMany();
        await ParkingSpot.deleteMany();
        await Booking.deleteMany();

        console.log('👥 Creating users...');

        // Create users with hashed passwords
        const usersWithHashedPasswords = await Promise.all(users.map(async (user) => {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);
            return { ...user, password: hashedPassword };
        }));

        const createdUsers = await User.insertMany(usersWithHashedPasswords);
        console.log(`✅ ${createdUsers.length} users created`);

        console.log('🅿️  Creating parking spots...');

        // Create parking spots
        const createdSpots = await ParkingSpot.insertMany(parkingSpots);
        console.log(`✅ ${createdSpots.length} parking spots created`);

        // Create sample bookings
        
        const bookings = [
            {
                user: createdUsers[1]._id,
                spot: createdSpots[2]._id,
                startTime: new Date('2024-12-08T10:00:00'),
                endTime: new Date('2024-12-08T14:00:00'),
                amountPaid: 40,
                status: 'active',
                referenceCode: 'ORD-SEED-001',
            },
            {
                user: createdUsers[1]._id,
                spot: createdSpots[0]._id,
                startTime: new Date('2024-12-01T09:00:00'),
                endTime: new Date('2024-12-01T12:00:00'),
                amountPaid: 15,
                status: 'completed',
                referenceCode: 'ORD-SEED-002',
            },
            {
                user: createdUsers[2]._id,
                spot: createdSpots[7]._id,
                startTime: new Date('2024-12-08T15:00:00'),
                endTime: new Date('2024-12-08T18:00:00'),
                amountPaid: 45,
                status: 'active',
                referenceCode: 'ORD-SEED-003',
            },
            {
                user: createdUsers[2]._id,
                spot: createdSpots[4]._id,
                startTime: new Date('2024-11-30T08:00:00'),
                endTime: new Date('2024-11-30T10:00:00'),
                amountPaid: 16,
                status: 'completed',
                referenceCode: 'ORD-SEED-004',
            },
            {
                user: createdUsers[1]._id,
                spot: createdSpots[6]._id, // D-401
                startTime: new Date('2024-11-28T12:00:00'),
                endTime: new Date('2024-11-28T15:00:00'),
                amountPaid: 45,
                status: 'cancelled',
                referenceCode: 'ORD-SEED-005',
            },
        ];

        console.log('📅 Creating bookings...');

        const createdBookings = await Booking.insertMany(bookings);
        console.log(`✅ ${createdBookings.length} bookings created`);

        console.log('\n✨ Database seeded successfully!\n');
        console.log('Sample Credentials:');
        console.log('====================');
        console.log('Admin User:');
        console.log('  Email: admin@parksmart.com');
        console.log('  Password: admin123');
        console.log('\nRegular User:');
        console.log('  Email: john@example.com');
        console.log('  Password: password123');
        console.log('\n====================\n');

        // Disconnect
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run seed
seedDatabase();
