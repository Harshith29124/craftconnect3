const { SpeechClient } = require('@google-cloud/speech');
const { VertexAI } = require('@google-cloud/vertexai');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const mongoose = require('mongoose');
const BusinessSession = require('../models/BusinessSession');
const Product = require('../models/Product');

// Initialize Google Cloud clients
const speechClient = new SpeechClient();
const visionClient = new ImageAnnotatorClient();
let vertexAI = null;
let generativeModel = null;

try {
  vertexAI = new VertexAI({
    project: process.env.GOOGLE_PROJECT_ID,
    location: process.env.GOOGLE_LOCATION || 'us-central1',
  });
  generativeModel = vertexAI.preview.getGenerativeModel({
    model: process.env.VERTEX_MODEL || 'gemini-2.5-flash',
  });
  console.log('✅ Product Controller Vertex AI initialized');
} catch (e) {
  console.error('❌ Failed to initialize Vertex AI in product controller:', e.message);
}

// Utility: extract JSON from text
function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

// Step 3: Comprehensive Product Analysis
exports.analyzeComprehensive = async (req, res) => {
  try {
    console.log('🎨 Starting comprehensive product analysis...');

    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    const session = await BusinessSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    let productTranscript = '';
    let imageAnalyses = [];

    // Process audio if provided
    if (req.files && req.files.audio && req.files.audio[0]) {
      console.log('🎤 Processing product audio...');
      
      const audioBytes = req.files.audio[0].buffer.toString('base64');
      const [response] = await speechClient.recognize({
        audio: { content: audioBytes },
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: 'en-US',
          enableAutomaticPunctuation: true,
          model: 'latest_long',
        },
      });
      
      productTranscript = response.results
        ?.map(result => result.alternatives[0]?.transcript)
        .join(' ') || '';

      console.log('📝 Product transcript:', productTranscript);
    }

    // Process images if provided
    if (req.files && req.files.images) {
      console.log(`📸 Processing ${req.files.images.length} images...`);
      
      for (let i = 0; i < req.files.images.length; i++) {
        const imageFile = req.files.images[i];
        
        try {
          const [visionResponse] = await visionClient.annotateImage({
            image: { content: imageFile.buffer.toString('base64') },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
              { type: 'TEXT_DETECTION' },
              { type: 'IMAGE_PROPERTIES' }
            ],
          });
          
          const analysis = {
            imageIndex: i + 1,
            labels: visionResponse.labelAnnotations?.map(label => ({
              description: label.description,
              score: label.score
            })) || [],
            objects: visionResponse.localizedObjectAnnotations?.map(obj => ({
              name: obj.name,
              score: obj.score
            })) || [],
            text: visionResponse.textAnnotations?.[0]?.description || ''
          };

          imageAnalyses.push(analysis);
          console.log(`✅ Image ${i + 1} analyzed`);
        } catch (error) {
          console.error(`❌ Image ${i + 1} failed:`, error.message);
          imageAnalyses.push({
            imageIndex: i + 1,
            error: 'Failed to analyze'
          });
        }
      }
    }

    // AI Analysis
    if (!generativeModel) {
      return res.status(500).json({ error: 'Vertex AI not initialized' });
    }

    const prompt = `Analyze this product with business context:

BUSINESS: ${JSON.stringify(session.businessSummary, null, 2)}
PRODUCT DESCRIPTION: "${productTranscript}"
IMAGE ANALYSIS: ${JSON.stringify(imageAnalyses, null, 2)}

Provide JSON with: productSummary{name,category,materials[],techniques[],uniqueFeatures[],qualityLevel,timeToMake}, marketingInsights{targetAudience,pricingRange,sellingPoints[],competitiveAdvantage}, recommendations{immediate[],shortTerm[],longTerm[]}`;

    const result = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 4096,
      },
    });

    const aiText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const productAnalysis = extractJson(aiText) || { rawResponse: aiText };

    // Update session
    session.productTranscript = productTranscript;
    session.imageAnalyses = imageAnalyses;
    session.productAnalysis = productAnalysis;
    session.step = 'product_analysis_complete';
    session.updatedAt = new Date();
    await session.save();

    console.log('✅ Product analysis complete');
    res.json({
      success: true,
      sessionId,
      productTranscript,
      imageAnalyses,
      productAnalysis,
      nextStep: 'generate_recommendations'
    });

  } catch (error) {
    console.error('❌ Error in product analysis:', error);
    res.status(500).json({
      error: 'Failed to analyze product',
      details: error.message
    });
  }
};

// Legacy functions
exports.processProduct = async (req, res) => {
  res.json({ success: true, message: 'Use /api/products/analyze-comprehensive' });
};

exports.getProduct = async (req, res) => {
  try {
    const product = await BusinessSession.findById(req.params.id) || await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get product', details: error.message });
  }
};

exports.approveProduct = async (req, res) => {
  try {
    const { approved, feedback } = req.body;
    let product = await BusinessSession.findById(req.params.id);
    
    if (product) {
      product.productApproved = approved;
      product.productFeedback = feedback;
      product.step = approved ? 'ready_for_recommendations' : 'product_needs_revision';
      product.updatedAt = new Date();
      await product.save();
    } else {
      product = await Product.findByIdAndUpdate(req.params.id, { approved, feedback, updatedAt: new Date() }, { new: true });
    }
    
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, product, nextStep: approved ? 'generate_recommendations' : 'revise_product' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve product', details: error.message });
  }
};
