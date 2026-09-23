const express = require('express');
const router = express.Router();
const { createPayment, verifyPayment } = require('../controllers/paymentController');

router.post('/create', createPayment);
router.post('/verify', verifyPayment);
router.post('/create-order', createPayment); // backwards-compatibility alias

module.exports = router;
