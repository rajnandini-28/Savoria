const express = require('express');
const router = express.Router();
const {
    submitContact,
    getContactInquiries,
    subscribeNewsletter
} = require('../controllers/contactController');

router.route('/')
    .post(submitContact)
    .get(getContactInquiries);

router.post('/newsletter', subscribeNewsletter);

module.exports = router;
