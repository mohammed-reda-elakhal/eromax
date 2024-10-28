const express = require('express');
const router = express.Router();
const { getNotifications, getNotificationsByVisibility, createNotification, deleteNotification, updateNotification } = require('../Controllers/notificationController');



router.route('/')
  .get(getNotifications)
  .post(createNotification);

router.route('/visible')
  .get(getNotificationsByVisibility);

router.route('/:id')
  .delete(deleteNotification)
  .put(updateNotification);

module.exports = router;
