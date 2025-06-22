const mongoose = require("mongoose"); // Importing Mongoose to interact with MongoDB
require("dotenv").config(); // Load environment variables from .env file

// Function to initialize the MongoDB connection
const initializeDatabase = async () => {
    try {
        // Establishing a connection to MongoDB using Mongoose
        await mongoose.connect("mongodb+srv://sks372000:board123@cluster0.vs5zj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
            useNewUrlParser: true,        // Enables the new URL parser
            useUnifiedTopology: true,     // Enables the new server discovery and monitoring engine
        });

        // Log a success message if connected
        console.log("✅ MongoDB connection established successfully.");
    } catch (err) {
        // Log the error message if connection fails
        console.error("Error connecting to MongoDB:", err.message);
        process.exit(1); // Exit the app with failure code
    }
};

// Export the connection function to use in other files (like server.js)
module.exports = initializeDatabase;
