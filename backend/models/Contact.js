const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        default: ''
    },
    subject: {
        type: String,
        default: 'General Inquiry & Concierge Request'
    },
    message: {
        type: String,
        required: [true, 'Please provide a message or inquiry details']
    },
    guestEmailSent: {
        type: Boolean,
        default: false
    },
    adminEmailSent: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['unread', 'responded', 'archived'],
        default: 'unread'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Contact', contactSchema);
