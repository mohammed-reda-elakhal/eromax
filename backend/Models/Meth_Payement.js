const mongoose = require('mongoose');

const MethPayementSchema=new mongoose.Schema({
    Bank:{
        type:String
    },
    image:{
        url: {
            type: String,
            
        },
        public_id: {
            type: String,
           
        }
    
    },
    


});
const Meth_Payement= mongoose.model('Meth_Payement', MethPayementSchema);
module.exports=Meth_Payement