const { required } = require('joi');
const mongoose = require('mongoose');


const notificationSchema = new mongoose.Schema({
    id:{

    },
    title:{
        type:String,
        required:true,
        trim:true
    },
    message:{
        type:String,
        required:true
    },
    isRead:{
        type:Boolean,
        default:false
    }

},{timestamps:true});

const Notification = mongoose.model("Notification",notificationSchema);

module.exports={
    Notification
}