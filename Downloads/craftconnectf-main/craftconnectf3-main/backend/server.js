const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Core middleware
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
const apiRoutes = require("./src/routes/api");

// Mongo connect first, then start server
mongoose.set("bufferCommands", false);
mongoose.set("strictQuery", true);

const PORT = Number(process.env.PORT) || 8080;

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: "majority",
    });
    console.log("✅ MongoDB connected");

    app.get("/", (_req, res) => res.status(200).send("Backend is running!"));
    app.use("/api", apiRoutes);

    app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
})();
