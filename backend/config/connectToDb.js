const mongoose=require("mongoose");
require('dotenv').config();
module.exports=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_CLOUD_URI);
        console.log("Connected to MongoDb ^_^");

    }catch(error){
        console.error("Connection Failed to MobgoDB!",error);
    }

}