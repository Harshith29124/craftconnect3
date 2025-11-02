// Health check controller for debugging deployment issues

exports.healthCheck = (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: process.memoryUsage()
    },
    services: {
      mongodb: false,
      googleAI: false,
      apis: {
        speechToText: false,
        vertexAI: false,
        vision: false
      }
    }
  };

  // Check MongoDB connection
  const mongoose = require('mongoose');
  health.services.mongodb = mongoose.connection.readyState === 1;

  // Check Google AI initialization
  try {
    const { SpeechClient } = require('@google-cloud/speech');
    const { VertexAI } = require('@google-cloud/vertexai');
    
    health.services.apis.speechToText = !!process.env.GOOGLE_PROJECT_ID;
    health.services.apis.vertexAI = !!process.env.GOOGLE_PROJECT_ID;
    health.services.googleAI = health.services.apis.speechToText && health.services.apis.vertexAI;
  } catch (error) {
    health.services.googleAI = false;
    health.error = error.message;
  }

  const statusCode = health.services.mongodb && health.services.googleAI ? 200 : 503;
  
  res.status(statusCode).json(health);
};

// Environment variables check
exports.envCheck = (req, res) => {
  const requiredEnvVars = [
    'GOOGLE_PROJECT_ID',
    'MONGODB_URI',
    'CLIENT_URL'
  ];

  const envStatus = {
    timestamp: new Date().toISOString(),
    required: {},
    optional: {},
    missing: []
  };

  // Check required environment variables
  requiredEnvVars.forEach(varName => {
    const exists = !!process.env[varName];
    envStatus.required[varName] = exists;
    if (!exists) {
      envStatus.missing.push(varName);
    }
  });

  // Check optional environment variables
  const optionalEnvVars = [
    'GOOGLE_LOCATION',
    'VERTEX_MODEL',
    'CLOUDINARY_CLOUD_NAME',
    'FACEBOOK_ACCESS_TOKEN',
    'WHATSAPP_TOKEN',
    'SHOPIFY_ACCESS_TOKEN'
  ];

  optionalEnvVars.forEach(varName => {
    envStatus.optional[varName] = !!process.env[varName];
  });

  envStatus.allRequiredPresent = envStatus.missing.length === 0;
  
  const statusCode = envStatus.allRequiredPresent ? 200 : 500;
  res.status(statusCode).json(envStatus);
};