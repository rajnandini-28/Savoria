const Reservation = require('../models/Reservation');
const { sendReservationDualEmail } = require('../utils/emailService');
const { getIsConnected } = require('../config/db');
const path = require('path');
const fs = require('fs');

const DB_FILE = path.join(__dirname, '../data/database.json');

function getLocalDB() {
    try {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
        return { reservations: [], users: [], orders: [], contacts: [], reviews: [] };
    }
}

function saveLocalDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// @desc    Create new table reservation & trigger dual email dispatch
// @route   POST /api/reservations
// @access  Public (or Authenticated)
exports.createReservation = async (req, res, next) => {
    try {
        const {
            fullName,
            email,
            phone,
            guests,
            guestsText,
            date,
            formattedDate,
            time,
            timeText,
            seating,
            occasion,
            specialNotes,
            requests
        } = req.body;

        if (!fullName || !email || !phone || !date || !time) {
            return res.status(400).json({
                success: false,
                error: 'Please provide full name, email, phone number, date, and time for the reservation.'
            });
        }

        const bookingRef = 'SAV-' + Math.floor(1000 + Math.random() * 9000);
        const partySize = parseInt(guests) || 2;
        const displayGuests = guestsText || `${partySize} ${partySize === 1 ? 'Guest' : 'Guests'}`;
        const displayTime = timeText || time;
        const displayDate = formattedDate || date;
        const notes = specialNotes || requests || '';

        const reservationPayload = {
            bookingRef,
            fullName,
            email: email.toLowerCase(),
            phone,
            guests: partySize,
            guestsText: displayGuests,
            date,
            formattedDate: displayDate,
            time,
            timeText: displayTime,
            seating: seating || "Grand Dining Hall",
            occasion: occasion || "Dining Experience",
            specialNotes: notes,
            status: 'confirmed',
            userId: req.user ? req.user._id || req.user.id : null,
            createdAt: new Date().toISOString()
        };

        let savedReservation;

        if (getIsConnected()) {
            savedReservation = await Reservation.create(reservationPayload);
        } else {
            const db = getLocalDB();
            if (!db.reservations) db.reservations = [];
            reservationPayload.id = 'res-' + Date.now();
            reservationPayload._id = reservationPayload.id;
            db.reservations.unshift(reservationPayload);
            saveLocalDB(db);
            savedReservation = reservationPayload;
        }

        // Dual Email Dispatch (Guest & Admin)
        const emailStatus = await sendReservationDualEmail({
            bookingRef,
            fullName,
            email: email.toLowerCase(),
            phone,
            formattedDate: displayDate,
            timeText: displayTime,
            guestsText: displayGuests,
            seating: seating || "Grand Dining Hall",
            specialNotes: notes
        });

        return res.status(201).json({
            success: true,
            message: `Reservation confirmed for ${fullName}. Confirmation code: ${bookingRef}`,
            reservation: savedReservation,
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

// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Public / Admin
exports.getReservations = async (req, res, next) => {
    try {
        if (getIsConnected()) {
            let query = {};
            if (req.user && req.user.role !== 'admin') {
                query = { $or: [{ userId: req.user._id }, { email: req.user.email.toLowerCase() }] };
            }
            const reservations = await Reservation.find(query).sort({ createdAt: -1 });
            return res.json({
                success: true,
                count: reservations.length,
                data: reservations
            });
        } else {
            const db = getLocalDB();
            let reservations = db.reservations || [];
            if (req.user && req.user.role !== 'admin') {
                reservations = reservations.filter(r => 
                    (r.userId && r.userId === (req.user._id || req.user.id)) ||
                    (r.email && r.email.toLowerCase() === req.user.email.toLowerCase())
                );
            }
            return res.json({
                success: true,
                count: reservations.length,
                data: reservations
            });
        }
    } catch (err) {
        next(err);
    }
};

// @desc    Get reservation by Reference ID
// @route   GET /api/reservations/:ref
// @access  Public
exports.getReservationByRef = async (req, res, next) => {
    try {
        const ref = req.params.ref;
        if (getIsConnected()) {
            const reservation = await Reservation.findOne({
                $or: [{ bookingRef: ref }, { _id: ref.match(/^[0-9a-fA-F]{24}$/) ? ref : null }]
            });
            if (!reservation) {
                return res.status(404).json({ success: false, error: 'Reservation not found.' });
            }
            return res.json({ success: true, data: reservation });
        } else {
            const db = getLocalDB();
            const reservation = (db.reservations || []).find(r => r.bookingRef === ref || r.id === ref || r._id === ref);
            if (!reservation) {
                return res.status(404).json({ success: false, error: 'Reservation not found.' });
            }
            return res.json({ success: true, data: reservation });
        }
    } catch (err) {
        next(err);
    }
};

// @desc    Update reservation status
// @route   PATCH /api/reservations/:id/status
// @access  Private/Admin
exports.updateReservationStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ['confirmed', 'seated', 'completed', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: `Invalid status. Valid values: ${validStatuses.join(', ')}` });
        }

        const id = req.params.id;

        if (getIsConnected()) {
            const reservation = await Reservation.findOneAndUpdate(
                { $or: [{ bookingRef: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
                { status },
                { new: true }
            );
            if (!reservation) {
                return res.status(404).json({ success: false, error: 'Reservation not found.' });
            }
            return res.json({ success: true, message: 'Reservation updated', data: reservation });
        } else {
            const db = getLocalDB();
            const reservation = (db.reservations || []).find(r => r.bookingRef === id || r.id === id || r._id === id);
            if (!reservation) {
                return res.status(404).json({ success: false, error: 'Reservation not found.' });
            }
            reservation.status = status;
            saveLocalDB(db);
            return res.json({ success: true, message: 'Reservation updated', data: reservation });
        }
    } catch (err) {
        next(err);
    }
};
