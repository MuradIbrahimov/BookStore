import express from "express";
import connectLivereload from "connect-livereload";
import livereload from "livereload";
import cors from "cors"; // Import CORS
import path from "path";
import { fileURLToPath } from "url";
import authRouter from "./routes/auth.js"; // Import the auth route
import { promisePool } from "./db/sql.js"; // Import promisePool
import adminRouter from "./routes/admin.js"; // Import the auth route

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
const allowedOrigins = ["http://localhost:3000"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Enable credentials (cookies, authorization headers)
  })
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

// Use the auth router for handling /auth routes
app.use("/auth", authRouter);
app.use("admin/dashboard", adminRouter);
// Define a simple test route
app.get("/", (req, res) => {
  res.send("Hello, world! LiveReload is enabled.");
});

// Start the Express server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
