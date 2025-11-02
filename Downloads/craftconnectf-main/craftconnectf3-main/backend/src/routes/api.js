require("dotenv").config();

const express = require("express");
const multer = require("multer");

// Import all controllers
const aiController = require("../controllers/aiController");
const imageController = require("../controllers/imageController");
const productController = require("../controllers/productController");
const businessController = require("../controllers/businessController");
const healthController = require("../controllers/healthController");
const whatsappController = require("../controllers/whatsappController");
const smartEnhancerController = require("../controllers/smartEnhancerController");
const quotationController = require("../controllers/quotationController");
const facebookController = require("../controllers/facebookController");
const shopifyController = require("../controllers/shopifyController");

const router = express.Router();

// Enhanced multer configuration with file type validation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'audio/webm', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/m4a',
      'image/jpeg', 'image/png', 'image/webp', 'image/gif'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Supported: ${allowedTypes.join(', ')}`), false);
    }
  }
});

// Enhanced error handling for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    const errorResponses = {
      'LIMIT_FILE_SIZE': {
        status: 413,
        error: 'File too large',
        message: 'File size must be less than 10MB',
        maxSize: '10MB'
      },
      'LIMIT_FILE_COUNT': {
        status: 413,
        error: 'Too many files',
        message: 'Maximum 10 files allowed per request',
        maxFiles: 10
      },
      'LIMIT_UNEXPECTED_FILE': {
        status: 400,
        error: 'Unexpected file field',
        message: 'Please check the file field name in your request'
      }
    };
    
    const response = errorResponses[error.code] || {
      status: 400,
      error: 'File upload error',
      message: error.message
    };
    
    return res.status(response.status).json({
      success: false,
      ...response,
      timestamp: new Date().toISOString()
    });
  }
  
  if (error.message.includes('Unsupported file type')) {
    return res.status(415).json({
      success: false,
      error: 'Unsupported media type',
      message: error.message,
      supportedTypes: ['audio/webm', 'audio/wav', 'audio/mp3', 'image/jpeg', 'image/png', 'image/webp']
    });
  }
  
  next(error);
};

// Request logging and correlation ID middleware
router.use((req, res, next) => {
  req.correlationId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`\n📨 [${req.correlationId}] ${req.method} ${req.path}`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📋 [${req.correlationId}] Body keys:`, Object.keys(req.body));
  }
  
  if (req.file) {
    console.log(`📁 [${req.correlationId}] File:`, {
      name: req.file.originalname,
      type: req.file.mimetype,
      size: `${(req.file.size / 1024).toFixed(2)} KB`
    });
  }
  
  if (req.files) {
    console.log(`📁 [${req.correlationId}] Files:`, req.files.length);
  }
  
  next();
});

// === HEALTH & STATUS ENDPOINTS ===

router.get('/health', healthController.healthCheck);
router.get('/env-check', healthController.envCheck);
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'CraftConnect API is operational',
    correlationId: req.correlationId,
    timestamp: new Date().toISOString(),
    endpoints: {
      core: ['/analyze-business', '/generate-whatsapp-message'],
      whatsapp: ['/whatsapp/preview', '/whatsapp/send', '/whatsapp/status'],
      enhancer: ['/enhance/product', '/enhance/batch', '/enhance/status'],
      quotation: ['/quotation/generate', '/quotation/compare', '/quotation/status'],
      facebook: ['/facebook/create-post', '/facebook/preview', '/facebook/status'],
      shopify: ['/shopify/create-product', '/shopify/store', '/shopify/status']
    }
  });
});

// === WHATSAPP ENDPOINTS (Fully functional) ===

router.get('/whatsapp/status', whatsappController.getWhatsAppStatus);
router.post('/whatsapp/preview', whatsappController.previewWhatsAppMessage);
router.post('/whatsapp/send', whatsappController.sendWhatsAppMessage);
router.post('/whatsapp/bulk-send', whatsappController.sendBulkWhatsAppMessages);

// === SMART PRODUCT ENHANCER ENDPOINTS ===

router.get('/enhance/status', smartEnhancerController.getEnhancerStatus);
router.post('/enhance/product', 
  upload.single('image'), 
  handleMulterError, 
  smartEnhancerController.enhanceProduct
);
router.post('/enhance/batch', 
  upload.array('images', 10), 
  handleMulterError, 
  smartEnhancerController.enhanceBatch
);

// === AI QUOTATION ENDPOINTS ===

router.get('/quotation/status', quotationController.getQuotationStatus);
router.post('/quotation/generate', quotationController.generateQuotation);
router.post('/quotation/compare', quotationController.compareMarketPrices);
router.post('/quotation/bulk', quotationController.generateBulkQuotations);

// === FACEBOOK MARKETING ENDPOINTS ===

router.get('/facebook/status', facebookController.getFacebookStatus);
router.post('/facebook/preview', facebookController.previewFacebookPost);
router.post('/facebook/create-post', facebookController.createFacebookPost);
router.post('/facebook/variations', facebookController.generatePostVariations);
router.get('/facebook/insights', facebookController.getPageInsights);
router.post('/facebook/schedule', facebookController.scheduleFacebookPost);

// === SHOPIFY INTEGRATION ENDPOINTS ===

router.get('/shopify/status', shopifyController.getShopifyStatus);
router.get('/shopify/store', shopifyController.getShopifyStore);
router.post('/shopify/create-product', shopifyController.createShopifyProduct);
router.put('/shopify/inventory', shopifyController.updateShopifyInventory);
router.post('/shopify/bulk-create', shopifyController.createBulkShopifyProducts);

// === CORE AI ENDPOINTS (Enhanced) ===

// Main business analysis endpoint
router.post(
  "/analyze-business",
  upload.single("audio"),
  handleMulterError,
  async (req, res, next) => {
    try {
      console.log(`🎤 [${req.correlationId}] Business audio analysis started`);
      await aiController.analyzeBusinessAudio(req, res);
    } catch (error) {
      console.error(`❌ [${req.correlationId}] analyze-business error:`, error);
      next(error);
    }
  }
);

// WhatsApp message generation (legacy endpoint)
router.post(
  "/generate-whatsapp-message",
  async (req, res, next) => {
    try {
      console.log(`💬 [${req.correlationId}] WhatsApp message generation`);
      await aiController.generateWhatsAppMessage(req, res);
    } catch (error) {
      console.error(`❌ [${req.correlationId}] generate-whatsapp-message error:`, error);
      next(error);
    }
  }
);

// === ENHANCED FLOW API ENDPOINTS ===

// Step 1: Business Overview Analysis (Voice Recording)
router.post(
  "/business/analyze-overview",
  upload.single("audio"),
  handleMulterError,
  async (req, res, next) => {
    try {
      console.log(`🎯 [${req.correlationId}] Business overview analysis`);
      await businessController.analyzeBusinessOverview(req, res);
    } catch (error) {
      console.error(`❌ [${req.correlationId}] business/analyze-overview error:`, error);
      next(error);
    }
  }
);

// Step 2: Business Summary Validation
router.post(
  "/business/validate-summary",
  async (req, res, next) => {
    try {
      console.log(`✅ [${req.correlationId}] Business summary validation`);
      await businessController.validateBusinessSummary(req, res);
    } catch (error) {
      console.error(`❌ [${req.correlationId}] business/validate-summary error:`, error);
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
      console.log(`🖼️ [${req.correlationId}] Comprehensive product analysis`);
      await productController.analyzeComprehensive(req, res);
    } catch (error) {
      console.error(`❌ [${req.correlationId}] products/analyze-comprehensive error:`, error);
      next(error);
    }
  }
);

// Step 4: Generate Final Recommendations
router.post(
  "/recommendations/generate",
  async (req, res, next) => {
    try {
      console.log(`🎆 [${req.correlationId}] Final recommendations generation`);
      await businessController.generateRecommendations(req, res);
    } catch (error) {
      console.error(`❌ [${req.correlationId}] recommendations/generate error:`, error);
      next(error);
    }
  }
);

// === LEGACY/COMPATIBILITY ENDPOINTS ===

// Image upload and Vision AI analysis
router.post(
  "/image/upload",
  upload.single("image"),
  handleMulterError,
  async (req, res, next) => {
    try {
      console.log(`🖼️ [${req.correlationId}] Legacy image upload`);
      await imageController.uploadAndAnalyze(req, res);
    } catch (error) {
      console.error(`❌ [${req.correlationId}] image/upload error:`, error);
      next(error);
    }
  }
);

// AI processing pipeline
router.post("/ai/process", async (req, res, next) => {
  try {
    console.log(`⚙️ [${req.correlationId}] AI processing pipeline`);
    await productController.processProduct(req, res);
  } catch (error) {
    console.error(`❌ [${req.correlationId}] ai/process error:`, error);
    next(error);
  }
});

// Product management
router.get("/products/:id", async (req, res, next) => {
  try {
    console.log(`🖼️ [${req.correlationId}] Get product ${req.params.id}`);
    await productController.getProduct(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/products/:id/approve", async (req, res, next) => {
  try {
    console.log(`✅ [${req.correlationId}] Approve product ${req.params.id}`);
    await productController.approveProduct(req, res);
  } catch (error) {
    next(error);
  }
});

// Session management for multi-step flow
router.get("/session/:sessionId", async (req, res, next) => {
  try {
    console.log(`💾 [${req.correlationId}] Get session ${req.params.sessionId}`);
    await businessController.getSession(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/session/:sessionId/update", async (req, res, next) => {
  try {
    console.log(`💾 [${req.correlationId}] Update session ${req.params.sessionId}`);
    await businessController.updateSession(req, res);
  } catch (error) {
    next(error);
  }
});

// === COMPREHENSIVE STATUS ENDPOINT ===

router.get('/status/all', async (req, res) => {
  try {
    console.log(`📈 [${req.correlationId}] Comprehensive status check`);
    
    // Gather status from all services
    const [whatsappStatus, enhancerStatus, quotationStatus, facebookStatus, shopifyStatus] = await Promise.allSettled([
      new Promise((resolve) => {
        const mockReq = { correlationId: req.correlationId };
        const mockRes = {
          status: () => mockRes,
          json: (data) => resolve(data)
        };
        whatsappController.getWhatsAppStatus(mockReq, mockRes);
      }),
      new Promise((resolve) => {
        const mockReq = { correlationId: req.correlationId };
        const mockRes = {
          status: () => mockRes,
          json: (data) => resolve(data)
        };
        smartEnhancerController.getEnhancerStatus(mockReq, mockRes);
      }),
      new Promise((resolve) => {
        const mockReq = { correlationId: req.correlationId };
        const mockRes = {
          status: () => mockRes,
          json: (data) => resolve(data)
        };
        quotationController.getQuotationStatus(mockReq, mockRes);
      }),
      new Promise((resolve) => {
        const mockReq = { correlationId: req.correlationId };
        const mockRes = {
          status: () => mockRes,
          json: (data) => resolve(data)
        };
        facebookController.getFacebookStatus(mockReq, mockRes);
      }),
      new Promise((resolve) => {
        const mockReq = { correlationId: req.correlationId };
        const mockRes = {
          status: () => mockRes,
          json: (data) => resolve(data)
        };
        shopifyController.getShopifyStatus(mockReq, mockRes);
      })
    ]);
    
    const allServicesStatus = {
      overall: 'operational',
      correlationId: req.correlationId,
      services: {
        whatsapp: whatsappStatus.status === 'fulfilled' ? whatsappStatus.value : { error: whatsappStatus.reason },
        enhancer: enhancerStatus.status === 'fulfilled' ? enhancerStatus.value : { error: enhancerStatus.reason },
        quotation: quotationStatus.status === 'fulfilled' ? quotationStatus.value : { error: quotationStatus.reason },
        facebook: facebookStatus.status === 'fulfilled' ? facebookStatus.value : { error: facebookStatus.reason },
        shopify: shopifyStatus.status === 'fulfilled' ? shopifyStatus.value : { error: shopifyStatus.reason }
      },
      capabilities: {
        voiceToText: !!process.env.GOOGLE_PROJECT_ID,
        aiAnalysis: !!process.env.GOOGLE_PROJECT_ID,
        imageEnhancement: !!process.env.GOOGLE_PROJECT_ID,
        whatsappMessaging: true, // Always available (preview mode minimum)
        facebookPosting: !!process.env.FACEBOOK_ACCESS_TOKEN,
        shopifyIntegration: !!process.env.SHOPIFY_ACCESS_TOKEN,
        quotationGeneration: true
      },
      timestamp: new Date().toISOString()
    };
    
    res.status(200).json(allServicesStatus);
    
  } catch (error) {
    console.error(`❌ [${req.correlationId}] Status check error:`, error);
    res.status(500).json({
      success: false,
      error: 'Status check failed',
      correlationId: req.correlationId,
      message: error.message
    });
  }
});

// === COMPREHENSIVE ERROR HANDLER ===

router.use((error, req, res, next) => {
  console.error(`❌ [${req.correlationId}] Unhandled API error:`, error);
  
  // Determine error type and appropriate response
  let statusCode = 500;
  let errorType = 'internal_error';
  let userMessage = 'An unexpected error occurred';
  
  if (error.name === 'ValidationError') {
    statusCode = 400;
    errorType = 'validation_error';
    userMessage = 'Invalid request data';
  } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    statusCode = 503;
    errorType = 'service_unavailable';
    userMessage = 'External service temporarily unavailable';
  } else if (error.message?.includes('timeout')) {
    statusCode = 408;
    errorType = 'timeout';
    userMessage = 'Request timed out - please try again';
  }
  
  res.status(statusCode).json({
    success: false,
    error: errorType,
    message: userMessage,
    correlationId: req.correlationId,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && {
      details: error.message,
      stack: error.stack
    })
  });
});

// === 404 HANDLER ===

router.use('*', (req, res) => {
  console.log(`❌ [${req.correlationId}] Route not found: ${req.originalUrl}`);
  
  res.status(404).json({
    success: false,
    error: 'endpoint_not_found',
    message: `Route ${req.originalUrl} not found`,
    correlationId: req.correlationId,
    availableEndpoints: {
      health: 'GET /api/health',
      whatsapp: 'POST /api/whatsapp/preview, /api/whatsapp/send',
      enhancer: 'POST /api/enhance/product',
      quotation: 'POST /api/quotation/generate',
      facebook: 'POST /api/facebook/create-post',
      shopify: 'POST /api/shopify/create-product',
      core: 'POST /api/analyze-business'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;