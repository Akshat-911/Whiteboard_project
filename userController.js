const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "akshat_super_secret_123"; // Fallback secret (if not found in env)

// Register a new user
exports.registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input fields
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }

        // Check if user already exists
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: "User already exists." });
        }

        // Create and save new user
        const userEntry = new User({ email, password });
        await userEntry.save();

        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Registration failed", details: err.message });
    }
};

// Login and generate token
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const foundUser = await User.findOne({ email });
        if (!foundUser) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Compare passwords
        const valid = await foundUser.comparePassword(password);
        if (!valid) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Sign a new JWT token
        const token = jwt.sign({ userId: foundUser._id }, SECRET_KEY, { expiresIn: "7d" });

        res.json({ message: "Login successful", token });
    } catch (err) {
        res.status(500).json({ error: "Login failed", details: err.message });
    }
};

// Get logged-in user's details
exports.getUser = async (req, res) => {
    try {
        // req.userId comes from auth middleware after verifying JWT
        const userInfo = await User.findById(req.userId).select("-password");

        if (!userInfo) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(userInfo);
    } catch (err) {
        res.status(500).json({ error: "Failed to get user details", details: err.message });
    }
};
