const moongose = require("mongoose");


const StroreSchema = new moongose.Schema({

    id_client:{
        type:moongose.Schema.Types.ObjectId,
        ref:'Client',
        required:true
    },
    image:{
        type : Object,
        default : {
            url : "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_640.png",
            publicId : null
        }
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