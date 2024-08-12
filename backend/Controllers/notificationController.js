const {Notification} = require('../Models/Notification');
const asyncHandler =require('express-async-handler')

/**
 * 
 */
const createNotification = asyncHandler(async (req, res) => {
    try {
        const {title, message } = req.body;

        const notification = new Notification({
            title,
            message
        });

        await notification.save();
        res.status(201).json({ message: 'Notification created successfully', notification });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create notification', error: error.message });
    }
});
/**
 * 
 */
const getNotifications = asyncHandler(async(req,res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve notifications', error: error.message });
    }
});
/**
 * 
 */
/**
 * @method 
 */
const markAsRead = asyncHandler(async(req,res)=>{
   try{
    const {id}=req.params;
    const notif= await Notification.findById(id);
    if(!notif ){
        return res.status(404).json({message:'Notification not found'});  
    }
    notif.isRead=true;
    await notif.save();
    res.status(200).json({message:'Notification marked as read'});
    
   }catch(e){
    res.status(500).json({message:'Failed to update notification'});

   }
    
});
/**
 * 
 * @param {id} req 
 * @returns 
 */
const deleteNotification = async (req, res) => {
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
};
module.exports={
    createNotification,
    getNotifications,
    markAsRead,
    deleteNotification
}

