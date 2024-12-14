import express from "express";
import cookieParser from "cookie-parser";
import expressSession from "express-session";
import { selectSql } from "../database/sql"; // Assuming this is your database module

const router = express.Router();

// Middleware for cookies and session handling
router.use(cookieParser());
router.use(
  expressSession({
    secret: "your_secret_key", // Replace with a secure key
    resave: true,
    saveUninitialized: true,
  })
);

// Login Page
router.get("/", (req, res) => {
  if (req.cookies.user && req.cookies.user.role === "customer") {
    // If user exists in cookies and has 'customer' role, render customer page
    res.render("customer", { user: req.cookies.user });
  } else {
    res.render("login"); // Render login page for unauthenticated users
  }
});

// Login Attempt
router.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Fetch customer from the database
    const customer = await selectSql.getCustomerByEmail(email);

    if (customer && customer.password === password) {
      // If customer exists and password matches, set user in cookies
      res.cookie(
        "user",
        { email: customer.email, role: "customer" }, // Assign 'customer' role
        {
          httpOnly: true,
          maxAge: 3600000, // 1 hour
        }
      );

      res.redirect("/customer"); // Redirect to customer page
    } else {
      res.render("login", { error: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Logout Route
router.get("/logout", (req, res) => {
  res.clearCookie("user");
  res.redirect("/");
});

export default router;
