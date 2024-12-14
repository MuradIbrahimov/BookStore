import express from "express";
import { selectSql, insertSql, deleteSql, updateSql } from "../database/sql";

const router = express.Router();

// Fetch all warehouses and their inventory
router.get("/", async (req, res) => {
  try {
    const warehouses = await selectSql.getWarehousesWithInventory();
    res.render("adminWarehouses", { warehouses });
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    res.status(500).send("Error fetching warehouses.");
  }
});

// Add a new warehouse
router.post("/add", async (req, res) => {
  const { code, address, phone } = req.body;

  try {
    await insertSql.addWarehouse({ code, address, phone });
    res.redirect("/admin/warehouses");
  } catch (error) {
    console.error("Error adding warehouse:", error);
    res.status(500).send("Error adding warehouse.");
  }
});

// Add inventory to a warehouse
router.post("/addInventory", async (req, res) => {
  const { warehouse_code, book_isbn, number } = req.body;

  try {
    const book = await selectSql.getBookByIsbn(book_isbn);
    if (!book) {
      return res.status(400).send("Book with this ISBN does not exist.");
    }

    await insertSql.addInventory({ warehouse_code, book_isbn, number });
    res.redirect("/admin/warehouses");
  } catch (error) {
    console.error("Error adding inventory:", error);
    res.status(500).send("Error adding inventory.");
  }
});

// Update inventory quantity
router.post("/updateInventory", async (req, res) => {
  const { warehouse_code, book_isbn, number } = req.body;

  try {
    await updateSql.updateInventoryQuantity({
      warehouse_code,
      book_isbn,
      number,
    });
    res.redirect("/admin/warehouses");
  } catch (error) {
    console.error("Error updating inventory:", error);
    res.status(500).send("Error updating inventory.");
  }
});

// Delete a warehouse
router.post("/delete/:code", async (req, res) => {
  const { code } = req.params;

  try {
    await deleteSql.deleteInventoryByWarehouse(code);
    await deleteSql.deleteWarehouse(code);
    res.redirect("/admin/warehouses");
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    res.status(500).send("Error deleting warehouse.");
  }
});

export default router;
