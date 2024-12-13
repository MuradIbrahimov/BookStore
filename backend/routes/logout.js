import express from "express";
import { selectSql, insertSql } from "../database/db.js"; // Ensure correct import path

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    // Extract the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({ message: "Token is required for logout." });
    }

    // Delete the session from the database
    const deleteResult = await insertSql.deleteSessionByToken(token); // Ensure this function exists
    if (!deleteResult.affectedRows) {
      return res
        .status(400)
        .json({ message: "Session not found or already deleted." });
    }

    console.log("Session deleted successfully in the database.");

    // Destroy the session from express-session
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res
            .status(500)
            .json({ message: "Error during session cleanup." });
        }

        console.log("Session destroyed successfully in express-session.");
        res.clearCookie("connect.sid"); // Clear session cookie if set
        res.status(200).json({ message: "Logged out successfully." });
      });
    } else {
      res.clearCookie("connect.sid"); // Clear session cookie
      res
        .status(200)
        .json({ message: "Logged out successfully. No active session." });
    }
  } catch (error) {
    console.error("Internal server error during logout:", error);
    res.status(500).json({ message: "Internal server error during logout." });
  }
});

export default router;
