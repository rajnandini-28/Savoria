const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    icon: {
        type: String,
        default: 'fa-utensils'
    },
    description: {
        type: String,
        default: ''
    },
    count: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Category || mongoose.model('Category', CategorySchema);
