const express = require('express');
const router = express.Router();
const { getCart, addItemToCart, updateCartItem, removeCartItem, clearCart } = require('../controllers/cartController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.use(optionalAuth);

router.get('/', getCart);
router.post('/items', addItemToCart);
router.patch('/items/:id', updateCartItem);
router.delete('/items/:id', removeCartItem);
router.delete('/', clearCart);

module.exports = router;
