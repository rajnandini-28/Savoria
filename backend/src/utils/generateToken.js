const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'savoria_royal_secret_jwt_key_2026_imperial_access';

const generateToken = (userId, role = 'customer') => {
    return jwt.sign(
        { id: userId, role: role },
        JWT_SECRET,
        { expiresIn: '30d' }
    );
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (e) {
        return null;
    }
};

module.exports = {
    generateToken,
    verifyToken
};
