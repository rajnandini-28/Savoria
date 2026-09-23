const express = require('express');
const router = express.Router();
const { getAddresses, addAddress, updateAddress, deleteAddress } = require('../controllers/addressController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.use(optionalAuth);

router.get('/', getAddresses);
router.post('/', addAddress);
router.patch('/:id', updateAddress);
router.delete('/:id', deleteAddress);

module.exports = router;
