const Ticket = require('../models/ticket.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const socketManager = require('../socketManager/socketManager');

// 1. Create a Ticket (All Roles)
exports.createTicket = async (req, res) => {
    try {
        const { subject, description, priority, category } = req.body;
        const ticket = await Ticket.create({
            schoolId: req.user.schoolId,
            openedBy: req.user._id,
            subject,
            description,
            priority,
            category
        });

        const populated = await ticket.populate('openedBy', 'firstName lastName role photo');
        
        // Notify Admins in real-time
        console.log(`[TICKET_SOCKET] Broadcaster. Role: School_Admin/Super_Admin, Event: NEW_TICKET`);
        socketManager.broadcastToRole('School_Admin', 'NEW_TICKET', populated);
        socketManager.broadcastToRole('Super_Admin', 'NEW_TICKET', populated);

        res.status(201).json({ message: 'Support ticket initialized', data: ticket });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 2. Get Tickets (Filtered by Role)
exports.getTickets = async (req, res) => {
    try {
        const query = {};
        
        // Super Admin sees everything across schools (or filter by query param)
        if (req.user.role !== 'Super_Admin') {
            query.schoolId = req.user.schoolId;
        }

        // Non-Admins only see their own
        if (!['School_Admin', 'Super_Admin'].includes(req.user.role)) {
            query.openedBy = req.user._id;
        }

        const tickets = await Ticket.find(query)
            .populate('openedBy', 'firstName lastName role photo')
            .sort({ updatedAt: -1 });

        res.json(tickets);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 3. Get Ticket Detail
exports.getTicketDetail = async (req, res) => {
    try {
        const query = { _id: req.params.id };
        if (req.user.role !== 'Super_Admin') {
            query.schoolId = req.user.schoolId;
        }

        const ticket = await Ticket.findOne(query)
        .populate('openedBy', 'firstName lastName role photo')
        .populate('replies.senderId', 'firstName lastName role photo');

        if (!ticket) return res.status(404).json({ message: 'Ticket node not detected' });

        // Security: Ensure owner or admin
        const isOwner = ticket.openedBy && ticket.openedBy._id.toString() === req.user._id.toString();
        const isAdmin = ['School_Admin', 'Super_Admin'].includes(req.user.role);

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Access denied to this communication node' });
        }

        res.json(ticket);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 4. Add Reply
exports.addReply = async (req, res) => {
    try {
        const { message } = req.body;
        const query = { _id: req.params.id };
        if (req.user.role !== 'Super_Admin') {
            query.schoolId = req.user.schoolId;
        }

        const ticket = await Ticket.findOne(query);

        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        ticket.replies.push({
            senderId: req.user._id,
            message
        });

        // Auto transition to In_Progress if admin replies
        if (['School_Admin', 'Super_Admin'].includes(req.user.role) && ticket.status === 'Open') {
            ticket.status = 'In_Progress';
        }

        await ticket.save();
        
        const updated = await Ticket.findById(ticket._id)
            .populate('openedBy', 'firstName lastName role photo')
            .populate('replies.senderId', 'firstName lastName role photo');

        // Socket Notification Logic:
        // 1. If an Admin (School or Super) replies, notify the user who opened the ticket
        // 2. If a User (Teacher/Parent) replies, notify Admins (School/Super)
        const isAdminReplier = ['School_Admin', 'Super_Admin'].includes(req.user.role);
        
        if (isAdminReplier) {
            const recipientId = updated.openedBy._id;
            socketManager.sendToUser(recipientId, 'TICKET_REPLY', updated);
            socketManager.broadcastToRole('School_Admin', 'TICKET_REPLY', updated);
            socketManager.broadcastToRole('Super_Admin', 'TICKET_REPLY', updated);

            const nc = require('./notification.controller');
            const openerRole = updated.openedBy?.role;
            const ticketLink =
                openerRole === 'Teacher' ? '/teacher/tickets'
                : openerRole === 'Parent' ? '/parent/tickets'
                : '/school-admin/tickets';
            await nc.sendNotification({
                schoolId: ticket.schoolId,
                recipient: recipientId,
                sender: req.user._id,
                type: 'General',
                title: 'Support ticket reply',
                message: `New reply on: ${ticket.subject}`,
                link: ticketLink,
            });
        } else {
            socketManager.broadcastToRole('School_Admin', 'TICKET_REPLY', updated);
            socketManager.broadcastToRole('Super_Admin', 'TICKET_REPLY', updated);

            const nc = require('./notification.controller');
            const admins = await User.find({
                $or: [
                    { schoolId: ticket.schoolId, role: 'School_Admin', isActive: true },
                    { role: 'Super_Admin', isActive: true },
                ],
            }).select('_id role');

            for (const admin of admins) {
                await nc.sendNotification({
                    schoolId: ticket.schoolId,
                    recipient: admin._id,
                    sender: req.user._id,
                    type: 'General',
                    title: 'Support ticket update',
                    message: `${updated.openedBy?.firstName || 'User'} replied on: ${ticket.subject}`,
                    link: admin.role === 'Super_Admin' ? '/superadmin/support' : '/school-admin/tickets',
                });
            }
        }

        res.json({ message: 'Reply registered', data: updated });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 5. Update Status (Resolve/Close)
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const query = { _id: req.params.id };
        if (req.user.role !== 'Super_Admin') {
            query.schoolId = req.user.schoolId;
        }

        const ticket = await Ticket.findOneAndUpdate(
            query,
            { status },
            { new: true }
        ).populate('openedBy', 'firstName lastName role photo')
         .populate('replies.senderId', 'firstName lastName role photo');

        if (ticket) {
            const isAdmin = ['School_Admin', 'Super_Admin'].includes(req.user.role);
            
            console.log(`[TICKET_SOCKET] Status Change. Notifying user: ${ticket.openedBy._id}`);
            socketManager.sendToUser(ticket.openedBy._id, 'TICKET_STATUS_CHANGED', ticket);
            
            // Notify all admins of the change
            socketManager.broadcastToRole('School_Admin', 'TICKET_STATUS_CHANGED', ticket);
            socketManager.broadcastToRole('Super_Admin', 'TICKET_STATUS_CHANGED', ticket);
        }

        res.json({ message: `Ticket status pivoted to ${status}`, data: ticket });
    } catch (err) { res.status(500).json({ message: err.message }); }
};
