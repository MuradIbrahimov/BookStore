import express from "express";
import bcrypt from "bcrypt";

const router = express.Router();

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

      const isPasswordValid = await bcrypt.compare(password, admin.password);
      console.log("[POST /auth/login] Comparing passwords:", {
        inputPassword: password,
        storedHash: admin.password,
        result: isPasswordValid,
      });

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

      return res.status(200).json({
        message: "Login successful",
        role: admin.role,
      });
    }

    // Check Customer Table
    const [customerResults] = await req.db.query(
      "SELECT * FROM customer WHERE email = ?",
      [email]
    );

    if (customerResults.length > 0) {
      const customer = customerResults[0];
      console.log("[POST /auth/login] Customer found:", customer);

      const isPasswordValid = await bcrypt.compare(password, customer.password);
      console.log("[POST /auth/login] Comparing passwords:", {
        inputPassword: password,
        storedHash: customer.password,
        result: isPasswordValid,
      });

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

      return res.status(200).json({
        message: "Login successful",
        role: "customer",
      });
    }

    // If neither Admin nor Customer
    console.warn("[POST /auth/login] User not found:", email);
    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    console.error("[POST /auth/login] Unexpected error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
