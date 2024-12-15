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

router.get("/", (req, res) => {
  if (req.cookies.user) {
    const user = JSON.parse(req.cookies.user); // Parse the cookie value
    res.render("admin", { user });
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
    let useremail
    for (const user of users) {
      const isPasswordValid = vars.password === user.password;

      if (vars.email === user.email && isPasswordValid) {
        checkLogin = true;
        whoAmI = user.id;
        useremail = user.email
        break;
      }
    }

   if (checkLogin) {
     // Serialize user information into the cookie
     const userInfo = JSON.stringify({ id: whoAmI, email: useremail });

     res.cookie("user", userInfo, {
       expires: new Date(Date.now() + 3600000), // 1-hour expiry
       httpOnly: true,
     });
     res.redirect("/admin"); // Redirect to admin dashboard
   } else {
     console.log("Login failed for:", vars.email);
     res.redirect("/auth"); // Redirect back to login page
   }

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
});



module.exports = router;
