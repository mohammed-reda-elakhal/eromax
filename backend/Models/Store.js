const mongoose = require("mongoose");

const StoreSchema = new mongoose.Schema({
    id_client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    image: {
        type: Object,
        default: {
            url: "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_640.png",
            publicId: null
        }
    },
    storeName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    default: {
        type: Boolean,
        default: false // This should only be defined once
    },
    solde : {
        type : Number,
        default : 0 ,
    },
   
}, { timestamps: true });

const Store = mongoose.model('Store', StoreSchema);

module.exports = {
    Store
};
