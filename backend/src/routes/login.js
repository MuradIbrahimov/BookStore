import cookieParser from "cookie-parser";
import express from "express";
import expressSession from "express-session";
import { selectSql } from "../database/sql";
import bcrypt from "bcrypt";

const router = express.Router();

router.use(cookieParser());
router.use(
  expressSession({
    secret: "dilab",
    resave: true,
    saveUninitialized: true,
  })
);

router.get("/", (req, res) => {
  if (req.cookies.user) {
    res.render("main", {
      user: req.cookies.user,
    });
  } else {
    res.render("login");
  }
});

router.get("/logout", (req, res) => {
  if (req.cookies.user) {
    res.clearCookie("user");
    res.redirect("/");
  } else {
    res.redirect("/");
  }
});
router.post("/", async (req, res) => {
  const vars = req.body;
  console.log("Login attempt:", vars);

  try {
    const users = await selectSql.getUsers();
    console.log("Fetched users:", users);

    let checkLogin = false;
    let whoAmI;
    console.log(vars.password);
    for (const user of users) {
      console.log("Checking user:", user);

      const isPasswordValid = vars.password === user.password; // Debug before bcrypt

      if (vars.email === user.email && isPasswordValid) {
        checkLogin = true;
        whoAmI = user.id;
        break;
      }
    }

    if (checkLogin) {
      res.cookie("user", whoAmI, {
        expires: new Date(Date.now() + 3600000),
        httpOnly: true,
      });
      res.redirect("/");
    } else {
      console.log("Login failed for:", vars.email);
      res.redirect("/");
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
