import express from "express";
const router = express.Router();

// Get all shopping baskets
router.get("/", (req, res) => {
  const query = "SELECT * FROM shopping_basket";
  req.db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add a shopping basket
router.post("/", (req, res) => {
  const { basket_id, order_date, customer_email } = req.body;
  const query =
    "INSERT INTO shopping_basket (basket_id, order_date, customer_email) VALUES (?, ?, ?)";
  req.db.query(query, [basket_id, order_date, customer_email], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Shopping basket added successfully" });
  });
});

export default router;
