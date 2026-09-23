const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    image: { type: String, default: '' }
});

const OrderSchema = new mongoose.Schema({
    orderRef: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: String,
        default: null
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
        required: true
    },
    orderType: {
        type: String,
        enum: ['pickup', 'delivery', 'dine-in'],
        default: 'pickup'
    },
    orderTypeLabel: {
        type: String,
        default: 'Private Curbside Valet Pickup'
    },
    deliveryAddress: {
        type: String,
        default: '450 Heritage Marg, New Delhi'
    },
    tableNumber: {
        type: String,
        default: ''
    },
    prepTime: {
        type: String,
        default: 'As soon as prepared fresh (~35 min)'
    },
    specialInstructions: {
        type: String,
        default: ''
    },
    items: [OrderItemSchema],
    financials: {
        subtotal: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        discountedSubtotal: { type: Number, default: 0 },
        gst: { type: Number, required: true },
        tipPercent: { type: Number, default: 10 },
        tipAmount: { type: Number, default: 0 },
        total: { type: Number, required: true }
    },
    payment: {
        method: { type: String, default: 'UPI Instant Pay' },
        status: { type: String, default: 'Authorized & Secured' },
        transactionId: { type: String, default: '' }
    },
    status: {
        type: String,
        enum: ['Pending', 'Received', 'Preparing', 'Ready', 'Out for Delivery', 'Completed', 'Cancelled'],
        default: 'Received'
    },
    assignedStaff: {
        type: String,
        default: 'Ustad Imran Qureshi (Master Chef)'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
