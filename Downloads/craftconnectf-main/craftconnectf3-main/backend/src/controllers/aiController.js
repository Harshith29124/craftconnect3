// Import dependencies
const { SpeechClient } = require("@google-cloud/speech");
const { VertexAI } = require("@google-cloud/vertexai");

// Initialize clients with proper error handling and environment validation
let speechClient = null;
let vertexAI = null;
let generativeAI = null;

// Environment validation
function validateEnvironment() {
  const required = ['GOOGLE_PROJECT_ID'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    return false;
  }
  return true;
}

// Initialize Google AI clients with proper error handling
function initializeGoogleAI() {
  if (!validateEnvironment()) {
    console.error('❌ Environment validation failed - Google AI clients not initialized');
    return false;
  }

  try {
    // Initialize Speech client
    speechClient = new SpeechClient({
      projectId: process.env.GOOGLE_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || undefined
    });
    console.log("✅ Speech client initialized successfully");
  } catch (e) {
    console.error("❌ Failed to initialize Speech client:", e.message);
    speechClient = null;
  }

  try {
    // Initialize Vertex AI client
    vertexAI = new VertexAI({
      project: process.env.GOOGLE_PROJECT_ID,
      location: process.env.GOOGLE_LOCATION || "us-central1",
    });
    
    // Get generative model
    generativeAI = vertexAI.getGenerativeModel({
      model: process.env.VERTEX_MODEL || "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        maxOutputTokens: 2048,
      },
    });
    
    console.log("✅ Vertex AI initialized successfully");
    return true;
  } catch (e) {
    console.error("❌ Failed to initialize Vertex AI:", e.message);
    vertexAI = null;
    generativeAI = null;
    return false;
  }
}

// Initialize on module load
const aiInitialized = initializeGoogleAI();

/**
 * Enhanced transcription with multiple format support and better error handling
 */
async function transcribeAudio(audioBuffer) {
  console.log("🎤 Starting audio transcription...");
  console.log(`📊 Audio buffer size: ${audioBuffer.length} bytes`);
  
  if (!speechClient) {
    console.error('❌ Speech client not initialized');
    throw new Error("Speech recognition service not available");
  }

  // Enhanced encoding detection with priority order
  const encodingConfigs = [
    { encoding: "WEBM_OPUS", sampleRateHertz: 48000 },
    { encoding: "MP3", sampleRateHertz: 44100 },
    { encoding: "WAV", sampleRateHertz: 16000 },
    { encoding: "OGG_OPUS", sampleRateHertz: 48000 },
  ];

  let lastError = null;

  for (const { encoding, sampleRateHertz } of encodingConfigs) {
    try {
      console.log(`🔄 Attempting transcription with ${encoding} @ ${sampleRateHertz}Hz`);
      
      const audio = {
        content: audioBuffer.toString("base64"),
      };
      
      const config = {
        encoding,
        sampleRateHertz,
        languageCode: "en-US",
        alternativeLanguageCodes: ["hi-IN", "en-IN"],
        enableAutomaticPunctuation: true,
        model: "latest_long",
        speechContexts: [{
          phrases: [
            "business", "craft", "artisan", "pottery", "textile", "jewelry",
            "marketplace", "customers", "products", "pricing", "handmade",
            "traditional", "online", "website", "social media", "WhatsApp"
          ],
          boost: 15.0
        }],
        enableWordConfidence: true,
        enableWordTimeOffsets: true
      };
      
      const request = { audio, config };
      const [response] = await speechClient.recognize(request);
      
      if (response.results && response.results.length > 0) {
        const transcription = response.results
          .map((result) => result.alternatives[0].transcript)
          .join(" ")
          .trim();
          
        if (transcription.length > 10) { // Minimum viable transcription
          console.log(`✅ Transcription successful with ${encoding}`);
          console.log(`📝 Transcript length: ${transcription.length} characters`);
          
          // Calculate confidence score
          const avgConfidence = response.results.reduce((acc, result) => {
            return acc + (result.alternatives[0].confidence || 0.8);
          }, 0) / response.results.length;
          
          return { 
            success: true, 
            text: transcription,
            confidence: Math.round(avgConfidence * 100),
            encoding: encoding
          };
        }
      }
      
      console.log(`⚠️ No viable transcription with ${encoding}`);
    } catch (err) {
      console.log(`❌ Failed with ${encoding}:`, err.message);
      lastError = err;
      continue;
    }
  }

  console.error("❌ All transcription attempts failed");
  return {
    success: false,
    error: `Speech recognition failed with all formats. Last error: ${lastError?.message || "Unknown"}`
  };
}

/**
 * Enhanced JSON parsing with better repair logic
 */
function parseAIResponse(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Invalid AI response - empty or non-string');
  }

  // Step 1: Extract JSON from markdown or text
  let jsonStr = rawText;
  
  // Remove markdown code blocks
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1];
  }
  
  // Find JSON boundaries
  const firstBrace = jsonStr.indexOf('{');
  const lastBrace = jsonStr.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
    throw new Error('No valid JSON object found in AI response');
  }
  
  jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
  
  // Step 2: Try direct parse
  try {
    const parsed = JSON.parse(jsonStr);
    return validateAndRepairAnalysis(parsed);
  } catch (parseError) {
    console.log('⚠️ Direct JSON parse failed, attempting repair...');
  }
  
  // Step 3: Repair common JSON issues
  try {
    let repaired = jsonStr
      // Fix unquoted keys
      .replace(/(\s*)(\w+)(\s*):/g, '$1"$2"$3:')
      // Fix single quotes to double quotes
      .replace(/:\s*'([^']*)'/g, ': "$1"')
      // Remove trailing commas
      .replace(/,(\s*[}\]])/g, '$1')
      // Balance braces
      ;
    
    const openBraces = (repaired.match(/{/g) || []).length;
    const closeBraces = (repaired.match(/}/g) || []).length;
    
    if (openBraces > closeBraces) {
      repaired += '}'.repeat(openBraces - closeBraces);
    }
    
    const parsed = JSON.parse(repaired);
    return validateAndRepairAnalysis(parsed);
  } catch (repairError) {
    console.error('❌ JSON repair failed:', repairError.message);
    
    // Return fallback analysis
    return createFallbackAnalysis('JSON parsing failed');
  }
}

/**
 * Validate and repair analysis object structure
 */
function validateAndRepairAnalysis(data) {
  const repaired = {
    businessType: typeof data.businessType === 'string' && data.businessType.length > 0 
      ? data.businessType : "Craft Business",
    detectedFocus: typeof data.detectedFocus === 'string' && data.detectedFocus.length > 0
      ? data.detectedFocus : "Handmade Products",
    topProblems: Array.isArray(data.topProblems) && data.topProblems.length > 0
      ? data.topProblems.filter(p => typeof p === 'string' && p.length > 0)
      : ["Unable to determine specific challenges"],
    recommendedSolutions: {
      primary: {
        id: data.recommendedSolutions?.primary?.id || "website",
        reason: data.recommendedSolutions?.primary?.reason || "A basic online presence is essential"
      },
      secondary: {
        id: data.recommendedSolutions?.secondary?.id || "whatsapp",
        reason: data.recommendedSolutions?.secondary?.reason || "Direct customer communication"
      }
    },
    confidence: typeof data.confidence === 'number' && data.confidence >= 0 && data.confidence <= 100
      ? data.confidence
      : (typeof data.confidence === 'string' && !isNaN(parseInt(data.confidence))
        ? Math.max(0, Math.min(100, parseInt(data.confidence)))
        : 85)
  };
  
  // Ensure problems array has at least one item
  if (repaired.topProblems.length === 0) {
    repaired.topProblems = ["No specific challenges identified"];
  }
  
  // Validate solution IDs
  const validSolutionIds = ['website', 'whatsapp', 'instagram'];
  if (!validSolutionIds.includes(repaired.recommendedSolutions.primary.id)) {
    repaired.recommendedSolutions.primary.id = 'website';
  }
  if (!validSolutionIds.includes(repaired.recommendedSolutions.secondary.id)) {
    repaired.recommendedSolutions.secondary.id = 'whatsapp';
  }
  
  return repaired;
}

/**
 * Create fallback analysis when AI processing fails
 */
function createFallbackAnalysis(reason = 'AI processing unavailable') {
  return {
    businessType: "Craft Business",
    detectedFocus: "Handmade Products",
    topProblems: [reason, "Limited online presence", "Need better customer reach"],
    recommendedSolutions: {
      primary: {
        id: "website",
        reason: "A professional website builds credibility and showcases your products"
      },
      secondary: {
        id: "whatsapp",
        reason: "WhatsApp Business enables direct customer communication and orders"
      }
    },
    confidence: 75,
    fallback: true
  };
}

/**
 * Enhanced Vertex AI analysis with better prompt and error handling
 */
async function analyzeTranscriptWithVertexAI(transcript) {
  console.log("🤖 Starting Vertex AI analysis...");
  console.log(`📝 Transcript length: ${transcript.length} characters`);
  
  if (!generativeAI) {
    console.error('❌ Vertex AI not initialized');
    return {
      success: false,
      error: "Vertex AI not initialized",
      fallbackAnalysis: createFallbackAnalysis('Vertex AI unavailable')
    };
  }

  // Improved prompt with clearer instructions
  const prompt = `Analyze this craft business description and return ONLY a valid JSON object.

Business Description: "${transcript.replace(/"/g, "'").substring(0, 1000)}"

Return this exact JSON structure:
{
  "businessType": "[Pottery/Textiles/Jewelry/Woodwork/etc.]",
  "detectedFocus": "[main products/services mentioned]",
  "topProblems": ["problem1", "problem2"],
  "recommendedSolutions": {
    "primary": {
      "id": "website",
      "reason": "why this is best first step"
    },
    "secondary": {
      "id": "whatsapp",
      "reason": "why this is good second option"
    }
  },
  "confidence": 90
}

IMPORTANT: 
- Only return the JSON object, no other text
- Use only these solution IDs: "website", "whatsapp", "instagram"
- Confidence should be 80-95
- Keep reasons brief but compelling`;

  try {
    console.log('📤 Sending request to Vertex AI...');
    
    const request = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1, // Lower for more consistent JSON
        topP: 0.8,
        maxOutputTokens: 1024,
        candidateCount: 1
      }
    };
    
    const result = await generativeAI.generateContent(request);
    
    // Extract response text with multiple fallbacks
    let responseText = null;
    
    if (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      responseText = result.response.candidates[0].content.parts[0].text;
    } else if (result?.response?.text) {
      responseText = result.response.text;
    } else if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
      responseText = result.candidates[0].content.parts[0].text;
    } else {
      throw new Error('No valid response text found in Vertex AI result');
    }

    console.log('📥 Received response from Vertex AI');
    console.log(`📄 Response length: ${responseText.length} characters`);
    console.log('🔍 Raw response preview:', responseText.substring(0, 200) + '...');
    
    // Parse and validate the response
    const analysis = parseAIResponse(responseText);
    console.log('✅ Analysis parsed successfully');
    console.log('📋 Final analysis:', JSON.stringify(analysis, null, 2));
    
    return {
      success: true,
      data: analysis,
      rawResponse: responseText
    };
    
  } catch (error) {
    console.error("❌ Vertex AI analysis error:", error.message);
    console.error('🔍 Error details:', error);
    
    // Return fallback analysis with error context
    return { 
      success: false, 
      error: error.message,
      fallbackAnalysis: createFallbackAnalysis(`Vertex AI error: ${error.message}`)
    };
  }
}

// --- MAIN API HANDLERS ---

exports.analyzeBusinessAudio = async (req, res) => {
  console.log("\n🎯 === BUSINESS AUDIO ANALYSIS STARTED ===");
  console.log(`🕐 Timestamp: ${new Date().toISOString()}`);
  
  // Validate request
  if (!req.file || !req.file.buffer) {
    console.error("❌ No audio file in request");
    return res.status(400).json({
      success: false,
      error: "No audio file uploaded",
      message: "Please upload an audio file for analysis.",
      analysis: createFallbackAnalysis("No audio file provided")
    });
  }

  console.log(`📁 File received:`, {
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: `${(req.file.size / 1024).toFixed(2)} KB`,
    bufferLength: req.file.buffer.length
  });

  try {
    // Step 1: Transcribe audio
    console.log("\n📝 === TRANSCRIPTION PHASE ===");
    const transcriptionResult = await transcribeAudio(req.file.buffer);
    
    if (!transcriptionResult.success) {
      console.error("❌ Transcription failed:", transcriptionResult.error);
      return res.status(200).json({
        success: false,
        error: transcriptionResult.error,
        message: "Could not transcribe audio. Please speak clearly and ensure good audio quality.",
        analysis: createFallbackAnalysis("Transcription failed")
      });
    }
    
    const transcript = transcriptionResult.text;
    console.log(`✅ Transcription completed successfully`);
    console.log(`📊 Confidence: ${transcriptionResult.confidence}%`);
    console.log(`📝 Transcript preview: "${transcript.substring(0, 150)}..."`);
    
    // Step 2: AI Analysis
    console.log("\n🤖 === AI ANALYSIS PHASE ===");
    const analysisResult = await analyzeTranscriptWithVertexAI(transcript);
    
    if (!analysisResult.success) {
      console.warn("⚠️ AI analysis failed, returning transcript with fallback");
      return res.status(200).json({
        success: true,
        partial: true,
        transcript: transcript,
        transcriptionConfidence: transcriptionResult.confidence,
        error: analysisResult.error,
        analysis: analysisResult.fallbackAnalysis || createFallbackAnalysis("AI analysis failed")
      });
    }

    // Success response
    console.log("\n✅ === ANALYSIS COMPLETED SUCCESSFULLY ===");
    console.log(`🎯 Business Type: ${analysisResult.data.businessType}`);
    console.log(`🔍 Focus: ${analysisResult.data.detectedFocus}`);
    console.log(`💡 Primary Solution: ${analysisResult.data.recommendedSolutions.primary.id}`);
    
    return res.status(200).json({
      success: true,
      transcript: transcript,
      transcriptionConfidence: transcriptionResult.confidence,
      analysis: analysisResult.data,
      processingTime: {
        transcription: transcriptionResult.encoding,
        analysis: 'vertex-ai-success'
      }
    });
    
  } catch (error) {
    console.error("\n❌ === UNEXPECTED ERROR ===");
    console.error('🚨 Error:', error.message);
    console.error('🔍 Stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "An unexpected error occurred during processing.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      analysis: createFallbackAnalysis("Server error")
    });
  }
};

exports.generateWhatsAppMessage = async (req, res) => {
  console.log("\n💬 === WHATSAPP MESSAGE GENERATION ===");
  
  if (!generativeAI) {
    console.warn('⚠️ Vertex AI not available, using fallback message');
    const fallbackMessage = `👋 Hello! Thank you for your interest in our handmade crafts.\n\n🎨 We create beautiful, authentic products with traditional techniques.\n\n✨ Key features:\n• Handmade with care\n• Traditional craftsmanship\n• Custom orders available\n• Fast delivery\n\n📞 Reply to this message to place your order or ask questions!\n\n🙏 Thank you for supporting local artisans!`;
    
    return res.status(200).json({ 
      success: true,
      partial: true,
      message: fallbackMessage,
      error: "AI generation unavailable - using template" 
    });
  }

  const { businessType, detectedFocus, transcript } = req.body;
  
  console.log('📋 Request data:', { businessType, detectedFocus, transcript: !!transcript });

  if (!transcript) {
    return res.status(400).json({
      success: false,
      error: "Missing transcript",
      message: "Business transcript is required to generate WhatsApp message"
    });
  }

  // Enhanced WhatsApp message prompt
  const prompt = `Create a professional WhatsApp Business message based on this craft business:

Business Type: ${businessType || "Craft Business"}
Products/Focus: ${detectedFocus || "Handmade products"}
Original Description: "${transcript.substring(0, 500)}"

Create a message that:
1. Starts with friendly greeting and emoji
2. Introduces the business and specialty
3. Uses 2-3 bullet points for key features
4. Includes relevant emojis for visual appeal
5. Ends with clear call-to-action
6. Keeps total length under 200 words

Return only the message text, no quotes or formatting.`;

  try {
    const request = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 400,
      }
    };
    
    const result = await generativeAI.generateContent(request);
    
    let message = "";
    if (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      message = result.response.candidates[0].content.parts[0].text.trim();
    } else {
      throw new Error("Invalid response format from Vertex AI");
    }

    console.log('✅ WhatsApp message generated successfully');
    console.log(`📝 Message length: ${message.length} characters`);
    
    return res.status(200).json({ 
      success: true, 
      message,
      businessType: businessType || "Craft Business",
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ WhatsApp message generation error:", error.message);
    
    // Enhanced fallback message with business context
    const contextualFallback = `👋 Hello there!

Thank you for your interest in our ${businessType || "craft business"}! We specialize in ${detectedFocus || "handmade products"} made with traditional techniques and attention to detail.

✨ What makes us special:
• Authentic handmade quality
• Traditional craftsmanship
• Custom orders welcome
• Fast and reliable service

📞 Please reply to this message with your requirements, and we'll get back to you with details and pricing!

🙏 Thank you for supporting local artisans!`;
    
    return res.status(200).json({ 
      success: true, 
      partial: true,
      message: contextualFallback,
      businessType: businessType || "Craft Business",
      error: "AI generation failed - using enhanced template",
      generatedAt: new Date().toISOString()
    });
  }
};

// Export initialization status for health checks
exports.getAIStatus = () => {
  return {
    initialized: aiInitialized,
    speechClient: !!speechClient,
    vertexAI: !!vertexAI,
    generativeAI: !!generativeAI,
    environment: {
      projectId: !!process.env.GOOGLE_PROJECT_ID,
      location: process.env.GOOGLE_LOCATION || 'us-central1',
      model: process.env.VERTEX_MODEL || 'gemini-1.5-flash'
    }
  };
};