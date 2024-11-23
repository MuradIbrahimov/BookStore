import express from "express";
const router = express.Router();

// Get all reservations
router.get("/", (req, res) => {
  const query = "SELECT * FROM reservation";
  req.db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add a reservation
router.post("/", (req, res) => {
  const { id, reservation_date, pickup_time, customer_email, book_isbn } =
    req.body;
  const query =
    "INSERT INTO reservation (id, reservation_date, pickup_time, customer_email, book_isbn) VALUES (?, ?, ?, ?, ?)";
  req.db.query(
    query,
    [id, reservation_date, pickup_time, customer_email, book_isbn],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Reservation added successfully" });
    }
  );
});

export default router;
