const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipientType: {
        type: String,
        enum: ['Teacher', 'Admin', 'Student'],
        required: true
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // Admin recipient might not have a specific user ID if it's general, 
        // but the prompt says recipientId is a field.
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
        default: 'Open'
    },
    isReadByRecipient: {
        type: Boolean,
        default: false
    },
    responses: [
        {
            responderId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            message: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
