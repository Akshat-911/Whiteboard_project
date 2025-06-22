const express = require("express");
const {
    createCanvas,
    updateCanvas,
    loadCanvas,
    shareCanvas,
    unshareCanvas,
    deleteCanvas,
    getUserCanvases
} = require("../controllers/canvasController");

const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// Route to create a new drawing board
router.post("/new", authMiddleware, createCanvas);

// Save/update drawing data
router.put("/save", authMiddleware, updateCanvas);

// Load an existing board by its ID
router.get("/view/:id", authMiddleware, loadCanvas);

// Share the board with another user
router.put("/grant-access/:id", authMiddleware, shareCanvas);

// Revoke shared access from a user
router.put("/revoke-access/:id", authMiddleware, unshareCanvas);

// Delete a drawing board
router.delete("/remove/:id", authMiddleware, deleteCanvas);

// List all canvases accessible to the logged-in user
router.get("/my-drawings", authMiddleware, getUserCanvases);

module.exports = router;
