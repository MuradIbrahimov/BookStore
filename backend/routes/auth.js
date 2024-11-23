import express from "express";
import bcrypt from "bcrypt";

const router = express.Router();

// Serve the login page
router.get("/login", (req, res) => {
  res.send("This is the login page. Use POST to log in.");
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("[POST /auth/login] Login attempt for email:", email);

  try {
    if (!req.db) {
      console.error("[POST /auth/login] Database connection not found");
      return res.status(500).json({ error: "Database connection error" });
    }

    // Check Admin Table
    const [adminResults] = await req.db.query(
      "SELECT * FROM admin WHERE email = ?",
      [email]
    );

    if (adminResults.length > 0) {
      const admin = adminResults[0];
      console.log("[POST /auth/login] Admin found:", admin);

      // Validate password
      const isPasswordValid = await bcrypt.compare(password, admin.password);

      if (!isPasswordValid) {
        console.warn("[POST /auth/login] Invalid password for admin:", email);
        return res.status(401).json({ message: "Invalid password" });
      }

      // Admin Login Successful
      console.log("[POST /auth/login] Admin login successful for:", email);
      res.cookie(
        "user",
        { id: admin.id, role: admin.role },
        { httpOnly: true }
      );
      return res.redirect("/admin/dashboard");
    }

    // Check Customer Table
    const [customerResults] = await req.db.query(
      "SELECT * FROM customer WHERE email = ?",
      [email]
    );

    if (customerResults.length > 0) {
      const customer = customerResults[0];
      console.log("[POST /auth/login] Customer found:", customer);

      // Validate password
      const isPasswordValid = await bcrypt.compare(password, customer.password);

      if (!isPasswordValid) {
        console.warn(
          "[POST /auth/login] Invalid password for customer:",
          email
        );
        return res.status(401).json({ message: "Invalid password" });
      }

      // Customer Login Successful
      console.log("[POST /auth/login] Customer login successful for:", email);
      res.cookie(
        "user",
        { id: customer.email, role: "customer" },
        { httpOnly: true }
      );
      return res.redirect("/customer/dashboard");
    }

    // If neither Admin nor Customer
    console.warn("[POST /auth/login] User not found:", email);
    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    console.error("[POST /auth/login] Unexpected error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Add a new admin
router.post("/add-admin", async (req, res) => {
  const { name, email, password, role } = req.body;

  console.log("[POST /auth/add-admin] Adding a new admin:", email);

  try {
    if (!req.db) {
      console.error("[POST /auth/add-admin] Database connection not found");
      return res.status(500).json({ error: "Database connection error" });
    }

    // Check if the email already exists
    const [existingAdmins] = await req.db.query(
      "SELECT * FROM admin WHERE email = ?",
      [email]
    );

    if (existingAdmins.length > 0) {
      console.warn("[POST /auth/add-admin] Admin already exists:", email);
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new admin into the database
    await req.db.query(
      "INSERT INTO admin (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role || "admin"]
    );

    console.log("[POST /auth/add-admin] Admin added successfully:", email);
    return res.status(201).json({ message: "Admin added successfully" });
  } catch (error) {
    console.error("[POST /auth/add-admin] Unexpected error:", error.message);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
