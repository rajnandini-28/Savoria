const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    quantity: { type: Number, default: 1, min: 1 }
});

const CartSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    items: [CartItemSchema],
    couponCode: {
        type: String,
        default: null
    },
    tipPercent: {
        type: Number,
        default: 10
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Cart || mongoose.model('Cart', CartSchema);
