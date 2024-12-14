import express from "express";
import { selectSql, insertSql, deleteSql, updateSql } from "../database/sql";

const router = express.Router();

// Fetch authors and their associated books
router.get("/", async (req, res) => {
  try {
    const authors = await selectSql.getAuthorsWithBooks(); // Fetch authors with books
    res.render("adminAuthors", { authors });
  } catch (error) {
    console.error("Error fetching authors:", error);
    res.status(500).send("Error fetching authors.");
  }
});

// Add a new author and associated books
router.post("/add", async (req, res) => {
  const { name, address, url, book_isbn } = req.body;

  try {
    // Check if the author already exists
    let author = await selectSql.getAuthorByName(name);

    if (!author) {
      // Add new author
      await insertSql.addAuthor({ name, address, url });
    }

    if (book_isbn) {
      // Check if the book exists
      const book = await selectSql.getBookByIsbn(book_isbn);

      if (!book) {
        return res.status(400).send("Book with this ISBN does not exist.");
      }

      // Add relationship in Author_Book table
      await insertSql.addAuthorBookRelationship({
        author_name: name,
        book_isbn,
      });
    }

    res.redirect("/admin/authors");
  } catch (error) {
    console.error("Error adding author:", error);
    res.status(500).send("Error adding author.");
  }
});

// Edit an author
router.post("/edit/:name", async (req, res) => {
  const { name } = req.params;
  const { address, url, book_isbn } = req.body;

  try {
    // Update author details
    await updateSql.updateAuthor({ name, address, url });

    if (book_isbn) {
      // Remove existing relationships
      await deleteSql.deleteAuthorBookRelationshipsByAuthor(name);

      // Add new relationships
      const book = await selectSql.getBookByIsbn(book_isbn);
      if (!book) {
        return res.status(400).send("Book with this ISBN does not exist.");
      }

      await insertSql.addAuthorBookRelationship({
        author_name: name,
        book_isbn,
      });
    }

    res.redirect("/admin/authors");
  } catch (error) {
    console.error("Error editing author:", error);
    res.status(500).send("Error editing author.");
  }
});

// Delete an author and associated relationships
router.post("/delete/:name", async (req, res) => {
  const { name } = req.params;

  try {
    // Delete relationships in Author_Book table
    await deleteSql.deleteAuthorBookRelationshipsByAuthor(name);

    // Delete author
    await deleteSql.deleteAuthor(name);

    res.redirect("/admin/authors");
  } catch (error) {
    console.error("Error deleting author:", error);
    res.status(500).send("Error deleting author.");
  }
});

export default router;
