import express from "express";
import { selectSql, insertSql, deleteSql, updateSql } from "../database/sql";

const router = express.Router();


// Get all relationships between authors and books
router.get("/", async (req, res) => {
  try {
    const books = await selectSql.getBooksWithAuthors(); // Fetch books with authors
    console.log("Books fetched:", books); // Check if price is included
    res.render("adminBooks", { books });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).send("Error fetching books.");
  }
});

router.post("/add", async (req, res) => {
  const { isbn, title, year, category, price, author_name } = req.body;

  try {
    // Check if the book already exists
    const existingBook = await selectSql.getBookByIsbn(isbn);
    if (existingBook) {
      return res.status(400).send("Book with this ISBN already exists.");
    }

    // Add the book to the database
    await insertSql.addBook({ isbn, title, year, category, price });

    // Check if the author exists
    let author = await selectSql.getAuthorByName(author_name);

    if (!author) {
      // Author does not exist, so create a new one
      await insertSql.addAuthor({ name: author_name });
    }

    // Create a relationship in the Author_Book table
    await insertSql.addAuthorBookRelationship({
      author_name,
      book_isbn: isbn,
    });

    res.status(201).send("Book and author relationship added successfully.");
  } catch (error) {
    console.error("Error adding book with author:", error);
    res.status(500).send("Error adding book with author.");
  }
});

router.post("/delete/:isbn", async (req, res) => {
  const { isbn } = req.params;

  try {
    // Delete relationships from the Author_Book table
    await deleteSql.deleteAuthorBookRelationships(isbn);

    // Delete the book from the Book table
    await deleteSql.deleteBook(isbn);

    res.redirect("/admin/books"); // Redirect back to the books page
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).send("Error deleting book.");
  }
});
router.post("/edit/:isbn", async (req, res) => {
  const { isbn } = req.params;
  const { title, authors, year, category, price } = req.body;

  try {
    // Update book details
    await updateSql.updateBook({ isbn, title, year, category, price });

    // Handle authors (comma-separated)
    if (authors) {
      const authorList = authors.split(",").map((name) => name.trim());

      // Remove existing relationships
      await deleteSql.deleteAuthorBookRelationships(isbn);

      for (const authorName of authorList) {
        let author = await selectSql.getAuthorByName(authorName);

        if (!author) {
          // Add new author
          await insertSql.addAuthor({ name: authorName });
        }

        // Add relationship to Author_Book
        await insertSql.addAuthorBookRelationship({
          author_name: authorName,
          book_isbn: isbn,
        });
      }
    }

    res.status(200).send("Book updated successfully.");
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).send("Error updating book.");
  }
});
export default router;
