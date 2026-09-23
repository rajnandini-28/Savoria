const Review = require('../models/Review');
const { getIsConnected } = require('../config/db');
const path = require('path');
const fs = require('fs');

const DB_FILE = path.join(__dirname, '../data/database.json');

const INITIAL_REVIEWS = [
    {
        author: "Maharaja Samarjit Singh",
        title: "Patron of Heritage Gastronomy",
        rating: 5,
        dish: "Awadhi Gosht Dum Biryani",
        comment: "The fragrant steam released upon slicing the hand-crimped purdah pastry transported me directly to the Awadh durbar. Sublime texture, ethereal saffron notes.",
        content: "The fragrant steam released upon slicing the hand-crimped purdah pastry transported me directly to the Awadh durbar. Sublime texture, ethereal saffron notes.",
        date: "September 2026"
    },
    {
        author: "Chef Antoine Laurent",
        title: "Michelin Guide Reviewer",
        rating: 5,
        dish: "Galouti Kebab on Ulte Tawe Ka Paratha",
        comment: "A monumental triumph of culinary heritage. Melting with 32 botanicals, smoking with clove embers, served with peerless imperial hospitality.",
        content: "A monumental triumph of culinary heritage. Melting with 32 botanicals, smoking with clove embers, served with peerless imperial hospitality.",
        date: "August 2026"
    },
    {
        author: "Princess Gayatri Devi Alwar",
        title: "Royal Dynasty Connoisseur",
        rating: 5,
        dish: "Banarasi Paan Smoked Negroni",
        comment: "The oakwood cloche unveiling plumes of betel-leaf smoke at our table was an unforgettable performance. A masterclass in luxury dining.",
        content: "The oakwood cloche unveiling plumes of betel-leaf smoke at our table was an unforgettable performance. A masterclass in luxury dining.",
        date: "September 2026"
    }
];

function getLocalDB() {
    try {
        const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        if (!data.reviews || data.reviews.length === 0) {
            data.reviews = INITIAL_REVIEWS;
            fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
        }
        return data;
    } catch (e) {
        return { reviews: INITIAL_REVIEWS };
    }
}

function saveLocalDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
    try {
        if (getIsConnected()) {
            let reviews = await Review.find().sort({ createdAt: -1 });
            if (!reviews || reviews.length === 0) {
                reviews = await Review.insertMany(INITIAL_REVIEWS);
            }
            return res.json({ success: true, count: reviews.length, data: reviews });
        } else {
            const db = getLocalDB();
            return res.json({ success: true, count: db.reviews.length, data: db.reviews });
        }
    } catch (err) {
        next(err);
    }
};

// @desc    Submit a review
// @route   POST /api/reviews
// @access  Public / Authenticated
exports.createReview = async (req, res, next) => {
    try {
        const { author, title, rating, dish, comment } = req.body;

        if (!author || !rating || !comment) {
            return res.status(400).json({ success: false, error: 'Please provide author name, star rating, and review comment.' });
        }

        const reviewPayload = {
            author,
            title: title || 'Honored Guest',
            rating: Number(rating) || 5,
            dish: dish || 'Royal Chef Degustation',
            comment,
            createdAt: new Date().toISOString()
        };

        let savedReview;

        if (getIsConnected()) {
            savedReview = await Review.create(reviewPayload);
        } else {
            const db = getLocalDB();
            reviewPayload.id = 'rev-' + Date.now();
            reviewPayload._id = reviewPayload.id;
            db.reviews.unshift(reviewPayload);
            saveLocalDB(db);
            savedReview = reviewPayload;
        }

        return res.status(201).json({
            success: true,
            message: 'Your royal dining testament has been preserved.',
            data: savedReview
        });
    } catch (err) {
        next(err);
    }
};
