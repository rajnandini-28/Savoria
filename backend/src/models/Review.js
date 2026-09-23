const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true
    },
    productTitle: {
        type: String,
        default: ''
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Approved', 'Pending', 'Rejected'],
        default: 'Approved'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
