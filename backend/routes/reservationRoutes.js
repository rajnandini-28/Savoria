const express = require('express');
const router = express.Router();
const {
    createReservation,
    getReservations,
    getReservationByRef,
    updateReservationStatus
} = require('../controllers/reservationController');

router.route('/')
    .get(getReservations)
    .post(createReservation);

router.route('/:ref')
    .get(getReservationByRef);

router.route('/:id/status')
    .patch(updateReservationStatus);

module.exports = router;
