const Joi = require("joi");
//const Joi = require("joi");
const mongoose = require ("mongoose");

//User Schema 
const ProfileSchema = new mongoose.Schema({
    id:{
        type:String,
    },
    username:{
        type:String,
        required:true,
        trim:true,
        mainlenght:2,
        maxlenght:100
    },
    CIN:{
        type:String,
        required:true,
        mainlenght:5,


    },
    email:{
        type:String,
        required :true,
        trim:true,
        minlenght:5,
        maxlength:100,
        unique:true,


    },
    ville:{
        type:String,
        required:true,
    },
    adresse:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required :true,
        trim:true,
        minlenght:5,
    },
    Tel:{
        type:Number,
        required:true,
        maxlenght:10,
        minlenght:10


    },
    isAdmin:{
        type:Boolean,
        default:false,
    },
    isAccountVerified:{
        type:Boolean,
        default:false,
    },
    profilePhoto: {
        type:Object,
        default:{
            url:"https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png",
            publicId :null,
        }

    }
    


},{
    timestamps:true  //genreate created at and updated up automatically 
});


//Profile Model
const  Profile = mongoose.model("Profile",ProfileSchema);


// Validate  Register Profile

function validateRegisterProfile(obj){
    const schema = Joi.object({
        username: Joi.string().trim().min(2).max(100).required(),
        email :Joi.string().trim().min(8).max(100).required().email(),
        password:Joi.string().trim().min(5).required(),
        ville: Joi.string().required(),
        adresse: Joi.string().required(),
        CIN:Joi.string().required().min(5),
        Tel:Joi.string().required().min(10).max(10)
    
    });
    return schema.validate(obj);
}



module.exports={
    Profile,
    validateRegisterProfile
}