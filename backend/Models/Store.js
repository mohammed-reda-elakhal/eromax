const mongoose = require("mongoose");
const { Wallet } = require("./Wallet");
const moment = require("moment");

// Generate unique wallet key function
const generateWalletKey = () => {
    const date = moment().format('YYYYMMDD-HH-mm');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `EROMAX-WALLET-${date}-${random}`;
};

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
    adress: {
        type: String,
        trim: true,
    },
    Bio: {
        type: String,
        trim: true,
    },
    tele: {
        type: String,
        trim: true,
    },
    message: {
        type: String,
        trim: true,
        maxlength: 200
    },
    default: {
        type: Boolean,
        default: false // This should only be defined once
    },
    solde : {
        type : Number,
        default : 0 ,
    },
    auto_DR:{
        type:Boolean,
        default:false
    },
   
}, { timestamps: true });

// Post-save middleware to create wallet for new stores
StoreSchema.post('save', async function(doc, next) {
    try {
        // Check if this is a new store
        if (this.isNew) {
            // Check if wallet already exists
            const existingWallet = await Wallet.findOne({ store: doc._id });
            if (!existingWallet) {
                // Create new wallet
                const wallet = new Wallet({
                    key: generateWalletKey(),
                    store: doc._id,
                    solde: 0,
                    active: true,
                    activationDate: Date.now()
                });
                await wallet.save();
            }
        }
        next();
    } catch (error) {
        next(error);
    }
});

const Store = mongoose.model('Store', StoreSchema);

module.exports = {
    Store
};
