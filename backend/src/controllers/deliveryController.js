const { getLocalDB, saveLocalDB } = require('../config/db');
const { updateOrderStatus } = require('../services/orderService');

// @route   GET /api/delivery/orders
// @desc    Orders for royal chauffeur delivery fleet
const getDeliveryOrders = async (req, res) => {
    try {
        const db = getLocalDB();
        const orders = (db.orders || []).filter(o => o.orderType === 'delivery');
        const staff = db.deliveryStaff || [];

        res.json({
            success: true,
            activeDeliveries: orders.length,
            orders,
            fleet: staff
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @route   PATCH /api/delivery/orders/:id/status
// @desc    Update delivery status (Out for Delivery, Completed)
const updateDeliveryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, staffId } = req.body;
        const updated = await updateOrderStatus(id, status || 'Out for Delivery');

        res.json({
            success: true,
            message: `Delivery dispatch updated to ${status}`,
            order: updated
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getDeliveryOrders,
    updateDeliveryStatus
};
