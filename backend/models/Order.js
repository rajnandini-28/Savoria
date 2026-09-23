const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    id: { type: String },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    image: { type: String }
});

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    customerName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    orderType: {
        type: String,
        default: 'Dine-In Royal Service'
    },
    tableNumber: {
        type: String,
        default: 'Table T-01'
    },
    items: [orderItemSchema],
    subtotal: {
        type: Number,
        required: true
    },
    gst: {
        type: Number,
        default: 0
    },
    tip: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        default: 'UPI Instant Pay'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Authorized & Secured', 'Captured', 'Refunded'],
        default: 'Authorized & Secured'
    },
    transactionId: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Received at Kitchen Line', 'Preparing in Royal Rasoi', 'Ready for Service / Dispatch', 'Courier On Transit', 'Fulfilled', 'Cancelled'],
        default: 'Received at Kitchen Line'
    },
    station: {
        type: String,
        default: 'Station 1 (Tandoor & Bhatti Brigade)'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);
