// controllers/notification_user.controller.js
const Colis = require('../Models/Colis');
const Client = require('../Models/Client');
const NotificationUser = require('../Models/Notification_User');
const Demande_Retrait = require('../Models/Demande_Retrait');

exports.createNotification = async (req, res) => {
  try {
    const notification = new NotificationUser(req.body);
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await NotificationUser.find().populate('id_store');
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNotificationByStore = async (req, res) => {
  try {

    const is_read = false;
    const id_livreur = req.user.id ;
    const id_store = req.user.store;


    if(req.user.role === "client"){
      // Fetch notifications, filtering by id_store and is_read, sorted by createdAt in descending order
      const notifications = await NotificationUser
        .find({ id_store, is_read })
        .populate('id_store')
        .sort({ createdAt: -1 }); // Sort by creation date, latest first

      res.status(200).json(notifications);
    }else if(req.user.role === "livreur"){
      const notifications = await NotificationUser
        .find({ id_livreur, is_read })
        .populate('id_store')
        .sort({ createdAt: -1 }); // Sort by creation date, latest first

      res.status(200).json(notifications);
    }
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await NotificationUser.findByIdAndUpdate(id, { is_read: true }, { new: true });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.status(200).json({message : "cette notification est masquée !!"});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.deleteAllNotificationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Delete all notifications for the given userId
    const result = await NotificationUser.deleteMany({ user: userId });

    // Optionally, you can also check the result.deletedCount to inform how many were deleted.
    res.status(200).json({
      message: `touts les notifications supprimer.`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    res.status(500).json({ error: error.message });
  }
};
