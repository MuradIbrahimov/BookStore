const express = require("express");
const router = express.Router();
import {
  authenticate,
  authorizeCustomer,
  authorizeAdmin,
} from "../middleware/authMiddleware.js";

router.get("/dashboard", authenticate, authorizeAdmin, (req, res) => {
  res.render("admin/dashboard", { user: req.user });
});

// 1. Add/Edit/Delete Book
router.post("/books", (req, res) => {
  const { isbn, title, year, price, category } = req.body;
  const query =
    "INSERT INTO book (isbn, title, year, price, category) VALUES (?, ?, ?, ?, ?)";
  req.db.query(query, [isbn, title, year, price, category], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Book added successfully" });
  });
});

router.put("/books/:isbn", (req, res) => {
  const { title, year, price, category } = req.body;
  const query =
    "UPDATE book SET title = ?, year = ?, price = ?, category = ? WHERE isbn = ?";
  req.db.query(
    query,
    [title, year, price, category, req.params.isbn],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Book updated successfully" });
    }
  );
});

router.delete("/books/:isbn", (req, res) => {
  const query = "DELETE FROM book WHERE isbn = ?";
  req.db.query(query, [req.params.isbn], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Book deleted successfully" });
  });
});

// 2. Add/Edit/Delete Author, Award, Warehouse, Inventory, and Contains
// Repeat similar logic for other entities (author, award, warehouse, etc.)

export default router;
