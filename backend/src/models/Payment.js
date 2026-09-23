const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    orderRef: {
        type: String,
        required: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    method: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['Pending', 'Authorized', 'Captured', 'Failed', 'Refunded'],
        default: 'Captured'
    },
    gatewayResponse: {
        type: Object,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
