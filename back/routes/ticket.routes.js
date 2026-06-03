const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');
const { auth } = require('../middleware/auth');
const academicYear = require('../middleware/academicYear');

// All ticket routes require authentication and academic year context
router.use(auth);
router.use(academicYear);

router.post('/', ticketController.createTicket);
router.get('/', ticketController.getTickets);
router.get('/:id', ticketController.getTicketDetail);
router.post('/:id/reply', ticketController.addReply);
router.put('/:id/status', ticketController.updateStatus);

module.exports = router;
