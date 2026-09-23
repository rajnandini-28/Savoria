const { createNewOrder, updateOrderStatus } = require('../services/orderService');
const { getLocalDB } = require('../config/db');

// @route   POST /api/orders
// @desc    Create and dispatch new order
const createOrder = async (req, res) => {
    try {
        const orderData = req.body;
        const newOrder = await createNewOrder(orderData);

        res.status(201).json({
            success: true,
            message: `Royal order ${newOrder.orderRef} placed successfully!`,
            order: newOrder
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @route   GET /api/orders
// @desc    Get orders (User specific or all for admin)
const getOrders = async (req, res) => {
    try {
        const userId = req.user?.id || req.query.userId;
        const db = getLocalDB();
        let orders = db.orders || [];

        if (userId && (!req.user || req.user.role === 'customer')) {
            orders = orders.filter(o => o.userId === userId || o.email === req.user?.email);
        }

        res.json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @route   GET /api/orders/:id
// @desc    Get order details by orderRef or _id
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getLocalDB();
        const order = (db.orders || []).find(o => o.orderRef === id || o._id === id || o.id === id);

        if (!order) {
            return res.status(404).json({ success: false, error: `Order ${id} not found` });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @route   PATCH /api/orders/:id/cancel
// @desc    Cancel an order
const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await updateOrderStatus(id, 'Cancelled');

        if (!updated) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        res.json({
            success: true,
            message: `Order ${id} has been cancelled`,
            order: updated
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    cancelOrder
};
