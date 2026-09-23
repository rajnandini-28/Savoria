const { getLocalDB, saveLocalDB } = require('../config/db');
const { calculateOrderPrice } = require('../utils/calculatePrice');

// @route   GET /api/cart
// @desc    Get current user's or session cart
const getCart = async (req, res) => {
    try {
        const userId = req.user?.id || req.query.userId || 'guest_session';
        const db = getLocalDB();
        const userCart = (db.cart || []).find(c => c.userId === userId) || { userId, items: [], couponCode: null, tipPercent: 10 };

        const coupon = userCart.couponCode ? (db.coupons || []).find(cp => cp.code === userCart.couponCode) : null;
        const financials = calculateOrderPrice(userCart.items, userCart.tipPercent, coupon);

        res.json({
            success: true,
            cart: {
                ...userCart,
                financials
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @route   POST /api/cart/items
// @desc    Add item to cart
const addItemToCart = async (req, res) => {
    try {
        const { id, title, price, image, quantity = 1, userId = req.user?.id || 'guest_session' } = req.body;

        if (!id || !title || price === undefined) {
            return res.status(400).json({ success: false, error: 'Product id, title, and price are required' });
        }

        const db = getLocalDB();
        if (!db.cart) db.cart = [];

        let userCart = db.cart.find(c => c.userId === userId);
        if (!userCart) {
            userCart = { userId, items: [], couponCode: null, tipPercent: 10 };
            db.cart.push(userCart);
        }

        const existingItem = userCart.items.find(i => i.id === id);
        if (existingItem) {
            existingItem.quantity += Number(quantity);
        } else {
            userCart.items.push({
                id,
                title,
                price: Number(price),
                image: image || '',
                quantity: Number(quantity)
            });
        }

        saveLocalDB(db);

        const financials = calculateOrderPrice(userCart.items, userCart.tipPercent);

        res.status(201).json({
            success: true,
            message: `Added ${title} to Order Tray`,
            cart: { ...userCart, financials }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @route   PATCH /api/cart/items/:id
// @desc    Update item quantity in cart
const updateCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, delta, userId = req.user?.id || 'guest_session' } = req.body;

        const db = getLocalDB();
        if (!db.cart) db.cart = [];

        const userCart = db.cart.find(c => c.userId === userId);
        if (!userCart) return res.status(404).json({ success: false, error: 'Cart not found' });

        const item = userCart.items.find(i => i.id === id);
        if (!item) return res.status(404).json({ success: false, error: 'Item not found in cart' });

        if (quantity !== undefined) {
            item.quantity = Number(quantity);
        } else if (delta !== undefined) {
            item.quantity += Number(delta);
        }

        if (item.quantity <= 0) {
            userCart.items = userCart.items.filter(i => i.id !== id);
        }

        saveLocalDB(db);

        const financials = calculateOrderPrice(userCart.items, userCart.tipPercent);

        res.json({
            success: true,
            cart: { ...userCart, financials }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @route   DELETE /api/cart/items/:id
// @desc    Remove single item from cart
const removeCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id || req.body.userId || 'guest_session';

        const db = getLocalDB();
        if (!db.cart) db.cart = [];

        const userCart = db.cart.find(c => c.userId === userId);
        if (userCart) {
            userCart.items = userCart.items.filter(i => i.id !== id);
            saveLocalDB(db);
        }

        res.json({
            success: true,
            message: 'Item removed from tray'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @route   DELETE /api/cart
// @desc    Clear entire cart
const clearCart = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId || 'guest_session';
        const db = getLocalDB();
        if (db.cart) {
            const userCart = db.cart.find(c => c.userId === userId);
            if (userCart) {
                userCart.items = [];
                userCart.couponCode = null;
                saveLocalDB(db);
            }
        }

        res.json({
            success: true,
            message: 'Order Tray cleared'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getCart,
    addItemToCart,
    updateCartItem,
    removeCartItem,
    clearCart
};
