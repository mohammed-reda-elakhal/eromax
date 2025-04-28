const mongoose = require("mongoose");

// Message schema for embedded messages in reclamation
const messageSchema = new mongoose.Schema({
    sender: {
        // Type of sender (Store, Admin, Team)
        senderType: {
            type: String,
            enum: ['Store', 'Admin', 'Team'],
            required: true
        },
        // ID reference to the sender
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        // Directly store sender information to avoid complex population
        nom: String,          // For Admin/Team users
        role: String,         // For Admin/Team users
        tele: String,         // For all users
        storeName: String     // For Store users
    },
    content: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Status update history schema
const statusUpdateSchema = new mongoose.Schema({
    previousStatus: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'closed']
    },
    newStatus: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'closed'],
        required: true
    },
    updatedBy: {
        type: {
            role: String,
            id: mongoose.Schema.Types.ObjectId,
            nom: String,
            tele: String
        },
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const reclamationSchema = new mongoose.Schema({
    store: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Store'
    },
    colis: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Colis' // Ensure this matches the correct model name
    },
    messages: [messageSchema],
    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'closed'],
        default: 'open'
    },
    closed: {
        type: Boolean,
        default: false
    },
    statusHistory: [statusUpdateSchema]
}, {
    timestamps: true
});

// Add a method to add a new message to the reclamation
reclamationSchema.methods.addMessage = function(senderType, senderId, content, senderInfo = {}) {
    this.messages.push({
        sender: {
            senderType,
            senderId,
            nom: senderInfo.nom,
            role: senderInfo.role,
            tele: senderInfo.tele,
            storeName: senderInfo.storeName
        },
        content,
        read: false,
        createdAt: new Date()
    });
    return this.save();
};

// Add a method to mark a message as read
reclamationSchema.methods.markMessageAsRead = function(messageId) {
    const message = this.messages.id(messageId);
    if (message) {
        message.read = true;
        return this.save();
    }
    return Promise.reject(new Error('Message not found'));
};

// Add a method to update status with history tracking
reclamationSchema.methods.updateStatus = function(newStatus, updatedBy) {
    // Save the previous status for history
    const previousStatus = this.status;

    // Update the status
    this.status = newStatus;

    // If status is 'closed', update the closed flag
    if (newStatus === 'closed') {
        this.closed = true;
    } else if (this.closed) {
        // If status is changing from closed to something else, update closed flag
        this.closed = false;
    }

    // Add to status history
    this.statusHistory.push({
        previousStatus,
        newStatus,
        updatedBy,
        updatedAt: new Date()
    });

    return this.save();
};

const Reclamation = mongoose.model('Reclamation', reclamationSchema);

module.exports = {
    Reclamation
};
