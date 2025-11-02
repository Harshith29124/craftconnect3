require("dotenv").config();

const express = require("express");
const multer = require("multer");
const aiController = require("../controllers/aiController");
const imageController = require("../controllers/imageController");
const productController = require("../controllers/productController");
const businessController = require("../controllers/businessController");
const healthController = require("../controllers/healthController");

const router = express.Router();

// Configure multer for in-memory file storage with better error handling
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10
  },
  fileFilter: (req, file, cb) => {
    // Accept audio and image files
    const allowedTypes = [
      'audio/webm', 'audio/wav', 'audio/mp3', 'audio/ogg',
      'image/jpeg', 'image/png', 'image/webp', 'image/gif'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        message: 'File size must be less than 10MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files',
        message: 'Maximum 10 files allowed'
      });
    }
  }
  
  if (error.message.includes('Unsupported file type')) {
    return res.status(400).json({
      success: false,
      error: 'Unsupported file type',
      message: error.message
    });
  }
  
  next(error);
};

// Add debugging middleware
router.use((req, res, next) => {
  console.log(`API Request: ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// Health check routes
router.get('/health', healthController.healthCheck);
router.get('/env-check', healthController.envCheck);

// --- CORE API ENDPOINTS (Fixed) ---

// Main business analysis endpoint with better error handling
router.post(
  "/analyze-business",
  upload.single("audio"),
  handleMulterError,
  async (req, res, next) => {
    try {
      console.log('analyze-business endpoint hit');
      console.log('File received:', !!req.file);
      if (req.file) {
        console.log('File details:', {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        });
      }
      await aiController.analyzeBusinessAudio(req, res);
    } catch (error) {
      console.error('Error in analyze-business:', error);
      next(error);
    }
  }
);

// WhatsApp message generation endpoint
router.post(
  "/generate-whatsapp-message",
  express.json(),
  async (req, res, next) => {
    try {
      console.log('generate-whatsapp-message endpoint hit');
      console.log('Request body keys:', Object.keys(req.body));
      await aiController.generateWhatsAppMessage(req, res);
    } catch (error) {
      console.error('Error in generate-whatsapp-message:', error);
      next(error);
    }
  }
);

// --- ENHANCED FLOW API ENDPOINTS ---

// Step 1: Business Overview Analysis (Voice Recording)
router.post(
  "/business/analyze-overview",
  upload.single("audio"),
  handleMulterError,
  async (req, res, next) => {
    try {
      await businessController.analyzeBusinessOverview(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Step 2: Business Summary Validation
router.post(
  "/business/validate-summary",
  async (req, res, next) => {
    try {
      await businessController.validateBusinessSummary(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Step 3: Comprehensive Product Analysis (Voice + Images)
router.post(
  "/products/analyze-comprehensive",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  handleMulterError,
  async (req, res, next) => {
    try {
      await productController.analyzeComprehensive(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Step 4: Generate Final Recommendations
router.post(
  "/recommendations/generate",
  async (req, res, next) => {
    try {
      await businessController.generateRecommendations(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// --- ADDITIONAL API ENDPOINTS ---

// Image upload and Vision AI analysis
router.post(
  "/image/upload",
  upload.single("image"),
  handleMulterError,
  async (req, res, next) => {
    try {
      await imageController.uploadAndAnalyze(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// AI processing pipeline
router.post("/ai/process", async (req, res, next) => {
  try {
    await productController.processProduct(req, res);
  } catch (error) {
    next(error);
  }
});

// Product management
router.get("/products/:id", async (req, res, next) => {
  try {
    await productController.getProduct(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/products/:id/approve", async (req, res, next) => {
  try {
    await productController.approveProduct(req, res);
  } catch (error) {
    next(error);
  }
});

// Session management for multi-step flow
router.get("/session/:sessionId", async (req, res, next) => {
  try {
    await businessController.getSession(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/session/:sessionId/update", async (req, res, next) => {
  try {
    await businessController.updateSession(req, res);
  } catch (error) {
    next(error);
  }
});

// Test endpoint for quick debugging
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API routes are working',
    timestamp: new Date().toISOString(),
    endpoints: {
      core: ['/analyze-business', '/generate-whatsapp-message'],
      business: ['/business/analyze-overview', '/business/validate-summary'],
      products: ['/products/analyze-comprehensive', '/image/upload'],
      utility: ['/health', '/env-check', '/test']
    }
  });
});

module.exports = router;