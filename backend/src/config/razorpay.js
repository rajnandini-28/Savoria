let Razorpay;
try {
    Razorpay = require('razorpay');
} catch (e) {
    Razorpay = null;
}

let razorpayInstance = null;

const KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_SAVORIA2026KEY';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'savoria_secret_key_demo_2026';

if (Razorpay && process.env.RAZORPAY_KEY_ID) {
    try {
        razorpayInstance = new Razorpay({
            key_id: KEY_ID,
            key_secret: KEY_SECRET
        });
    } catch (err) {
        console.warn('Razorpay instance notice:', err.message);
    }
}

module.exports = {
    razorpayInstance,
    KEY_ID,
    KEY_SECRET
};
