import express from "express";
import connectLivereload from "connect-livereload";
import livereload from "livereload";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { promisePool } from "./database/db.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import loginRoutes from "./routes/login.js";
import AdminDashboard from "./routes/adminDashboard.js";
import LogoutRouter from "./routes/logout.js";
import MySQLStore from "express-mysql-session"; // Add MySQL session store

// Resolve __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create an Express app
const app = express();

// Middleware to parse JSON request bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Use cookie-parser middleware
app.use(cookieParser());

// Configure session middleware with MySQL store
const MySQLSessionStore = MySQLStore(session);

const sessionStore = new MySQLSessionStore(
  {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bookstoredb",
  },
  promisePool
);

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

// Register routes
app.use("/", loginRoutes); // Login routes
app.use("/admin", AdminDashboard); // Admin dashboard routes

// Test Route
app.get("/", (req, res) => {
  res.send("Hello, world! LiveReload is enabled.");
});

// Start the Express server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
