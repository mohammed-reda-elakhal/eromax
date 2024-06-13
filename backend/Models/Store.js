const moongose = require("mongoose");
const {Client} = require("./Client");


const StroreSchema = new moongose.Schema({

    id_client:{
        type:moongose.Schema.Types.ObjectId,
        ref:'Client',
        required:true
    },
    image:{
        type:String,
        default:'https://www.creativefabrica.com/wp-content/uploads/2019/02/Online-shop-shopping-shop-logo-by-DEEMKA-STUDIO-3-580x406.jpg'
    },
    storeName:{
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
},{timestamps:true});


const Store = moongose.model("Store",StroreSchema);

module.exports= {
    Store
}