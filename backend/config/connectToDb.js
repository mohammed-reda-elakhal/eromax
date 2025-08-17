const mongoose = require("mongoose");
require('dotenv').config();

module.exports = async () => {
    try {
        // Disable automatic index creation in production; use migrations instead
        if (process.env.NODE_ENV === 'production') {
            mongoose.set('autoIndex', false);
        } else {
            mongoose.set('autoIndex', true);
        }

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
