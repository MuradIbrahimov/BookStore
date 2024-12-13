import express from "express";
import cookieParser from "cookie-parser";
import expressSession from "express-session";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { selectSql, insertSql } from "../database/db.js";

const router = express.Router();

router.use(cookieParser());
router.use(
  expressSession({
    secret: "murad",
    resave: true,
    saveUninitialized: true,
  })
);

// JWT Secret Key
const JWT_SECRET = "murad";

// Admin Login Route
router.post("/admin", async (req, res) => {
  const { email, password, id } = req.body;
  try {
    const admin = await selectSql.getAdminByEmail(email);

    if (!admin) {
      console.error("Admin not found for email:", email);
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      console.error("Password mismatch for admin email:", email);
      return res.status(401).json({ message: "Invalid credentials." });
    }
    console.log(admin);
    const token = jwt.sign({ id: admin.id, role: "admin" }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // Save session in database
    await insertSql.saveSessionAdmin({
      userId: admin.id,
      token,
    });

    res.status(200).json({ token, role: "admin" });
  } catch (error) {
    console.error("Error during admin login:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Customer Login Route
router.post("/", async (req, res) => {
  const { email, password } = req.body;
  try {
    const customer = await selectSql.getCustomerByEmail(email);

    if (!customer) {
      console.error("Customer not found for email:", email);
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      console.error("Password mismatch for customer email:", email);
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ id: customer.id, role: "customer" }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // Save session in database
    await insertSql.saveSession({
      userId: customer.id,
      role: "customer",
      token,
    });

    res.status(200).json({ token, role: "customer" });
  } catch (error) {
    console.error("Error during customer login:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

export default router;
