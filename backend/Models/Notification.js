const { required } = require('joi');
const mongoose = require('mongoose');


const notificationSchema = new mongoose.Schema({
    message:{
        type:String,
        required:true
    },
    visibility:{
        type:Boolean,
        default:false
    }

},{timestamps:true});

const Notification = mongoose.model("Notification",notificationSchema);

module.exports={
    Notification
}