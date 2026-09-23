const express = require('express');
const router = express.Router();
const { getKitchenOrders, updateKitchenStatus } = require('../controllers/kitchenController');

router.get('/orders', getKitchenOrders);
router.patch('/orders/:id/status', updateKitchenStatus);

module.exports = router;
