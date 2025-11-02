const { SpeechClient } = require('@google-cloud/speech');
const { VertexAI } = require('@google-cloud/vertexai');
const mongoose = require('mongoose');
const BusinessSession = require('../models/BusinessSession');

// Initialize Google Cloud clients
const speechClient = new SpeechClient();
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
  console.log('✅ Business Controller Vertex AI initialized');
} catch (e) {
  console.error('❌ Failed to initialize Vertex AI in business controller:', e.message);
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

// Step 1: Analyze Business Overview
exports.analyzeBusinessOverview = async (req, res) => {
  try {
    console.log('📢 Starting business overview analysis...');

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Speech-to-Text
    const audioBytes = req.file.buffer.toString('base64');
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
    
    const transcript = response.results
      ?.map(result => result.alternatives[0]?.transcript)
      .join(' ') || '';

    console.log('🎤 Transcript:', transcript);
    if (!transcript) {
      return res.status(400).json({ error: 'Could not transcribe audio' });
    }

    // Vertex AI Analysis
    if (!generativeModel) {
      return res.status(500).json({ error: 'Vertex AI not initialized' });
    }

    const prompt = `Analyze this craft business description and provide a structured JSON summary:

"${transcript}"

Provide JSON with: businessType, businessName, experience, location, mainChallenges[], currentStatus, goals[], hasOnlinePresence, targetMarket, keyStrengths[]`;

    const result = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    });

    const aiText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const businessSummary = extractJson(aiText) || { rawResponse: aiText };

    // Save session
    const sessionId = new mongoose.Types.ObjectId();
    await new BusinessSession({
      _id: sessionId,
      transcript,
      businessSummary,
      step: 'business_overview_complete',
      createdAt: new Date(),
      updatedAt: new Date()
    }).save();

    console.log('✅ Business overview complete');
    res.json({
      success: true,
      sessionId: sessionId.toString(),
      transcript,
      businessSummary,
      nextStep: 'validate_summary'
    });

  } catch (error) {
    console.error('❌ Error in business overview:', error);
    res.status(500).json({
      error: 'Failed to analyze business overview',
      details: error.message
    });
  }
};

// Step 2: Validate Business Summary
exports.validateBusinessSummary = async (req, res) => {
  try {
    const { sessionId, corrections, isApproved } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'Session ID required' });

    const session = await BusinessSession.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    if (isApproved) {
      session.step = 'ready_for_product_analysis';
      session.businessSummaryApproved = true;
    } else if (corrections) {
      session.businessSummary = { ...session.businessSummary, ...corrections };
      session.step = 'ready_for_product_analysis';
      session.businessSummaryApproved = true;
    }

    session.updatedAt = new Date();
    await session.save();

    res.json({
      success: true,
      sessionId,
      updatedSummary: session.businessSummary,
      nextStep: 'product_analysis'
    });
  } catch (error) {
    console.error('❌ Error validating summary:', error);
    res.status(500).json({ error: 'Failed to validate summary', details: error.message });
  }
};

// Step 4: Generate Recommendations
exports.generateRecommendations = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'Session ID required' });

    const session = await BusinessSession.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    if (!generativeModel) {
      return res.status(500).json({ error: 'Vertex AI not initialized' });
    }

    const prompt = `Based on this analysis, provide JSON recommendations:

BUSINESS: ${JSON.stringify(session.businessSummary, null, 2)}
PRODUCT: ${JSON.stringify(session.productAnalysis, null, 2)}

Provide JSON with: primaryRecommendations[], contentStrategy{}, marketingMessages{}, nextSteps[]`;

    const result = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 3072,
      },
    });

    const aiText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const recommendations = extractJson(aiText) || { rawResponse: aiText };

    session.finalRecommendations = recommendations;
    session.step = 'complete';
    session.updatedAt = new Date();
    await session.save();

    res.json({
      success: true,
      sessionId,
      recommendations,
      businessSummary: session.businessSummary,
      productAnalysis: session.productAnalysis
    });
  } catch (error) {
    console.error('❌ Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations', details: error.message });
  }
};

// Session Management
exports.getSession = async (req, res) => {
  try {
    const session = await BusinessSession.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get session', details: error.message });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const session = await BusinessSession.findByIdAndUpdate(
      req.params.sessionId,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update session', details: error.message });
  }
};
