const express = require('express');
const router = express.Router();
const { createReview, getProductReviews } = require('../controllers/reviewController');

router.post('/', createReview);
router.get('/', (req, res) => {
    const { getLocalDB } = require('../config/db');
    const db = getLocalDB();
    res.json({ success: true, reviews: db.reviews || [] });
});

module.exports = router;
