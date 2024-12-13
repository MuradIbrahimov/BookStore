import cookieParser from "cookie-parser";
import express from "express";
import expressSession from "express-session";
import { selectSql } from "../database/sql";

const router = express.Router();

router.use(cookieParser());
router.use(
  expressSession({
    secret: "dilab",
    resave: true,
    saveUninitialized: true,
  })
);

router.get("/", async function (req, res) {
  if (req.cookies.user) {
    res.render("admin", { user: req.cookies.user });
  } else {
    res.render("/auth");
    }
    
  // Routes for Books
  router.get("/books", async (req, res) => {
    const books = await selectSql.getBooks();
    res.render("adminBooks", { books });
  });

  router.post("/books/add", async (req, res) => {
    const { title, author_id, published_year, genre } = req.body;
    await insertSql.addBook({ title, author_id, published_year, genre });
    res.redirect("/auth/books");
  });

  router.post("/books/edit/:id", async (req, res) => {
    const { id } = req.params;
    const { title, author_id, published_year, genre } = req.body;
    await updateSql.editBook({ id, title, author_id, published_year, genre });
    res.redirect("/auth/books");
  });

  router.post("/books/delete/:id", async (req, res) => {
    const { id } = req.params;
    await deleteSql.deleteBook(id);
    res.redirect("/auth/books");
  });
});
