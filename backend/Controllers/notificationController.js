
const { Notification } = require('../Models/Notification');
const asyncHandler = require('express-async-handler');

/**
 * Create a notification
 */
const createNotification = asyncHandler(async (req, res) => {
    try {
        const notification = new Notification(req.body);
        await notification.save();
        res.status(201).json({ message: 'Notification created successfully', notification });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create notification', error: error.message });
    }
});

/**
 * Get all notifications
 */
const getNotifications = asyncHandler(async (req, res) => {
    const { visibility } = req.query; // Expecting a query parameter: visibility=true or visibility=false
    try {
        const query = visibility !== undefined ? { visibility } : {}; // Build query based on the visibility parameter
        const notifications = await Notification.find(query).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve notifications', error: error.message });
    }
});

/**
 * Get notifications by visibility (true/false)
 */
const getNotificationsByVisibility = asyncHandler(async (req, res) => {
    const { visibility } = req.query; // Expecting query parameter: visibility=true or visibility=false
    try {
        const notifications = await Notification.find({ visibility }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve notifications', error: error.message });
    }
});

/**
 * Update a notification
 */
const updateNotification = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const updatedNotification = await Notification.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedNotification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json({ message: 'Notification updated successfully', updatedNotification });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update notification', error: error.message });
    }
});

/**
 * Delete a notification
 */
const deleteNotification = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const notif = await Notification.findById(id);

        if (!notif) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        await notif.deleteOne();
        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete notification', error: error.message });
    }
});









module.exports = {
    createNotification,
    getNotifications,
    getNotificationsByVisibility,
    updateNotification,
    deleteNotification
};
