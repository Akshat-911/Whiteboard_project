const jwt = require("jsonwebtoken");

// Use secret key from environment variables for better security
const SECRET_KEY = process.env.JWT_SECRET || "akshat_super_secret123"; // fallback in case the secret key is not found in the env

exports.authMiddleware = (req, res, next) => {
    // Expect token in the format: Bearer <token>
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Access Denied: No or Invalid Token Format" });
    }

    try {
        const token = authHeader.split(" ")[1]; // remove the bearer to obtain the token and verify it
        const decoded = jwt.verify(token, SECRET_KEY);

        req.userId = decoded.userId; // Attach decoded user ID to request
        next(); // Proceed to the next middleware/controller
    } catch (error) {
        res.status(401).json({ error: "Invalid or Expired Token" });
    }
};
