const { getLocalDB, saveLocalDB } = require('../config/db');

// @route   POST /api/reviews
// @desc    Submit guest review for a dish or experience
const createReview = async (req, res) => {
    try {
        const { productId, productTitle, userName, userEmail, rating, comment } = req.body;

        if (!userName || !rating || !comment) {
            return res.status(400).json({ success: false, error: 'Name, rating, and feedback review are required' });
        }

        const newReview = {
            id: 'rev_' + Date.now(),
            productId: productId || 'galouti-kebab',
            productTitle: productTitle || 'Royal Degustation Experience',
            userName: userName.trim(),
            userEmail: userEmail ? userEmail.trim() : '',
            rating: Number(rating) || 5,
            comment: comment.trim(),
            status: 'Approved',
            createdAt: new Date().toISOString()
        };

        const db = getLocalDB();
        if (!db.reviews) db.reviews = [];
        db.reviews.unshift(newReview);
        saveLocalDB(db);

        res.status(201).json({
            success: true,
            message: 'Your royal review has been published with gratitude!',
            review: newReview
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @route   GET /api/products/:id/reviews
// @desc    Get reviews for specific dish
const getProductReviews = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getLocalDB();
        const reviews = (db.reviews || []).filter(r => r.productId === id || r.status === 'Approved');

        res.json({
            success: true,
            count: reviews.length,
            reviews
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    createReview,
    getProductReviews
};
