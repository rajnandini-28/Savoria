const jwt = require('jsonwebtoken');

const generateToken = (id, role = 'guest') => {
    const secret = process.env.JWT_SECRET || 'savoria_royal_secret_jwt_key_2026_imperial_access';
    return jwt.sign({ id, role }, secret, {
        expiresIn: '30d'
    });
};

module.exports = generateToken;
