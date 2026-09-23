/**
 * SAVORIA — Enterprise Royal Haute Cuisine Application
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Import Modular REST Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const addressRoutes = require('./routes/addressRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const couponRoutes = require('./routes/couponRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const kitchenRoutes = require('./routes/kitchenRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging Middleware
app.use((req, res, next) => {
    try {
        req.url = req.url.replace(/(%0A|%0a|%20|[\r\n\t ])+$/g, '').trim();
    } catch(e) {}
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
});

/* ==========================================================================
   REST API ROUTES
   ========================================================================== */

// 1. Health Check
app.all(['/api/health', '/api/health/'], (req, res) => {
    res.json({
        status: 'online',
        service: 'SAVORIA Royal Haute Cuisine Production API',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        adminEmail: process.env.ADMIN_EMAIL || 'mkd9a32@gmail.com',
        auth: 'JWT Bearer Active'
    });
});

// 2. Mount All Enterprise REST Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payment', paymentRoutes); // alias for backwards compatibility
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/delivery', deliveryRoutes);

// Backwards compatibility for reservation endpoint
app.post('/api/reservations', (req, res) => {
    res.json({
        success: true,
        message: 'Royal Table Reservation Confirmed at SAVORIA',
        reservationId: 'RES-IND-' + Math.floor(100000 + Math.random() * 900000)
    });
});
app.post('/api/send-reservation-email', (req, res) => {
    res.json({ success: true, message: 'Reservation email dispatched' });
});
app.post('/api/contact', (req, res) => {
    res.json({ success: true, message: 'Royal Concierge inquiry received with gratitude' });
});

/* ==========================================================================
   STATIC FILE SERVING & SPA ROUTING FALLBACK (Frontend)
   ========================================================================== */
const FRONTEND_DIR = path.join(__dirname, '../../frontend');

app.use(express.static(FRONTEND_DIR));

app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
        return next();
    }

    // 1. Direct file match
    const filePath = path.join(FRONTEND_DIR, req.path);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        return res.sendFile(filePath);
    }

    // 2. Clean URL match (e.g. /menu, /cart, /dish, /tray, /admin, /payment, /auth, /checkout, /orders, /profile)
    const cleanPath = req.path.replace(/^\/+|\/+$/g, '');
    if (cleanPath) {
        // Direct HTML file check (e.g., dish.html, tray.html, auth.html)
        const htmlPath = path.join(FRONTEND_DIR, `${cleanPath}.html`);
        if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) {
            return res.sendFile(htmlPath);
        }

        // Subpath routing (e.g., category/starters -> index.html, food/galouti-kebab -> dish.html)
        if (cleanPath.startsWith('food/')) {
            return res.sendFile(path.join(FRONTEND_DIR, 'dish.html'));
        }
    }

    // 3. Main SPA Fallback
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// Error Handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;
