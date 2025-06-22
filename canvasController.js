const CanvasModel = require("../models/canvasModel");
const UserModel = require("../models/userModel");
const mongoose = require("mongoose");

// ✅ Create a new canvas
exports.createCanvas = async (req, res) => {
    try {
        const ownerId = req.userId;

        const canvasDoc = new CanvasModel({
            owner: ownerId,
            shared: [],
            elements: [],
        });

        await canvasDoc.save();
        res.status(201).json({ message: "Canvas created", canvasId: canvasDoc._id });
    } catch (err) {
        res.status(500).json({ error: "Error creating canvas", details: err.message });
    }
};

// ✅ Update canvas content
exports.updateCanvas = async (req, res) => {
    try {
        const { canvasId, elements } = req.body;
        const currentUser = req.userId;

        const canvas = await CanvasModel.findById(canvasId);
        if (!canvas) return res.status(404).json({ error: "Canvas not found" });

        const isAuthorized = canvas.owner.toString() === currentUser || canvas.shared.includes(currentUser);
        if (!isAuthorized) return res.status(403).json({ error: "Unauthorized to update" });

        canvas.elements = elements;
        await canvas.save();

        res.json({ message: "Canvas updated" });
    } catch (err) {
        res.status(500).json({ error: "Update failed", details: err.message });
    }
};

// ✅ Load canvas by ID
exports.loadCanvas = async (req, res) => {
    try {
        const canvasId = req.params.id;
        const currentUser = req.userId;

        const canvas = await CanvasModel.findById(canvasId);
        if (!canvas) return res.status(404).json({ error: "Canvas not found" });

        const canAccess = canvas.owner.toString() === currentUser || canvas.shared.includes(currentUser);
        if (!canAccess) return res.status(403).json({ error: "Access denied" });

        res.json(canvas);
    } catch (err) {
        res.status(500).json({ error: "Failed to load canvas", details: err.message });
    }
};

// ✅ Share canvas with a user via email
exports.shareCanvas = async (req, res) => {
    try {
        const { email } = req.body;
        const canvasId = req.params.id;
        const ownerId = req.userId;

        const userToShare = await UserModel.findOne({ email });
        if (!userToShare) return res.status(404).json({ error: "User not found" });

        const canvas = await CanvasModel.findById(canvasId);
        if (!canvas) return res.status(404).json({ error: "Canvas not found" });

        if (canvas.owner.toString() !== ownerId)
            return res.status(403).json({ error: "Only the owner can share" });

        const targetId = new mongoose.Types.ObjectId(userToShare._id);

        if (canvas.shared.includes(targetId))
            return res.status(400).json({ error: "Already shared" });

        if (targetId.toString() === canvas.owner.toString())
            return res.status(400).json({ error: "Owner can't be added to shared list" });

        canvas.shared.push(targetId);
        await canvas.save();

        res.json({ message: "Canvas shared" });
    } catch (err) {
        res.status(500).json({ error: "Failed to share", details: err.message });
    }
};

// ✅ Unshare canvas
exports.unshareCanvas = async (req, res) => {
    try {
        const { userIdToRemove } = req.body;
        const canvasId = req.params.id;
        const currentUser = req.userId;

        const canvas = await CanvasModel.findById(canvasId);
        if (!canvas) return res.status(404).json({ error: "Canvas not found" });

        if (canvas.owner.toString() !== currentUser)
            return res.status(403).json({ error: "Only the owner can unshare" });

        canvas.shared = canvas.shared.filter(uid => uid.toString() !== userIdToRemove);
        await canvas.save();

        res.json({ message: "Canvas unshared" });
    } catch (err) {
        res.status(500).json({ error: "Failed to unshare", details: err.message });
    }
};

// ✅ Delete canvas
exports.deleteCanvas = async (req, res) => {
    try {
        const canvasId = req.params.id;
        const userId = req.userId;

        const canvas = await CanvasModel.findById(canvasId);
        if (!canvas) return res.status(404).json({ error: "Canvas not found" });

        if (canvas.owner.toString() !== userId)
            return res.status(403).json({ error: "Only the owner can delete this canvas" });

        await CanvasModel.findByIdAndDelete(canvasId);
        res.json({ message: "Canvas deleted" });
    } catch (err) {
        res.status(500).json({ error: "Deletion failed", details: err.message });
    }
};

// ✅ Get all canvases accessible to the user
exports.getUserCanvases = async (req, res) => {
    try {
        const currentUserId = req.userId;

        const canvases = await CanvasModel.find({
            $or: [{ owner: currentUserId }, { shared: currentUserId }]
        }).sort({ createdAt: -1 });

        res.json(canvases);
    } catch (err) {
        res.status(500).json({ error: "Fetching canvases failed", details: err.message });
    }
};
