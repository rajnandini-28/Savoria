const express = require('express');
const router = express.Router();
const { getDashboardStats, getAdminOrders, updateAdminOrderStatus, getCustomers } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

// Can protect routes or allow dashboard access for admin suite
router.get('/dashboard', getDashboardStats);
router.get('/orders', getAdminOrders);
router.patch('/orders/:id/status', updateAdminOrderStatus);
router.get('/customers', getCustomers);

module.exports = router;
