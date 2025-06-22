const mongoose = require("mongoose");

// Define the schema for a canvas document
const drawingSchema = new mongoose.Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },  // Owner of the canvas
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],         // Shared users
    content: [{ type: mongoose.Schema.Types.Mixed }],                               // Drawing elements (mixed type)
    createdOn: { type: Date, default: Date.now }                                    // Creation timestamp
});

// Exporting the model to be used in controllers
module.exports = mongoose.model("Canvas", drawingSchema);
