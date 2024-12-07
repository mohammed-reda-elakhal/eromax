const express = require('express');
const router = express.Router();
const { getNotifications, getNotificationsByVisibility, createNotification, deleteNotification, updateNotification } = require('../Controllers/notificationController');
const { verifyToken } = require('../Middlewares/VerifyToken');
const { getNotificationByStore, markAsRead } = require('../Controllers/notificationUserController');



router.route('/')
  .get(getNotifications)
  .post(createNotification);

router.route('/user')
  .get(verifyToken , getNotificationByStore)

router.route('/visible')
  .get(getNotificationsByVisibility);

router.route('/:id')
  .delete(deleteNotification)
  .put(updateNotification);

router.route('/read/:id')
  .patch(markAsRead)

module.exports = router;