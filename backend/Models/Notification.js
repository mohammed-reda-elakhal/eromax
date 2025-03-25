const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'success', 'error'],
        default: 'info'
    },
    priority: {
        type: Number,
        default: 3,  // 1: High, 2: Medium, 3: Low
    },
    visibility: {
        type: Boolean,
        default: false
    },
    link: {
        url: String,
        text: String
    },
    action: {
        text: String,
        endpoint: String
    }
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = {
    Notification
}