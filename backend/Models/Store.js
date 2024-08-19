const { default: mongoose } = require("mongoose");
const moongose = require("mongoose");


const StoreSchema = new moongose.Schema({

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
    default:{
        type: Boolean,
        required: true,
    },
    somme:{
        type:Number
    }
},{timestamps:true});


const Store = mongoose.models.Store || mongoose.model('Store', StoreSchema);

module.exports= {
    Store
}
