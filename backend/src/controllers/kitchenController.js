const { getLocalDB } = require('../config/db');
const { updateOrderStatus } = require('../services/orderService');

// @route   GET /api/kitchen/orders
// @desc    Live KOT orders queue for kitchen display system
const getKitchenOrders = async (req, res) => {
    try {
        const db = getLocalDB();
        const orders = (db.orders || []).filter(o => o.status !== 'Completed' && o.status !== 'Cancelled');
        res.json({
            success: true,
            activeCount: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @route   PATCH /api/kitchen/orders/:id/status
// @desc    Update kitchen preparation status (e.g., Preparing, Ready)
const updateKitchenStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updated = await updateOrderStatus(id, status || 'Preparing');

        res.json({
            success: true,
            message: `Kitchen state updated to ${status}`,
            order: updated
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getKitchenOrders,
    updateKitchenStatus
};
