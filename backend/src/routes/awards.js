import express from "express";
import { selectSql, insertSql, deleteSql, updateSql } from "../database/sql";

const router = express.Router();

// Fetch all awards
router.get("/", async (req, res) => {
  try {
    const awards = await selectSql.getAwardsWithAssociations(); // Fetch awards with associated books/authors
    res.render("adminAwards", { awards });
  } catch (error) {
    console.error("Error fetching awards:", error);
    res.status(500).send("Error fetching awards.");
  }
});

// Add a new award
router.post("/add", async (req, res) => {
  const { name, year, author_name, book_isbn } = req.body;

  try {
    // Add the award
    await insertSql.addAward({ name, year });

    if (author_name) {
      // Check if the author exists
      const author = await selectSql.getAuthorByName(author_name);
      if (!author) {
        return res.status(400).send("Author does not exist.");
      }

      // Create award-author relationship
      await insertSql.addAwardAuthorRelationship({
        award_name: name,
        author_name,
      });
    }

    if (book_isbn) {
      // Check if the book exists
      const book = await selectSql.getBookByIsbn(book_isbn);
      if (!book) {
        return res.status(400).send("Book does not exist.");
      }

      // Create award-book relationship
      await insertSql.addAwardBookRelationship({ award_name: name, book_isbn });
    }

    res.redirect("/admin/awards");
  } catch (error) {
    console.error("Error adding award:", error);
    res.status(500).send("Error adding award.");
  }
});

// Edit an award
router.post("/edit/:name", async (req, res) => {
  const { name } = req.params;
  const { year, author_name, book_isbn } = req.body;

  try {
    // Update award details
    await updateSql.updateAward({ name, year });

    // Update author relationship
    if (author_name) {
      await deleteSql.deleteAwardAuthorRelationship(name);
      const author = await selectSql.getAuthorByName(author_name);
      if (author) {
        await insertSql.addAwardAuthorRelationship({
          award_name: name,
          author_name,
        });
      }
    }

    // Update book relationship
    if (book_isbn) {
      await deleteSql.deleteAwardBookRelationship(name);
      const book = await selectSql.getBookByIsbn(book_isbn);
      if (book) {
        await insertSql.addAwardBookRelationship({
          award_name: name,
          book_isbn,
        });
      }
    }

    res.redirect("/admin/awards");
  } catch (error) {
    console.error("Error editing award:", error);
    res.status(500).send("Error editing award.");
  }
});

// Delete an award
router.post("/delete/:name", async (req, res) => {
  const { name } = req.params;

  try {
    // Delete relationships
    await deleteSql.deleteAwardAuthorRelationship(name);
    await deleteSql.deleteAwardBookRelationship(name);

    // Delete award
    await deleteSql.deleteAward(name);

    res.redirect("/admin/awards");
  } catch (error) {
    console.error("Error deleting award:", error);
    res.status(500).send("Error deleting award.");
  }
});

export default router;
