export const authenticate = (req, res, next) => {
  if (!req.session.user) {
    console.warn("[AUTH] No active session. Redirecting to login.");
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
  req.user = req.session.user; // Attach session user to the request
  next();
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    console.warn("[AUTH] User is not an admin:", req.user);
    return res.status(403).json({ message: "Forbidden. Admins only." });
  }
  next();
};

export const authorizeCustomer = (req, res, next) => {
  if (req.user.role !== "customer") {
    console.warn("[AUTH] User is not a customer:", req.user);
    return res.status(403).json({ message: "Forbidden. Customers only." });
  }
  next();
};
export const validateSession = async (req, res, next) => {
  try {
    const sessionId = req.sessionID;

    console.log("[AUTH] Validating session ID:", sessionId);

    const [results] = await req.db.query(
      "SELECT * FROM sessions WHERE session_id = ?",
      [sessionId]
    );

    if (results.length === 0) {
      console.warn("[AUTH] Invalid session ID:", sessionId);
      return res
        .status(401)
        .json({ message: "Session expired. Please log in again." });
    }

    console.log("[AUTH] Session validated:", results[0]);
    req.user = results[0]; // Attach session data to req.user
    next();
  } catch (error) {
    console.error("[AUTH] Error validating session:", error.message);
    res.status(500).json({ message: "Server error during session validation" });
  }
};
