const { verifyToken } = require('../utils/generateToken');
const { getLocalDB } = require('../config/db');
let User;
try {
    User = require('../models/User');
} catch (e) {}

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = verifyToken(token);

            if (!decoded) {
                return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired token' });
            }

            // Check in MongoDB or Local DB
            try {
                if (User) {
                    req.user = await User.findById(decoded.id).select('-password');
                }
            } catch (dbErr) {}

            if (!req.user) {
                const localDB = getLocalDB();
                const foundUser = (localDB.users || []).find(u => u._id === decoded.id || u.id === decoded.id || u.email === decoded.email);
                if (foundUser) {
                    const { passwordHash, ...userClean } = foundUser;
                    req.user = userClean;
                } else {
                    req.user = { id: decoded.id, role: decoded.role || 'customer' };
                }
            }

            return next();
        } catch (error) {
            return res.status(401).json({ success: false, error: 'Not authorized, token validation failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized, no token provided' });
    }
};

// Optional auth (populates req.user if present, but doesn't block guests)
const optionalAuth = (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = verifyToken(token);
            if (decoded) {
                req.user = decoded;
            }
        } catch (e) {}
    }
    next();
};

module.exports = { protect, optionalAuth };
