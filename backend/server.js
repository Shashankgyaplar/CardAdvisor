/**
 * Smart Credit Card Advisor - India
 * 
 * Main Express Server Entry Point
 * 
 * This application helps Indian users select, optimize, upgrade,
 * or cancel credit cards based on their actual spending behavior.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const cardRoutes = require('./routes/cardRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

// Initialize Express app
const app = express();

// ============ MIDDLEWARE ============

// Enable CORS for frontend
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map(url => url.trim());

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow localhost on any port (development)
        if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:')) {
            return callback(null, true);
        }

        // Allow configured frontend URL(s)
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

// Parse JSON bodies
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
        next();
    });
}

// ============ ROUTES ============

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'Smart Credit Card Advisor API',
        version: '1.0.0',
        description: 'API for personalized credit card recommendations in India',
        endpoints: {
            cards: '/api/cards',
            recommendations: '/api/recommendations',
            health: '/api/health'
        }
    });
});

// Mount route modules
app.use('/api/cards', cardRoutes);
app.use('/api/recommendations', recommendationRoutes);

// ============ ERROR HANDLING ============

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);

    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============ SERVER STARTUP ============

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Start Express server
        app.listen(PORT, () => {
            console.log(`
╔═══════════════════════════════════════════════════════════╗
║   Smart Credit Card Advisor - India                       ║
║   Backend Server                                          ║
╠═══════════════════════════════════════════════════════════╣
║   🚀 Server running on port ${PORT}                          ║
║   📦 Environment: ${(process.env.NODE_ENV || 'development').padEnd(36)}║
║   🔗 API: http://localhost:${PORT}/api                       ║
╚═══════════════════════════════════════════════════════════╝
      `);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Start the server
startServer();

module.exports = app;
