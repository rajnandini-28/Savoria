const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountPercent: {
        type: Number,
        default: 0
    },
    discountFixed: {
        type: Number,
        default: 0
    },
    maxDiscount: {
        type: Number,
        default: 500
    },
    minOrder: {
        type: Number,
        default: 1000
    },
    active: {
        type: Boolean,
        default: true
    },
    expiryDate: {
        type: Date,
        default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
