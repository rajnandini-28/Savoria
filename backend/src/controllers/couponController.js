const { getLocalDB, saveLocalDB } = require('../config/db');

// @route   POST /api/coupons/validate
// @desc    Validate a promotional coupon code
const validateCoupon = async (req, res) => {
    try {
        const { code, subtotal = 0 } = req.body;

        if (!code) {
            return res.status(400).json({ success: false, error: 'Please enter a coupon code' });
        }

        const normalizedCode = String(code).toUpperCase().trim();
        const db = getLocalDB();
        const DEFAULT_COUPONS = [
            { code: 'ROYAL20', discountPercent: 20, maxDiscount: 500, minOrder: 1000, active: true },
            { code: 'MAHARAJA50', discountPercent: 50, maxDiscount: 1000, minOrder: 2500, active: true },
            { code: 'SAVORIA100', discountFixed: 100, minOrder: 800, active: true }
        ];
        const coupons = (db.coupons && db.coupons.length > 0) ? db.coupons : DEFAULT_COUPONS;

        const coupon = coupons.find(c => c.code === normalizedCode && c.active);

        if (!coupon) {
            return res.status(404).json({ success: false, error: `Promo code "${normalizedCode}" is invalid or expired` });
        }

        if (subtotal < (coupon.minOrder || 0)) {
            return res.status(400).json({
                success: false,
                error: `Minimum order value for "${coupon.code}" is ₹${coupon.minOrder}. Current subtotal is ₹${subtotal}.`
            });
        }

        let discount = 0;
        if (coupon.discountPercent) {
            discount = subtotal * (coupon.discountPercent / 100);
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else if (coupon.discountFixed) {
            discount = Math.min(subtotal, coupon.discountFixed);
        }

        res.json({
            success: true,
            message: `Royal Promo Code "${coupon.code}" Applied!`,
            coupon: {
                code: coupon.code,
                discountPercent: coupon.discountPercent || 0,
                discountFixed: coupon.discountFixed || 0,
                discountAmount: Math.round(discount)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @route   GET /api/coupons
// @desc    Get all coupons (Admin)
const getCoupons = async (req, res) => {
    try {
        const db = getLocalDB();
        res.json({ success: true, coupons: db.coupons || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @route   POST /api/coupons
// @desc    Create new coupon (Admin)
const createCoupon = async (req, res) => {
    try {
        const { code, discountPercent, discountFixed, maxDiscount, minOrder } = req.body;
        if (!code) return res.status(400).json({ success: false, error: 'Code is required' });

        const db = getLocalDB();
        if (!db.coupons) db.coupons = [];

        const newCoupon = {
            id: 'cpn_' + Date.now(),
            code: code.toUpperCase().trim(),
            discountPercent: Number(discountPercent) || 0,
            discountFixed: Number(discountFixed) || 0,
            maxDiscount: Number(maxDiscount) || 500,
            minOrder: Number(minOrder) || 1000,
            active: true,
            createdAt: new Date().toISOString()
        };

        db.coupons.push(newCoupon);
        saveLocalDB(db);

        res.status(201).json({ success: true, message: 'Coupon created', coupon: newCoupon });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    validateCoupon,
    getCoupons,
    createCoupon
};
