const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables from .env

const initializeDatabase = async () => {
    try {
        // Connect to MongoDB using the connection string from environment variables
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,        // Use the new URL parser
            useUnifiedTopology: true      // Use the new connection management engine
        });

        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error.message);
        process.exit(1); // Stop the server if DB connection fails
    }
};

module.exports = initializeDatabase;
