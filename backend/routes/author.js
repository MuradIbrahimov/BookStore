import express from "express";
const router = express.Router();

// Get all authors
router.get("/", (req, res) => {
  const query = "SELECT * FROM author";
  req.db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Add a new author
router.post("/", (req, res) => {
  const { name, address, url } = req.body;
  const query = "INSERT INTO author (name, adress, url) VALUES (?, ?, ?)";
  req.db.query(query, [name, address, url], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      message: "Author added successfully",
      authorId: result.insertId,
    });
  });
});

export default router;
