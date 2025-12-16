require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { startCronJobs } = require('./cron/subscriptionCron');

// Routes
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
const panicRoutes = require('./routes/panicRoutes');
const swapRoutes = require('./routes/swapRoutes');
const messageRoutes = require('./routes/messageRoutes');

// 🔗 Connect DB (VERY IMPORTANT)
connectDB();

// Init app
const app = express();
const httpServer = http.createServer(app);

// Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    },
});

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://127.0.0.1:5173',
        process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Attach io to requests
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Socket handlers
io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});

// Health check
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to ParkSmart API',
        version: '2.0.0',
    });
});

// Routes
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
app.use('/api/parkings', geoRoutes);
app.use('/api/panic', panicRoutes);
app.use('/api/swap', swapRoutes);
app.use('/api/messages', messageRoutes);

// Error middleware
app.use(notFound);
app.use(errorHandler);

// Cron jobs
startCronJobs();

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(
        `🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
    );
});

module.exports = app;
