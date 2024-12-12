import express from "express";
import connectLivereload from "connect-livereload";
import livereload from "livereload";
import cors from "cors"; // Import CORS
import path from "path";
import { fileURLToPath } from "url";
import { promisePool } from "./db/sql.js"; // Import promisePool

import session from "express-session"; // Import express-session

// Resolve __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create an Express app
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json()); // Required for POST requests with JSON payloads

// Attach the database connection to req
app.use((req, res, next) => {
  if (!promisePool) {
    console.error("Database connection is not initialized");
    return res.status(500).json({ error: "Database connection error" });
  }
  req.db = promisePool;
  next();
});

// Enable CORS
const allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow credentials (cookies, etc.)
  })
);

// Use cookie-parser middleware
app.use(cookieParser());

// Configure session middleware
app.use(
  session({
    secret: "murad", // Replace with your own secret
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000, // 1-hour session duration
      httpOnly: true, // Prevent client-side access to the cookie
      secure: false, // Set to true in production with HTTPS
      sameSite: "Lax", // Prevent CSRF
    },
  })
);
// app.use((req, res, next) => {
//   console.log("[DEBUG] Cookies:", req.headers.cookie);
//   console.log("[DEBUG] Session ID:", req.sessionID);
//   console.log("[DEBUG] Session Data:", req.session);
//   next();
// });


// Middleware for live reload
app.use(connectLivereload());

// Set up LiveReload server
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, "public"));

// Notify browser of changes
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});


// Define a simple test route
app.get("/", (req, res) => {
  res.send("Hello, world! LiveReload is enabled.");
});

// Start the Express server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
