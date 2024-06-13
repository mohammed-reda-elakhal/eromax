const mongoose = require("mongoose");
const {User} = require("./User");


const ClientSchema= new mongoose.Schema({
 
    //add additional attributes

},{discriminatorKey:'type'})

// Creating the Client model by extending the User model with discriminator
const Client= User.discriminator("Client",ClientSchema);

module.exports={
    Client
}
