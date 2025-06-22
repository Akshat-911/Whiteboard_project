const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Define the schema for user accounts
const accountSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },  // email of every user is required and should be unique
    password: { type: String, required: true }              // Required password
});

// Pre-save hook to hash password if modified or new
accountSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const saltRounds = 10; //10 hashing iterations to keep a balance between security and speed
        const salt = await bcrypt.genSalt(saltRounds);  // Generate salt
        this.password = await bcrypt.hash(this.password, salt); // Hash password
        next();
    } catch (err) {
        next(err);
    }
});

// Instance method to compare password for login
accountSchema.methods.validatePassword = async function (plainPassword) {
    return bcrypt.compare(plainPassword, this.password); // Compare hashed vs plain
};

module.exports = mongoose.model("User", accountSchema);
