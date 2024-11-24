import express from "express";
const router = express.Router();

import { authenticate, authorizeCustomer } from "./middleware/authMiddleware";

router.get("/dashboard", authenticate, authorizeCustomer, (req, res) => {
  res.render("customer/dashboard", { user: req.user });
});


// 1. Search for Books, Authors, or Awards by Name
router.get("/search", (req, res) => {
  const { query, type } = req.query; // `type` can be 'book', 'author', or 'award'
  let searchQuery = "";
  if (type === "book") searchQuery = "SELECT * FROM book WHERE title LIKE ?";
  else if (type === "author")
    searchQuery = "SELECT * FROM author WHERE name LIKE ?";
  else if (type === "award")
    searchQuery = "SELECT * FROM award WHERE name LIKE ?";
  else return res.status(400).json({ message: "Invalid type" });

  req.db.query(searchQuery, [`%${query}%`], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 2. View/Edit/Cancel Reservations
router.get("/reservations", (req, res) => {
  const query = "SELECT * FROM reservation WHERE customer_email = ?";
  req.db.query(query, [req.user.email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post("/reservations", (req, res) => {
  const { book_isbn, reservation_date, pickup_time } = req.body;

  // Check stock availability
  const stockQuery =
    "SELECT SUM(number) as total_quantity FROM inventory WHERE book_isbn = ?";
  req.db.query(stockQuery, [book_isbn], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results[0].total_quantity === 0) {
      return res
        .status(400)
        .json({ message: "Insufficient stock for reservation" });
    }

    // Check pickup time conflict
    const conflictQuery = `SELECT * FROM reservation 
            WHERE book_isbn = ? AND ABS(TIMESTAMPDIFF(MINUTE, pickup_time, ?)) < 10`;
    req.db.query(conflictQuery, [book_isbn, pickup_time], (err, conflicts) => {
      if (err) return res.status(500).json({ error: err.message });

      if (conflicts.length > 0) {
        return res
          .status(400)
          .json({ message: "Conflicting reservation time" });
      }

      // Make reservation
      const query = `INSERT INTO reservation (book_isbn, customer_email, reservation_date, pickup_time) 
                VALUES (?, ?, ?, ?)`;
      req.db.query(
        query,
        [book_isbn, req.user.email, reservation_date, pickup_time],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ message: "Reservation made successfully" });
        }
      );
    });
  });
});

// 3. Add to Shopping Basket and Purchase Books
router.post("/shopping-basket", (req, res) => {
  const { basket_id, books } = req.body; // `books` is an array of { isbn, quantity }

  // Check stock for each book
  let insufficientStock = [];
  books.forEach((book) => {
    const stockQuery =
      "SELECT SUM(number) as total_quantity FROM inventory WHERE book_isbn = ?";
    req.db.query(stockQuery, [book.isbn], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results[0].total_quantity < book.quantity) {
        insufficientStock.push(book.isbn);
      }
    });
  });

  if (insufficientStock.length > 0) {
    return res
      .status(400)
      .json({
        message: "Insufficient stock for books",
        books: insufficientStock,
      });
  }

  // Add books to shopping basket
  books.forEach((book) => {
    const query =
      "INSERT INTO contains (shopping_basket_basket_id, book_isbn, number) VALUES (?, ?, ?)";
    req.db.query(query, [basket_id, book.isbn, book.quantity], (err) => {
      if (err) return res.status(500).json({ error: err.message });
    });
  });

  // Mark purchase
  const purchaseQuery =
    "UPDATE shopping_basket SET order_date = NOW() WHERE basket_id = ?";
  req.db.query(purchaseQuery, [basket_id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Books purchased successfully" });
  });
});

export default router
