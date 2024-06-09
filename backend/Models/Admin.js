const moongose= require("mongoose");
const {User} = require("./User");


const AdminSchema = new moongose.Schema({


},{discriminatorKey:'type'});

const Admin = User.discriminator("Admin",AdminSchema);

module.exports={
    Admin

}