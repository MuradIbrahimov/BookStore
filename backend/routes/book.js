import express from "express";
const router = express.Router();

// Get all books
router.get("/", (req, res) => {
  const query = "SELECT * FROM book";
  req.db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get a book by ISBN
router.get("/:isbn", (req, res) => {
  const query = "SELECT * FROM book WHERE isbn = ?";
  req.db.query(query, [req.params.isbn], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json(result[0]);
  });
});

// Add a new book
router.post("/", (req, res) => {
  const { isbn, title, year, price, category } = req.body;
  const query =
    "INSERT INTO book (isbn, title, year, price, category) VALUES (?, ?, ?, ?, ?)";
  req.db.query(query, [isbn, title, year, price, category], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res
      .status(201)
      .json({ message: "Book added successfully", bookId: result.insertId });
  });
});

// Update a book by ISBN
router.put("/:isbn", (req, res) => {
  const { title, year, price, category } = req.body;
  const query =
    "UPDATE book SET title = ?, year = ?, price = ?, category = ? WHERE isbn = ?";
  req.db.query(
    query,
    [title, year, price, category, req.params.isbn],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Book not found" });
      }
      res.json({ message: "Book updated successfully" });
    }
  );
});

// Delete a book by ISBN
router.delete("/:isbn", (req, res) => {
  const query = "DELETE FROM book WHERE isbn = ?";
  req.db.query(query, [req.params.isbn], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json({ message: "Book deleted successfully" });
  });
});

export default router;
