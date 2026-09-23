const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../../data/database.json');

// Ensure data folder exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initial JSON Database Structure
if (!fs.existsSync(DB_FILE)) {
    const initialData = {
        users: [
            {
                _id: 'usr_admin_1',
                name: 'Rajnandini Bhati',
                email: 'mkd9a32@gmail.com',
                phone: '+91 99820 72287',
                role: 'admin',
                passwordHash: '$2a$10$wT282gGsmV0sI9m65eR3EOTB9eM6jH.4r856u2fV.xW8d5VdZ9e7O', // 'maharaja2026'
                createdAt: new Date().toISOString()
            }
        ],
        categories: [
            { id: 'starters', name: 'Shahi Starters & Kebabs', slug: 'starters', icon: 'fa-fire-burner', count: 6 },
            { id: 'mains', name: 'Royal Curries & Dum Handis', slug: 'mains', icon: 'fa-utensils', count: 8 },
            { id: 'biryani', name: 'Awadhi & Dum Biryanis', slug: 'biryani', icon: 'fa-bowl-rice', count: 4 },
            { id: 'breads', name: 'Tandoori & Artisanal Breads', slug: 'breads', icon: 'fa-bread-slice', count: 4 },
            { id: 'desserts', name: 'Shahi Mithai & Royal Desserts', slug: 'desserts', icon: 'fa-ice-cream', count: 4 },
            { id: 'beverages', name: 'Royal Elixirs & Cocktails', slug: 'beverages', icon: 'fa-wine-glass', count: 4 }
        ],
        products: [],
        cart: [],
        orders: [],
        addresses: [],
        coupons: [
            { code: 'ROYAL20', discountPercent: 20, maxDiscount: 500, minOrder: 1500, active: true },
            { code: 'MAHARAJA50', discountPercent: 50, maxDiscount: 1000, minOrder: 3000, active: true },
            { code: 'SAVORIA100', discountFixed: 100, minOrder: 999, active: true }
        ],
        reviews: [],
        deliveryStaff: [
            { id: 'del_1', name: 'Vikramaditya Rathore', phone: '+91 98111 22334', status: 'available', activeOrders: 0 },
            { id: 'del_2', name: 'Suraj Bhan Singh', phone: '+91 98222 33445', status: 'on-trip', activeOrders: 1 }
        ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
}

let isMongoConnected = false;

const connectDB = async () => {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/savoria';
    try {
        mongoose.set('strictQuery', false);
        const conn = await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 2500,
            connectTimeoutMS: 2500
        });
        isMongoConnected = true;
        console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host} (${conn.connection.name})`);
    } catch (error) {
        isMongoConnected = false;
        console.log(`ℹ️  MongoDB Notice: ${error.message}`);
        console.log(`🛡️  Zero-Crash Local JSON Database Active at: ${DB_FILE}`);
    }
};

// Local JSON Storage Helpers
const getLocalDB = () => {
    try {
        if (!fs.existsSync(DB_FILE)) return {};
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
        return {};
    }
};

const saveLocalDB = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (e) {
        return false;
    }
};

module.exports = {
    connectDB,
    isMongoConnected: () => isMongoConnected,
    getLocalDB,
    saveLocalDB
};
