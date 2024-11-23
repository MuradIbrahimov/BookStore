import express from "express";
const router = express.Router();

// Get all warehouses
router.get("/", (req, res) => {
  const query = "SELECT * FROM warehouse";
  req.db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add a warehouse
router.post("/", (req, res) => {
  const { code, phone, address } = req.body;
  const query = "INSERT INTO warehouse (code, phone, address) VALUES (?, ?, ?)";
  req.db.query(query, [code, phone, address], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Warehouse added successfully" });
  });
});

export default router;
