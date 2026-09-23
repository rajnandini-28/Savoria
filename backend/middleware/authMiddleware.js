const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getIsConnected } = require('../config/db');
const path = require('path');
const fs = require('fs');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const secret = process.env.JWT_SECRET || 'savoria_royal_secret_jwt_key_2026_imperial_access';
            const decoded = jwt.verify(token, secret);

            if (getIsConnected()) {
                req.user = await User.findById(decoded.id).select('-password');
            } else {
                // Fallback to JSON DB
                const DB_FILE = path.join(__dirname, '../data/database.json');
                const raw = fs.readFileSync(DB_FILE, 'utf8');
                const db = JSON.parse(raw);
                const user = (db.users || []).find(u => u.id === decoded.id || u._id === decoded.id);
                if (user) {
                    const { password, ...userWithoutPass } = user;
                    req.user = userWithoutPass;
                }
            }

            if (!req.user) {
                return res.status(401).json({ success: false, error: 'User associated with token no longer exists.' });
            }

            next();
        } catch (error) {
            console.error('JWT verification failed:', error.message);
            return res.status(401).json({ success: false, error: 'Not authorized, invalid or expired token.' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized, Bearer token required in Authorization header.' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `User role '${req.user?.role || 'none'}' is not authorized to access this resource.`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
