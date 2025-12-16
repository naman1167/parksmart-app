require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { startCronJobs } = require('./cron/subscriptionCron');

// Import routes
const authRoutes = require('./routes/authRoutes');
const parkingSpotRoutes = require('./routes/parkingSpotRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const statsRoutes = require('./routes/statsRoutes');
const slotRoutes = require('./routes/slotRoutes');
const walletRoutes = require('./routes/walletRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const qrRoutes = require('./routes/qrRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const geoRoutes = require('./routes/geoRoutes');

// Connect to database
connectDB();

// Initialize Express app
const app = express();
const http = require('http');
const { Server } = require('socket.io');

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*', // Allow all origins for development
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://127.0.0.1:5173',
        process.env.FRONTEND_URL // Allow production frontend
    ].filter(Boolean), // Filter out undefined if env var is not set
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Make io accessible to our routers
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Welcome route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to ParkSmart API',
        version: '2.0.0',
        endpoints: {
            auth: '/api/auth',
            parkingSpots: '/api/spots',
            bookings: '/api/bookings',
            stats: '/api/stats',
            slots: '/api/slots',
            wallet: '/api/wallet',
            reservations: '/api/reservations',
            qr: '/api/qr',
            pricing: '/api/pricing',
            analytics: '/api/analytics',
            subscriptions: '/api/subscriptions',
            parkings: '/api/parkings',
        },
    });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/spots', parkingSpotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/parkings', geoRoutes);
app.use('/api/panic', require('./routes/panicRoutes'));
app.use('/api/swap', require('./routes/swapRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Error handling middleware (must be after routes)
app.use(notFound);
app.use(errorHandler);

// Start cron jobs
startCronJobs();

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;

