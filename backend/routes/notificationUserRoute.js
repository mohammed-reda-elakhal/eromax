// routes/notification_user.routes.js
const express = require('express');
const router = express.Router();
const {createNotification,getAllNotifications,markAsRead, envoyerNotifLivraisonColis, envoyerNotifVersementRetrait}= require('../Controllers/notificationUserController');

router.post('/',createNotification);
router.get('/',getAllNotifications);
router.patch('/:id/read',markAsRead);


module.exports = router;
