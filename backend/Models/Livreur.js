const mongoose = require("mongoose");
const {User} = require("./User");

const LivreurSchema = new mongoose.Schema({


},{discriminatorKey:'type'}
);

const Livreur=User.discriminator("Livreur",LivreurSchema);

module.exports={
    Livreur
}
