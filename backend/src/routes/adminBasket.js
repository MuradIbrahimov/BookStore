import express from "express";
import { selectSql, insertSql, updateSql, deleteSql } from "../database/sql";

const router = express.Router();

// Fetch all shopping baskets and their contents
router.get("/", async (req, res) => {
  try {
    const baskets = await selectSql.getShoppingBasketsWithContents();
    console.log(baskets); // Check structure here
      res.render("adminShoppingBaskets", { baskets });
  } catch (error) {
    console.error("Error fetching shopping baskets:", error);
    res.status(500).send("Error fetching shopping baskets.");
  }
});

// Add a new shopping basket
router.post("/add", async (req, res) => {
  const { order_date, customer_email } = req.body;

  try {
    await insertSql.addShoppingBasket({ order_date, customer_email });
    res.redirect("/admin/shoppingBaskets");
  } catch (error) {
    console.error("Error adding shopping basket:", error);
    res.status(500).send("Error adding shopping basket.");
  }
});

// Add a book to a shopping basket
router.post("/addContains", async (req, res) => {
  const { shopping_basket_id, book_isbn, quantity } = req.body;

  try {
    await insertSql.addBookToBasket({
      shopping_basket_id,
      book_isbn,
      quantity,
    });
    res.redirect("/admin/shoppingBaskets");
  } catch (error) {
    console.error("Error adding book to basket:", error);
    res.status(500).send("Error adding book to basket.");
  }
});

// Edit a shopping basket
router.post("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { order_date, customer_email } = req.body;

  try {
    await updateSql.updateShoppingBasket({ id, order_date, customer_email });
    res.redirect("/admin/shoppingBaskets");
  } catch (error) {
    console.error("Error editing shopping basket:", error);
    res.status(500).send("Error editing shopping basket.");
  }
});

// Update quantity of a book in a basket
router.post("/updateContains", async (req, res) => {
  const { shopping_basket_id, book_isbn, quantity } = req.body;

  try {
    await updateSql.updateBasketQuantity({
      shopping_basket_id,
      book_isbn,
      quantity,
    });
    res.redirect("/admin/shoppingBaskets");
  } catch (error) {
    console.error("Error updating basket quantity:", error);
    res.status(500).send("Error updating basket quantity.");
  }
});

// Delete a shopping basket
router.post("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await deleteSql.deleteBasket(id);
    res.redirect("/admin/shoppingBaskets");
  } catch (error) {
    console.error("Error deleting shopping basket:", error);
    res.status(500).send("Error deleting shopping basket.");
  }
});

export default router;
