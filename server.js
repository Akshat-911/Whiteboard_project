const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Load environment variables like mongoDB uri and secret key for jwt from .env
const connectToDB = require('./config/db');
const { Server } = require("socket.io");
const http = require("http");
const Canvas = require("./models/canvasModel");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "akshat_super_secret_123"; // Fallback if env missing

const userRoutes = require("./routes/userRoutes");
const canvasRoutes = require("./routes/canvasRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/canvas", canvasRoutes);

// Connect to MongoDB
connectToDB();

// Create HTTP server and bind socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "https://whiteboard-tutorial-eight.vercel.app"],
        methods: ["GET", "POST"]
    }
});

let canvasData = {}; // In-memory cache to hold canvas states

io.on("connection", (socket) => {
    console.log("✅ A user connected:", socket.id);

    // Handle joining a canvas
    socket.on("joinCanvas", async ({ canvasId }) => {
        console.log("🖌️ Joining canvas:", canvasId);
        try {
            const authHeader = socket.handshake.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                console.log("❌ No token provided.");
                setTimeout(() => {
                    socket.emit("unauthorized", { message: "Access Denied: No Token" });
                }, 100);
                return;
            }

            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            const userId = decoded.userId;

            const canvas = await Canvas.findById(canvasId);

            if (!canvas || (String(canvas.owner) !== String(userId) && !canvas.shared.includes(userId))) {
                console.log("❌ Unauthorized access.");
                setTimeout(() => {
                    socket.emit("unauthorized", { message: "You are not authorized to join this canvas." });
                }, 100);
                return;
            }

            socket.join(canvasId);
            console.log(`✅ User ${socket.id} joined canvas ${canvasId}`);

            // Send current canvas data (from memory or DB)
            if (canvasData[canvasId]) {
                socket.emit("loadCanvas", canvasData[canvasId]);
            } else {
                socket.emit("loadCanvas", canvas.elements);
            }

        } catch (error) {
            console.error("❌ Error in joinCanvas:", error.message);
            socket.emit("error", { message: "An error occurred while joining the canvas." });
        }
    });

    // Handle real-time drawing updates
    socket.on("drawingUpdate", async ({ canvasId, elements }) => {
        try {
            canvasData[canvasId] = elements;

            // Broadcast to others in room
            socket.to(canvasId).emit("receiveDrawingUpdate", elements);

            // Persist to DB
            const canvas = await Canvas.findById(canvasId);
            if (canvas) {
                await Canvas.findByIdAndUpdate(canvasId, { elements }, { new: true });
            }

        } catch (error) {
            console.error("❌ Error in drawingUpdate:", error.message);
        }
    });

    socket.on("disconnect", () => {
        console.log("⚠️ User disconnected:", socket.id);
    });
});

server.listen(5000, () => console.log("🚀 Server running on port 5000"));
