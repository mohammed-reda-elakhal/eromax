const mongoose = require("mongoose");
require('dotenv').config();

module.exports = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error("MONGODB_URI is not defined in the .env file!");
            return;
        }

        await mongoose.connect(uri);
        console.log("Connected to MongoDb ^_^");
    } catch (error) {
        console.error("Connection Failed to MongoDB!", error.message);
        console.error("Error Stack:", error.stack);
    }
}
