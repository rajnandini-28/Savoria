const Order = require('../models/Order');
const { getIsConnected } = require('../config/db');
const path = require('path');
const fs = require('fs');

const DB_FILE = path.join(__dirname, '../data/database.json');

function getLocalDB() {
    try {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
        return { orders: [] };
    }
}

function saveLocalDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// @desc    Create a new royal dining or delivery order
// @route   POST /api/orders
// @access  Public / Authenticated
exports.createOrder = async (req, res, next) => {
    try {
        const {
            customerName,
            email,
            phone,
            orderType,
            tableNumber,
            address,
            items,
            subtotal,
            gst,
            tip,
            total,
            paymentMethod,
            paymentStatus,
            transactionId,
            station
        } = req.body;

        if (!items || !items.length) {
            return res.status(400).json({ success: false, error: 'Order must contain at least one item.' });
        }

        const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
        const orderPayload = {
            orderId,
            customerName: customerName || 'Royal Patron',
            email: email || '',
            phone: phone || '',
            orderType: orderType || 'Dine-In Royal Service',
            tableNumber: tableNumber || 'Table T-01',
            address: address || '',
            items: items.map(item => ({
                id: item.id || '',
                title: item.title || item.name,
                price: Number(item.price) || 0,
                quantity: Number(item.quantity) || 1,
                image: item.image || ''
            })),
            subtotal: Number(subtotal) || 0,
            gst: Number(gst) || 0,
            tip: Number(tip) || 0,
            total: Number(total) || 0,
            paymentMethod: paymentMethod || 'UPI Instant Pay',
            paymentStatus: paymentStatus || 'Authorized & Secured',
            transactionId: transactionId || 'TXN-' + Math.floor(10000000 + Math.random() * 90000000),
            status: 'Received at Kitchen Line',
            station: station || 'Station 1 (Tandoor & Bhatti Brigade)',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        let savedOrder;

        if (getIsConnected()) {
            savedOrder = await Order.create(orderPayload);
        } else {
            const db = getLocalDB();
            if (!db.orders) db.orders = [];
            orderPayload.id = 'ord-' + Date.now();
            orderPayload._id = orderPayload.id;
            db.orders.unshift(orderPayload);
            saveLocalDB(db);
            savedOrder = orderPayload;
        }

        return res.status(201).json({
            success: true,
            message: `Order #${orderId} has been transmitted to the royal kitchen brigade.`,
            order: savedOrder
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Public / Kitchen / Admin
exports.getOrders = async (req, res, next) => {
    try {
        if (getIsConnected()) {
            const orders = await Order.find().sort({ createdAt: -1 });
            return res.json({ success: true, count: orders.length, data: orders });
        } else {
            const db = getLocalDB();
            const orders = db.orders || [];
            return res.json({ success: true, count: orders.length, data: orders });
        }
    } catch (err) {
        next(err);
    }
};

// @desc    Get single order by orderId
// @route   GET /api/orders/:id
// @access  Public
exports.getOrderById = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (getIsConnected()) {
            const order = await Order.findOne({
                $or: [{ orderId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
            });
            if (!order) return res.status(404).json({ success: false, error: 'Order not found.' });
            return res.json({ success: true, data: order });
        } else {
            const db = getLocalDB();
            const order = (db.orders || []).find(o => o.orderId === id || o.id === id || o._id === id);
            if (!order) return res.status(404).json({ success: false, error: 'Order not found.' });
            return res.json({ success: true, data: order });
        }
    } catch (err) {
        next(err);
    }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Public / Kitchen Brigade
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { status, station } = req.body;
        const id = req.params.id;

        if (getIsConnected()) {
            const updateFields = { updatedAt: new Date() };
            if (status) updateFields.status = status;
            if (station) updateFields.station = station;

            const order = await Order.findOneAndUpdate(
                { $or: [{ orderId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
                updateFields,
                { new: true }
            );
            if (!order) return res.status(404).json({ success: false, error: 'Order not found.' });
            return res.json({ success: true, message: 'Order status updated', data: order });
        } else {
            const db = getLocalDB();
            const order = (db.orders || []).find(o => o.orderId === id || o.id === id || o._id === id);
            if (!order) return res.status(404).json({ success: false, error: 'Order not found.' });

            if (status) order.status = status;
            if (station) order.station = station;
            order.updatedAt = new Date().toISOString();
            saveLocalDB(db);

            return res.json({ success: true, message: 'Order status updated', data: order });
        }
    } catch (err) {
        next(err);
    }
};
