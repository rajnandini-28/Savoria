require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 3000;

// Initialize Database
connectDB();

if (require.main === module || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`\n=============================================================`);
        console.log(`⚜️  SAVORIA ROYAL HAUTE CUISINE PRODUCTION BACKEND ACTIVE`);
        console.log(`🌐 Server Running on: http://localhost:${PORT}`);
        console.log(`🔐 JWT Auth API:      http://localhost:${PORT}/api/auth`);
        console.log(`🍲 Products API:      http://localhost:${PORT}/api/products`);
        console.log(`📂 Categories API:    http://localhost:${PORT}/api/categories`);
        console.log(`🛒 Cart API:          http://localhost:${PORT}/api/cart`);
        console.log(`🏠 Addresses API:     http://localhost:${PORT}/api/addresses`);
        console.log(`👨‍🍳 Kitchen Orders API: http://localhost:${PORT}/api/orders`);
        console.log(`💳 Payments API:      http://localhost:${PORT}/api/payments`);
        console.log(`🎟️ Coupons API:       http://localhost:${PORT}/api/coupons`);
        console.log(`👑 Admin Dashboard:   http://localhost:${PORT}/api/admin/dashboard`);
        console.log(`=============================================================\n`);
    });
}

module.exports = app;
