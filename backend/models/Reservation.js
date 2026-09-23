const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    bookingRef: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: [true, 'Please provide guest full name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide guest email'],
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, 'Please provide guest phone number'],
        trim: true
    },
    date: {
        type: String,
        default: ''
    },
    formattedDate: {
        type: String,
        required: true
    },
    timeText: {
        type: String,
        required: true
    },
    seating: {
        type: String,
        default: 'The Durbar Hall'
    },
    guestsText: {
        type: String,
        default: '2 Guests'
    },
    partySize: {
        type: Number,
        default: 2
    },
    specialNotes: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['confirmed', 'seated', 'completed', 'cancelled'],
        default: 'confirmed'
    },
    guestEmailSent: {
        type: Boolean,
        default: false
    },
    adminEmailSent: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Reservation', reservationSchema);
