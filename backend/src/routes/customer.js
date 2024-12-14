import express from "express";
import { selectSql, insertSql } from "../database/sql";

const router = express.Router();

// Fetch all books
// Main customer page
router.get("/", async (req, res) => {
  if (!req.cookies.user || req.cookies.user.role !== "customer") {
    return res.redirect("/"); // Redirect to login if not logged in
  }

  try {
    // You can render a general customer page or the books page
     res.render("customer", { user: req.cookies.user });
  } catch (error) {
    console.error("Error loading customer page:", error);
    res.status(500).send("Error loading customer page.");
  }
});

// Fetch all books
router.get("/books", async (req, res) => {
  if (!req.cookies.user || req.cookies.user.role !== "customer") {
    return res.redirect("/"); // Redirect to login if not logged in
  }

  try {
    const books = await selectSql.getAllBooks();
    res.render("customerBooks", { books });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).send("Error fetching books.");
  }
});
// Search books
router.get("/books/search", async (req, res) => {
  const { query } = req.query;

  try {
    const results = await selectSql.searchBooks(query);
    res.render("customerBooks", { books: results });
  } catch (error) {
    console.error("Error searching books:", error);
    res.status(500).send("Error searching books.");
  }
});

// View shopping basket
router.get("/basket", async (req, res) => {
  if (!req.cookies.user || req.cookies.user.role !== "customer") {
    return res.redirect("/"); // Redirect to login if not logged in
  }

  const { email } = req.cookies.user;

  try {
    const basket = await selectSql.getCustomerBasket(email);
    res.render("customerBasket", { basket });
  } catch (error) {
    console.error("Error fetching basket:", error);
    res.status(500).send("Error fetching basket.");
  }
});

// Add book to basket
router.post("/basket/add", async (req, res) => {
  const { email } = req.cookies.user;
  const { book_isbn, quantity } = req.body;

  try {
    await insertSql.addBookToBasket({
      customer_email: email,
      book_isbn,
      quantity,
    });
    res.redirect("/customer/basket");
  } catch (error) {
    console.error("Error adding book to basket:", error);
    res.status(500).send("Error adding book to basket.");
  }
});

export default router;
