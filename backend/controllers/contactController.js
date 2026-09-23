const Contact = require('../models/Contact');
const { sendContactDualEmail } = require('../utils/emailService');
const { getIsConnected } = require('../config/db');
const path = require('path');
const fs = require('fs');

const DB_FILE = path.join(__dirname, '../data/database.json');

function getLocalDB() {
    try {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
        return { contacts: [], newsletter: [] };
    }
}

function saveLocalDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// @desc    Submit a contact inquiry & trigger dual email dispatch
// @route   POST /api/contact
// @access  Public
exports.submitContact = async (req, res, next) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                error: 'Please provide name, email, and message.'
            });
        }

        const inquiryData = {
            name,
            email: email.toLowerCase(),
            phone: phone || '',
            subject: subject || 'General Inquiry',
            message,
            createdAt: new Date().toISOString()
        };

        let savedContact;

        if (getIsConnected()) {
            savedContact = await Contact.create(inquiryData);
        } else {
            const db = getLocalDB();
            if (!db.contacts) db.contacts = [];
            inquiryData.id = 'cnt-' + Date.now();
            inquiryData._id = inquiryData.id;
            db.contacts.unshift(inquiryData);
            saveLocalDB(db);
            savedContact = inquiryData;
        }

        // Dual Email Notification (Guest Receipt + Admin Alert)
        const emailStatus = await sendContactDualEmail({
            name,
            email: email.toLowerCase(),
            phone,
            subject,
            message
        });

        return res.status(201).json({
            success: true,
            message: `Thank you, ${name}. Your message has been sent to our concierge desk.`,
            contact: savedContact,
            emailStatus: {
                guestDelivered: emailStatus.guestSent,
                adminDelivered: emailStatus.adminSent,
                previewUrl: emailStatus.previewUrl
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all contact inquiries
// @route   GET /api/contact
// @access  Private/Admin
exports.getContactInquiries = async (req, res, next) => {
    try {
        if (getIsConnected()) {
            const contacts = await Contact.find().sort({ createdAt: -1 });
            return res.json({ success: true, count: contacts.length, data: contacts });
        } else {
            const db = getLocalDB();
            const contacts = db.contacts || [];
            return res.json({ success: true, count: contacts.length, data: contacts });
        }
    } catch (err) {
        next(err);
    }
};

// @desc    Subscribe to royal newsletter
// @route   POST /api/contact/newsletter
// @access  Public
exports.subscribeNewsletter = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
        }

        const db = getLocalDB();
        if (!db.newsletter) db.newsletter = [];
        
        const exists = db.newsletter.find(n => n.email === email.toLowerCase());
        if (!exists) {
            db.newsletter.push({ email: email.toLowerCase(), date: new Date().toISOString() });
            saveLocalDB(db);
        }

        return res.json({
            success: true,
            message: 'You have been inducted into the SAVORIA Royal Gastronomy Gazette.'
        });
    } catch (err) {
        next(err);
    }
};
