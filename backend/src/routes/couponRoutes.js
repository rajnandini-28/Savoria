const express = require('express');
const router = express.Router();
const { validateCoupon, getCoupons, createCoupon } = require('../controllers/couponController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.post('/validate', validateCoupon);
router.get('/', protect, requireAdmin, getCoupons);
router.post('/', protect, requireAdmin, createCoupon);

module.exports = router;
