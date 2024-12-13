import express from "express";
import cookieParser from "cookie-parser";
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

// GET /auth
router.get("/", (req, res) => {
  if (req.cookies.user) {
    res.render("admin", { user: req.cookies.user });
  } else {
    res.render("adminLogin");
  }
});

// POST /auth
router.post("/", async (req, res) => {
  const vars = req.body;
  console.log("Login attempt:", vars);

  try {
    const users = await selectSql.getAdmins();
    console.log("Fetched users:", users);

    let checkLogin = false;
    let whoAmI;

    for (const user of users) {
      const isPasswordValid = vars.password === user.password;

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
      res.redirect("/auth"); // Redirect to admin dashboard
    } else {
      console.log("Login failed for:", vars.email);
      res.redirect("/auth"); // Redirect back to login page
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
});

// GET /auth/logout
router.get("/logout", (req, res) => {
  if (req.cookies.user) {
    res.clearCookie("user");
    res.redirect("/auth");
  } else {
    res.redirect("/auth");
  }
});

module.exports = router;
