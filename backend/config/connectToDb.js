const mongoose=require("mongoose");
require('dotenv').config();
module.exports=async()=>{
    try{
        await mongoose.connect("mongodb://localhost:27017/Eromax");
        console.log("Connected to MongoDb ^_^");

    }catch(error){
        console.error("Connection Failed to MobgoDB!",error);
    }

}