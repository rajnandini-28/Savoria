const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrderById, cancelOrder } = require('../controllers/orderController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.use(optionalAuth);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.patch('/:id/cancel', cancelOrder);

module.exports = router;
