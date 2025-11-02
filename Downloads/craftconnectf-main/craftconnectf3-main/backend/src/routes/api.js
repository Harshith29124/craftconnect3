require("dotenv").config();

const express = require("express");
const multer = require("multer");
const aiController = require("../controllers/aiController");
const imageController = require("../controllers/imageController");
const productController = require("../controllers/productController");
const businessController = require("../controllers/businessController");

const router = express.Router();

// Configure multer for in-memory file storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// --- ENHANCED FLOW API ENDPOINTS ---

// Step 1: Business Overview Analysis (Voice Recording)
router.post(
  "/business/analyze-overview",
  upload.single("audio"),
  businessController.analyzeBusinessOverview
);

// Step 2: Business Summary Validation
router.post(
  "/business/validate-summary",
  businessController.validateBusinessSummary
);

// Step 3: Comprehensive Product Analysis (Voice + Images)
router.post(
  "/products/analyze-comprehensive",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  productController.analyzeComprehensive
);

// Step 4: Generate Final Recommendations
router.post(
  "/recommendations/generate",
  businessController.generateRecommendations
);

// --- EXISTING API ENDPOINTS (for backward compatibility) ---

// Handles audio analysis (Speech-to-Text and Vertex AI)
router.post(
  "/analyze-business",
  upload.single("audio"),
  aiController.analyzeBusinessAudio
);

// Handles WhatsApp message generation
router.post(
  "/generate-whatsapp-message",
  upload.single("image"),
  aiController.generateWhatsAppMessage
);

// --- ADDITIONAL API ENDPOINTS ---

// Image upload and Vision AI analysis
router.post(
  "/image/upload",
  upload.single("image"),
  imageController.uploadAndAnalyze
);

// AI processing pipeline (transcript + image -> product summary + enhancement)
router.post("/ai/process", productController.processProduct);

// Product management
router.get("/products/:id", productController.getProduct);

router.post("/products/:id/approve", productController.approveProduct);

// Session management for multi-step flow
router.get("/session/:sessionId", businessController.getSession);

router.post("/session/:sessionId/update", businessController.updateSession);

module.exports = router;
