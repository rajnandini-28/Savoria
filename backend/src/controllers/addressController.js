const { getLocalDB, saveLocalDB } = require('../config/db');
let Address;
try { Address = require('../models/Address'); } catch (e) {}

// @route   GET /api/addresses
// @desc    Get user saved addresses
const getAddresses = async (req, res) => {
    try {
        const userId = req.user?.id || req.query.userId || 'guest_user';
        const db = getLocalDB();
        const addresses = (db.addresses || []).filter(a => a.userId === userId);

        if (addresses.length === 0) {
            // Provide default initial royal address
            const defaultAddr = {
                id: 'addr_1',
                userId,
                title: 'Royal Residence',
                recipientName: req.user?.name || 'Maharaja Guest',
                phone: req.user?.phone || '+91 98101 23456',
                street: '450 Heritage Marg, Lutyens Zone',
                city: 'New Delhi',
                state: 'Delhi',
                pincode: '110001',
                isDefault: true
            };
            return res.json({ success: true, addresses: [defaultAddr] });
        }

        res.json({ success: true, addresses });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @route   POST /api/addresses
// @desc    Add new delivery address
const addAddress = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId || 'guest_user';
        const { title, recipientName, phone, street, city, state, pincode, isDefault } = req.body;

        if (!street || !recipientName || !phone) {
            return res.status(400).json({ success: false, error: 'Recipient name, phone, and street address are required' });
        }

        const newAddr = {
            id: 'addr_' + Date.now(),
            userId,
            title: title || 'Home',
            recipientName,
            phone,
            street,
            city: city || 'New Delhi',
            state: state || 'Delhi',
            pincode: pincode || '110001',
            isDefault: Boolean(isDefault)
        };

        const db = getLocalDB();
        if (!db.addresses) db.addresses = [];

        if (newAddr.isDefault) {
            db.addresses.forEach(a => { if (a.userId === userId) a.isDefault = false; });
        }

        db.addresses.push(newAddr);
        saveLocalDB(db);

        res.status(201).json({
            success: true,
            message: 'Address saved successfully',
            address: newAddr
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @route   PATCH /api/addresses/:id
// @desc    Update address
const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getLocalDB();
        if (!db.addresses) db.addresses = [];

        const idx = db.addresses.findIndex(a => a.id === id || a._id === id);
        if (idx === -1) return res.status(404).json({ success: false, error: 'Address not found' });

        db.addresses[idx] = { ...db.addresses[idx], ...req.body };
        saveLocalDB(db);

        res.json({ success: true, address: db.addresses[idx] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @route   DELETE /api/addresses/:id
// @desc    Delete address
const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getLocalDB();
        if (!db.addresses) db.addresses = [];

        db.addresses = db.addresses.filter(a => a.id !== id && a._id !== id);
        saveLocalDB(db);

        res.json({ success: true, message: 'Address removed' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress
};
