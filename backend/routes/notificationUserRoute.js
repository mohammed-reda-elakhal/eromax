// routes/notification_user.routes.js
const express = require('express');
const router = express.Router();
const {createNotification,getAllNotifications,markAsRead}= require('../Controllers/notificationUserController');

router.post('/',createNotification);
router.get('/',getAllNotifications);
router.patch('/:id/read',markAsRead);

module.exports = router;
