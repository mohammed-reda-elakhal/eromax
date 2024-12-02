const { required } = require('joi');
const mongoose= require('mongoose');


const PayementSchema = new mongoose.Schema({
    clientId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Client'
    },
    idBank:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Meth_Payement'
    },
    nom:{
        type:String,
        required:true

    },
    rib:{
        type:String,
        required:true
    },
    default:{
        type:Boolean,
        default:false

    }
});

const Payement = mongoose.model('Payement',PayementSchema)
module.exports=Payement;