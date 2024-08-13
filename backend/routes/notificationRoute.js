const { getNotifications, createNotification, deleteNotification, markAsRead } = require('../Controllers/notificationController');

const router = require('express').Router();
// api/notification
router.route('/')
        .get(getNotifications)
        .post(createNotification);
            
router.route('/:id').delete(deleteNotification);
router.route('/:id/read').patch(markAsRead);

module.exports=router;