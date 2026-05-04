const SupportTicket = require('../models/SupportTicket');

// @desc    Create a new support ticket
// @route   POST /api/tickets
// @access  Private (Student)
const createTicket = async (req, res) => {
    try {
        const { subject, description, recipientType, recipientId } = req.body;
        
        const ticketData = {
            studentId: req.user._id,
            subject,
            description,
            recipientType
        };

        // Only add recipientId if it's a valid non-empty string
        if (recipientId && recipientId.trim() !== "") {
            ticketData.recipientId = recipientId;
        }

        const ticket = await SupportTicket.create(ticketData);

        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Student view their tickets
// @route   GET /api/tickets/student
// @access  Private (Student)
const getStudentTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.find({ studentId: req.user._id })
            .populate('recipientId', 'name role')
            .sort({ createdAt: -1 });
        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Teacher view tickets directed to them
// @route   GET /api/tickets/teacher
// @access  Private (Teacher)
const getTeacherTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.find({ 
            recipientType: 'Teacher', 
            recipientId: req.user._id 
        }).populate('studentId', 'name email');
        
        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin view all tickets
// @route   GET /api/tickets/admin
// @access  Private (Admin)
const getAdminTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.find({})
            .populate('studentId', 'name email')
            .populate('recipientId', 'name role')
            .sort({ createdAt: -1 });
        
        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add response to ticket
// @route   POST /api/tickets/:id/respond
// @access  Private (Student, Teacher, Admin)
const respondToTicket = async (req, res) => {
    try {
        const { message } = req.body;
        const ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Check if user is authorized to respond
        // Student who created it, the recipient teacher, or an admin
        const isCreator = ticket.studentId.toString() === req.user._id.toString();
        const isRecipient = ticket.recipientId && ticket.recipientId.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isCreator && !isRecipient && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to respond to this ticket' });
        }

        ticket.responses.push({
            responderId: req.user._id,
            message
        });

        // Auto change status if admin or teacher responds
        if (isAdmin || isRecipient) {
            ticket.status = 'In Progress';
        }

        await ticket.save();
        res.status(200).json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update ticket status
// @route   PATCH /api/tickets/:id/status
// @access  Private (Teacher, Admin)
const updateTicketStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Logic check: only recipients or admins can change status (usually)
        const isRecipient = ticket.recipientId && ticket.recipientId.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isRecipient && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to update status' });
        }

        ticket.status = status;
        await ticket.save();
        
        res.status(200).json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get ticket details
// @route   GET /api/tickets/:id
// @access  Private
const getTicketById = async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id)
            .populate('studentId', 'name email')
            .populate('responses.responderId', 'name role');

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Mark as read if the current user is the recipient or an admin
        const isRecipient = ticket.recipientId && ticket.recipientId.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        
        if ((isRecipient || isAdmin) && !ticket.isReadByRecipient) {
            ticket.isReadByRecipient = true;
            await ticket.save();
        }

        res.status(200).json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a ticket (edit subject/description)
// @route   PUT /api/tickets/:id
// @access  Private (Student, Teacher, Admin - Creator only)
const updateTicket = async (req, res) => {
    try {
        const { subject, description } = req.body;
        const ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Only the creator of the ticket can edit it
        if (ticket.studentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this ticket' });
        }

        // Check if status is "Open" - only tickets in "Open" status can be edited
        if (ticket.status !== 'Open') {
            return res.status(400).json({ 
                message: `Cannot edit ticket when status is ${ticket.status}. Only "Open" tickets can be edited.` 
            });
        }

        ticket.subject = subject || ticket.subject;
        ticket.description = description || ticket.description;

        const updatedTicket = await ticket.save();
        res.status(200).json(updatedTicket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a ticket
// @route   DELETE /api/tickets/:id
// @access  Private (Student, Teacher, Admin - Creator only)
const deleteTicket = async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Only the creator can delete it
        if (ticket.studentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this ticket' });
        }

        await ticket.deleteOne();
        res.status(200).json({ message: 'Ticket removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createTicket,
    getStudentTickets,
    getTeacherTickets,
    getAdminTickets,
    respondToTicket,
    updateTicketStatus,
    getTicketById,
    updateTicket,
    deleteTicket
};
