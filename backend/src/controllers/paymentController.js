const { createGatewayOrder, verifyGatewaySignature } = require('../services/paymentService');
const { generateTransactionId } = require('../utils/generateOrderId');
const { getLocalDB, saveLocalDB } = require('../config/db');

// @route   POST /api/payments/create
// @desc    Initiate payment gateway order
const createPayment = async (req, res) => {
    try {
        const { amount, receipt } = req.body;
        const result = await createGatewayOrder(Number(amount) || 1000, receipt);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @route   POST /api/payments/verify
// @desc    Verify payment gateway signature
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderRef, amount, method } = req.body;

        let isValid = true;
        if (razorpay_order_id && razorpay_signature) {
            isValid = verifyGatewaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
        }

        const transactionId = razorpay_payment_id || generateTransactionId(method || 'UPI');

        // Record Payment
        const db = getLocalDB();
        if (!db.payments) db.payments = [];

        const paymentRecord = {
            id: 'pay_' + Date.now(),
            orderRef: orderRef || ('SAV-IND-' + Math.floor(100000 + Math.random() * 900000)),
            transactionId,
            method: method || 'UPI Instant Pay',
            amount: Number(amount) || 1000,
            currency: 'INR',
            status: isValid ? 'Captured' : 'Failed',
            createdAt: new Date().toISOString()
        };

        db.payments.unshift(paymentRecord);
        saveLocalDB(db);

        if (isValid) {
            res.json({
                success: true,
                message: 'Payment verified and secured successfully',
                transactionId,
                payment: paymentRecord
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Payment signature validation failed'
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    createPayment,
    verifyPayment
};
