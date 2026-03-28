const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');
const { auth } = require('../middleware/auth');

// All ticket routes require authentication
router.use(auth);

router.post('/', ticketController.createTicket);
router.get('/', ticketController.getTickets);
router.get('/:id', ticketController.getTicketDetail);
router.post('/:id/reply', ticketController.addReply);
router.put('/:id/status', ticketController.updateStatus);

module.exports = router;
