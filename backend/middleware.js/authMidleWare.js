export const authenticate = (req, res, next) => {
  if (!req.cookies.user) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
  req.user = req.cookies.user; // Add user data to request object
  next();
};

export const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access forbidden: Admins only" });
  }
  next();
};

export const authorizeCustomer = (req, res, next) => {
  if (!req.user || req.user.role !== "customer") {
    return res
      .status(403)
      .json({ message: "Access forbidden: Customers only" });
  }
  next();
};
