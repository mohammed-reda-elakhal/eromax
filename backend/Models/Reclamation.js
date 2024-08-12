const mongoose = require("mongoose");


const reclamationSchema = new mongoose.Schema({
    clientId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Client'
    },
    subject:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true
    },
    resolu:{
        type:Boolean,
        default:false
    }
    

},{
    timestamps: true
});
const Reclamation = mongoose.model('Reclamation',reclamationSchema);

module.exports={
    Reclamation

};