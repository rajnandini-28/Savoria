const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { getIsConnected } = require('../config/db');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const DB_FILE = path.join(__dirname, '../data/database.json');

function getLocalDB() {
    try {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch(e) {
        return { users: [] };
    }
}

function saveLocalDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res, next) => {
    try {
        const { name, email, phone, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide name, email, and password.' });
        }

        if (getIsConnected()) {
            const userExists = await User.findOne({ email: email.toLowerCase() });
            if (userExists) {
                return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
            }

            const user = await User.create({
                name,
                email: email.toLowerCase(),
                phone: phone || '',
                password,
                role: role || 'guest'
            });

            const token = generateToken(user._id, user.role);

            return res.status(201).json({
                success: true,
                message: 'Royal membership account created successfully',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                }
            });
        } else {
            // Local JSON DB Mode
            const db = getLocalDB();
            if (!db.users) db.users = [];

            const userExists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (userExists) {
                return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const userId = 'usr-' + Date.now();

            const newUser = {
                id: userId,
                _id: userId,
                name,
                email: email.toLowerCase(),
                phone: phone || '',
                password: hashedPassword,
                role: role || 'guest',
                createdAt: new Date().toISOString()
            };

            db.users.push(newUser);
            saveLocalDB(db);

            const token = generateToken(userId, newUser.role);

            return res.status(201).json({
                success: true,
                message: 'Royal membership account created successfully',
                token,
                user: {
                    id: userId,
                    name: newUser.name,
                    email: newUser.email,
                    phone: newUser.phone,
                    role: newUser.role
                }
            });
        }
    } catch (err) {
        next(err);
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide email and password.' });
        }

        if (getIsConnected()) {
            const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

            if (!user || !(await user.matchPassword(password))) {
                return res.status(401).json({ success: false, error: 'Invalid royal credentials.' });
            }

            const token = generateToken(user._id, user.role);

            return res.json({
                success: true,
                message: `Welcome back, ${user.name}`,
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                }
            });
        } else {
            // Local JSON DB Mode
            const db = getLocalDB();
            const user = (db.users || []).find(u => u.email.toLowerCase() === email.toLowerCase());

            if (!user) {
                return res.status(401).json({ success: false, error: 'Invalid royal credentials.' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, error: 'Invalid royal credentials.' });
            }

            const token = generateToken(user.id || user._id, user.role);

            return res.json({
                success: true,
                message: `Welcome back, ${user.name}`,
                token,
                user: {
                    id: user.id || user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                }
            });
        }
    } catch (err) {
        next(err);
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = async (req, res, next) => {
    try {
        res.json({
            success: true,
            user: req.user
        });
    } catch (err) {
        next(err);
    }
};
