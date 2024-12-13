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
    res.render("adminLogin");
  }

  // Routes for Books
});

// GET /admin/logout
router.get("/logout", (req, res) => {
  if (req.cookies.user) {
    res.clearCookie("user");
    res.redirect("/auth");
  } else {
    res.redirect("/auth");
  }
});
module.exports = router;
