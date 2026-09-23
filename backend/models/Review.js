const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    author: {
        type: String,
        required: [true, 'Please provide author name'],
        trim: true
    },
    title: {
        type: String,
        default: 'Royal Dining Experience',
        trim: true
    },
    content: {
        type: String,
        default: ''
    },
    comment: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 5
    },
    dish: {
        type: String,
        default: 'Chef Selection'
    },
    date: {
        type: String,
        default: () => new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Review', reviewSchema);
