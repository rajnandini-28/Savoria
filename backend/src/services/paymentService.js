const { razorpayInstance, KEY_ID } = require('../config/razorpay');
const crypto = require('crypto');

const createGatewayOrder = async (amountInINR, receiptId) => {
    if (!razorpayInstance) {
        return {
            isSimulated: true,
            orderId: 'order_sim_' + Math.floor(100000 + Math.random() * 900000),
            amount: amountInINR * 100,
            currency: 'INR',
            keyId: KEY_ID
        };
    }

    try {
        const order = await razorpayInstance.orders.create({
            amount: Math.round(amountInINR * 100),
            currency: 'INR',
            receipt: receiptId || 'rcpt_' + Date.now(),
            payment_capture: 1
        });

        return {
            isSimulated: false,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: KEY_ID
        };
    } catch (error) {
        return {
            isSimulated: true,
            orderId: 'order_sim_' + Math.floor(100000 + Math.random() * 900000),
            amount: amountInINR * 100,
            currency: 'INR',
            keyId: KEY_ID
        };
    }
};

const verifyGatewaySignature = (orderId, paymentId, signature) => {
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'savoria_secret_key_demo_2026';
    const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

    return generatedSignature === signature;
};

module.exports = {
    createGatewayOrder,
    verifyGatewaySignature
};
