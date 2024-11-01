// routes/notification_user.routes.js
const express = require('express');
const router = express.Router();
const {createNotification,getAllNotifications,markAsRead, getNotificationByStore}= require('../Controllers/notificationUserController');
const { verifyToken } = require('../Middlewares/VerifyToken');

router.post('/',createNotification);
router.get('/',getAllNotifications);

router.get('/user', verifyToken , getNotificationByStore);

router.patch('/read/:id',markAsRead);



module.exports = router;


module.exports = router;
