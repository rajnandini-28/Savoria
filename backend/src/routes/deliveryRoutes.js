const express = require('express');
const router = express.Router();
const { getDeliveryOrders, updateDeliveryStatus } = require('../controllers/deliveryController');

router.get('/orders', getDeliveryOrders);
router.patch('/orders/:id/status', updateDeliveryStatus);

module.exports = router;
