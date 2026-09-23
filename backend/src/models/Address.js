const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: 'Home / Residence'
    },
    recipientName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: true
    },
    city: {
        type: String,
        default: 'New Delhi'
    },
    state: {
        type: String,
        default: 'Delhi'
    },
    pincode: {
        type: String,
        default: '110001'
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Address || mongoose.model('Address', AddressSchema);
