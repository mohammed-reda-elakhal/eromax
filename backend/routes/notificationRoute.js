const { getNotifications, createNotification, deleteNotification, markAsRead, updateNotification, getNotificationsByVisibility } = require('../Controllers/notificationController');

const router = require('express').Router();
// api/notification
router.route('/')
        .get(getNotifications)
        .post(createNotification);

router.route('/visible')
        .get(getNotificationsByVisibility)
            
router.route('/:id')
        .delete(deleteNotification)
        .put(updateNotification);

module.exports=router;