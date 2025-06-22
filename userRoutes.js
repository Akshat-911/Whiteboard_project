const express = require("express");
const { registerUser, loginUser, getUser } = require("../controllers/userController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// Register a new account
router.post("/signup", registerUser);

// Login with email and password
router.post("/signin", loginUser);

// Get current user info
router.get("/profile", authMiddleware, getUser);

module.exports = router;
