const mongoose = require('mongoose');

const DeliveryStaffSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    vehicleType: {
        type: String,
        default: 'Royal Chauffeur Sedan'
    },
    status: {
        type: String,
        enum: ['available', 'on-trip', 'off-duty'],
        default: 'available'
    },
    activeOrders: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 4.95
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.DeliveryStaff || mongoose.model('DeliveryStaff', DeliveryStaffSchema);
