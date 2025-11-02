const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Core middleware
app.use(cors({ 
  origin: process.env.CLIENT_URL || "*", 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check routes (add before other routes)
const healthController = require("./src/controllers/healthController");
app.get("/health", healthController.healthCheck);
app.get("/env-check", healthController.envCheck);

// Basic route
app.get("/", (_req, res) => {
  res.status(200).json({
    message: "CraftConnect Backend is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: "1.0.0"
  });
});

// Routes
const apiRoutes = require("./src/routes/api");
app.use("/api", apiRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /env-check',
      'POST /api/analyze-business',
      'POST /api/generate-whatsapp-message'
    ]
  });
});

// Enhanced MongoDB connection with better error handling
mongoose.set("bufferCommands", false);
mongoose.set("strictQuery", true);

const PORT = Number(process.env.PORT) || 8080;

(async () => {
  try {
    console.log("🚀 Starting CraftConnect Backend...");
    console.log(`📦 Node.js version: ${process.version}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔧 Port: ${PORT}`);
    
    // Check critical environment variables
    const requiredEnvVars = ['MONGODB_URI'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingEnvVars.length > 0) {
      console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
      console.error('Please check your .env file or environment configuration');
    } else {
      console.log('✅ All required environment variables present');
    }

    // MongoDB connection with detailed logging
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: "majority",
    });
    console.log("✅ MongoDB connected successfully");
    console.log(`📍 Database: ${mongoose.connection.name}`);

    // Start server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server listening on http://0.0.0.0:${PORT}`);
      console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
      console.log(`⚙️ Environment check: http://0.0.0.0:${PORT}/env-check`);
      console.log(`🎯 API endpoints available at: http://0.0.0.0:${PORT}/api/`);
      console.log('✅ Backend startup completed successfully');
    });

    // Graceful shutdown handling
    process.on('SIGTERM', async () => {
      console.log('🛑 SIGTERM received, shutting down gracefully');
      server.close(async () => {
        await mongoose.connection.close();
        console.log('✅ Server and database connections closed');
        process.exit(0);
      });
    });

  } catch (err) {
    console.error("❌ Backend startup failed:", err.message);
    console.error('Full error:', err);
    
    // More detailed error information
    if (err.message.includes('ENOTFOUND') || err.message.includes('ECONNREFUSED')) {
      console.error('🔍 This appears to be a network/DNS issue. Check:');
      console.error('   - MongoDB URI is correct');
      console.error('   - Network connectivity to MongoDB Atlas');
      console.error('   - Firewall settings allow outbound connections');
    }
    
    if (err.message.includes('authentication')) {
      console.error('🔍 This appears to be an authentication issue. Check:');
      console.error('   - MongoDB username/password are correct');
      console.error('   - Database user has proper permissions');
      console.error('   - IP whitelist includes your deployment IP');
    }
    
    process.exit(1);
  }
})();