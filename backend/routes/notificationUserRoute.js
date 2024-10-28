// routes/notification_user.routes.js
const express = require('express');
const router = express.Router();
const {createNotification,getAllNotifications,markAsRead, getNotificationByStore}= require('../Controllers/notificationUserController');
const { verifyToken } = require('../Middlewares/VerifyToken');

router.post('/',createNotification);
router.get('/',getAllNotifications);
router.patch('/:id/read',markAsRead);

// Route pour notification de livraison de colis
router.post('/notification/livraison', envoyerNotifLivraisonColis);

// Route pour notification de versement de retrait
router.post('/notification/retrait',envoyerNotifVersementRetrait);

module.exports = router;


module.exports = router;
