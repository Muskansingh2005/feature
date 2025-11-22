/**
 * Main Server Entry
 * -----------------
 * Enhanced with better error handling
 */
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";

dotenv.config();

// Create express app **before using any middleware**
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB with error handling
try {
  await connectDB(process.env.MONGO_URI);
  console.log("📦 MongoDB connected");
} catch (error) {
  console.error("❌ Failed to connect to MongoDB:", error.message);
  process.exit(1);
}

// Root Route
app.get("/", (req, res) => {
  res.json({
    message: "📚 Library Management Backend Running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api", routes);

// 404 Handler (MUST come after all valid routes)
app.use((req, res) => {
  res.status(404).json({ message: "❓ Route not found" });
});

// Error Handler (MUST remain at the bottom)
app.use((error, req, res, next) => {
  console.error("🔥 Server error:", error.stack);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

// Server Listener
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful Shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received. Closing server...");
  server.close(() => console.log("👋 Server stopped"));
});
