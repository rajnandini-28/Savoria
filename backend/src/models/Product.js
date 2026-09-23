const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: [true, 'Dish title is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['starters', 'mains', 'biryani', 'breads', 'desserts', 'beverages']
    },
    categoryLabel: {
        type: String,
        default: ''
    },
    price: {
        type: String,
        required: true
    },
    rawPrice: {
        type: Number,
        required: [true, 'Numeric price is required']
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    dietary: [{
        type: String,
        enum: ['chef-pick', 'veg', 'non-veg', 'jain']
    }],
    pairing: {
        type: String,
        default: 'Sommelier Recommended Pairing'
    },
    chefNote: {
        type: String,
        default: ''
    },
    ingredients: [{
        type: String
    }],
    isAvailable: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
        default: 4.9
    },
    reviewsCount: {
        type: Number,
        default: 12
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
