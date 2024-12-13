import express from "express";
import cookieParser from "cookie-parser";

import { selectSql, insertSql } from "../database/db.js";
import expressSession from "express-session";
import instances from "../utils/axios"; // Import Axios instance

const router = express.Router();

router.use(cookieParser());
router.use(
  expressSession({
    secret: "murad",
    resave: true,
    saveUninitialized: true,
  })
);

router.get("/logout", (req, res) => {
  if (req.cookies.user) {
    res.clearCookie("user");
    res.redirect("/");
  } else {
    res.redirect("/");
  }
});

router.post("/login/admin", async (req, res) => {
  const vars = req.body;
  const users = await selectSql.getAdmins();
  var whoAmI = 1;
  let checkLogin = false;

  users.map((user) => {
    if (vars.id == user.id && vars.password === user.password) {
      checkLogin = true;
      whoAmI = user.id;
    }
  });

  if (checkLogin) {
    res.cookie("user", whoAmI, {
      expires: new Date(Date.now() + 3600000), //
      httpOnly: true,
    });
    res.redirect("/");
  } else {
    res.redirect("/");
  }
});

export default router;
