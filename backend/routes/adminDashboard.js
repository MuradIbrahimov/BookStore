// Import necessary modules
import express from "express";
import { promisePool } from "../database/db.js";

const router = express.Router();

// Middleware to verify the token
const verifyToken = async (req, res, next) => {
  try {
    // Extract token from the request headers
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Token missing" });
    }

    // Query to find the session with the token
    const query = `SELECT * FROM sessions WHERE token = ?`;
    const [rows] = await promisePool.query(query, [token]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const session = rows[0];

    // Check if the token has expired
    const currentTime = new Date();
    if (new Date(session.expires_at) <= currentTime) {
      return res.status(401).json({ message: "Unauthorized: Token expired" });
    }

    // Token is valid, attach session data to the request for further use
    req.session = session;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Admin dashboard route
router.get("/dashboard", verifyToken, (req, res) => {
  // If this point is reached, the token is valid
  res.json({
    message: "Welcome to the Admin Dashboard!",
    session: req.session,
  });
});

export default router;
