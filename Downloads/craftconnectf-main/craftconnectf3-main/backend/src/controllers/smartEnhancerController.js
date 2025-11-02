const { VertexAI } = require('@google-cloud/vertexai');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const { v2: cloudinary } = require('cloudinary');
const axios = require('axios');

// Initialize Google AI clients
let vertexAI = null;
let visionClient = null;
let imageGenerationModel = null;

try {
  if (process.env.GOOGLE_PROJECT_ID) {
    // Vertex AI for Gemini 2.5 Flash + Nano Banana Image Model
    vertexAI = new VertexAI({
      project: process.env.GOOGLE_PROJECT_ID,
      location: process.env.GOOGLE_LOCATION || 'us-central1',
    });
    
    // Gemini 2.5 Flash with Nano Banana for image enhancement
    imageGenerationModel = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash', // Note: Nano Banana is accessed through Gemini 2.5 Flash
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        maxOutputTokens: 1024,
      },
    });
    
    // Vision API client
    visionClient = new ImageAnnotatorClient({
      projectId: process.env.GOOGLE_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || undefined
    });
    
    console.log('✅ Smart Product Enhancer - Google AI clients initialized');
  }
} catch (error) {
  console.error('❌ Smart Product Enhancer - Failed to initialize Google AI:', error.message);
}

// Configure Cloudinary for image storage
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  console.log('✅ Cloudinary configured for image storage');
}

/**
 * Analyze image with Vision API
 */
async function analyzeImageWithVision(imageBuffer) {
  if (!visionClient) {
    return {
      success: false,
      error: 'Vision API not available',
      fallback: {
        labels: ['handmade', 'craft', 'product'],
        colors: ['brown', 'natural'],
        quality: 75
      }
    };
  }
  
  try {
    console.log('🔍 Analyzing image with Vision API...');
    
    const [result] = await visionClient.annotateImage({
      image: { content: imageBuffer },
      features: [
        { type: 'LABEL_DETECTION', maxResults: 10 },
        { type: 'IMAGE_PROPERTIES' },
        { type: 'SAFE_SEARCH_DETECTION' },
        { type: 'OBJECT_LOCALIZATION', maxResults: 10 }
      ]
    });
    
    const analysis = {
      labels: result.labelAnnotations?.map(label => ({
        description: label.description,
        confidence: Math.round(label.score * 100)
      })).slice(0, 8) || [],
      
      colors: result.imagePropertiesAnnotation?.dominantColors?.colors?.map(color => ({
        rgb: `rgb(${Math.round(color.color.red || 0)}, ${Math.round(color.color.green || 0)}, ${Math.round(color.color.blue || 0)})`,
        score: Math.round(color.score * 100)
      })).slice(0, 5) || [],
      
      objects: result.localizedObjectAnnotations?.map(obj => ({
        name: obj.name,
        confidence: Math.round(obj.score * 100)
      })).slice(0, 5) || [],
      
      safeSearch: {
        adult: result.safeSearchAnnotation?.adult,
        violence: result.safeSearchAnnotation?.violence,
        racy: result.safeSearchAnnotation?.racy
      },
      
      quality: calculateImageQuality(result)
    };
    
    console.log('✅ Vision API analysis completed');
    return { success: true, data: analysis };
    
  } catch (error) {
    console.error('❌ Vision API analysis failed:', error.message);
    return {
      success: false,
      error: error.message,
      fallback: {
        labels: [{ description: 'product', confidence: 80 }],
        colors: [{ rgb: 'rgb(139, 69, 19)', score: 60 }], // Brown
        quality: 70
      }
    };
  }
}

/**
 * Calculate image quality score from Vision API results
 */
function calculateImageQuality(visionResult) {
  let score = 70; // Base score
  
  // Boost for clear object detection
  if (visionResult.localizedObjectAnnotations?.length > 0) {
    score += 10;
  }
  
  // Boost for high-confidence labels
  const highConfidenceLabels = visionResult.labelAnnotations?.filter(l => l.score > 0.8) || [];
  score += Math.min(highConfidenceLabels.length * 3, 15);
  
  // Check for blurriness indicators (low confidence across the board)
  const avgConfidence = visionResult.labelAnnotations?.reduce((acc, l) => acc + l.score, 0) / 
                       (visionResult.labelAnnotations?.length || 1);
  
  if (avgConfidence < 0.5) {
    score -= 20; // Likely blurry
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Enhance image using Gemini 2.5 Flash (accessing Nano Banana model)
 */
async function enhanceImageWithGemini(imageBuffer, visionAnalysis) {
  if (!imageGenerationModel) {
    return {
      success: false,
      error: 'Gemini 2.5 Flash not available',
      fallback: {
        enhanced: false,
        recommendations: [
          'Use bright, natural lighting',
          'Remove cluttered background',
          'Center the product in frame',
          'Take multiple angles'
        ]
      }
    };
  }
  
  try {
    console.log('✨ Enhancing image with Gemini 2.5 Flash (Nano Banana model)...');
    
    // Convert image to base64 for Gemini
    const base64Image = imageBuffer.toString('base64');
    const mimeType = 'image/jpeg'; // Assuming JPEG, could be detected
    
    // Craft-specific enhancement prompt for Nano Banana model
    const enhancementPrompt = `You are the Nano Banana image model specialized in product photography enhancement. Analyze this handmade craft product image and provide specific enhancement recommendations.

Image analysis context:
- Labels detected: ${visionAnalysis?.labels?.map(l => l.description).join(', ') || 'craft product'}
- Dominant colors: ${visionAnalysis?.colors?.map(c => c.rgb).join(', ') || 'natural tones'}
- Quality score: ${visionAnalysis?.quality || 75}/100

Provide a JSON response with:
{
  "productType": "pottery/textile/jewelry/woodwork/metalwork/etc",
  "currentQuality": {
    "lighting": "poor/fair/good/excellent",
    "background": "cluttered/plain/professional",
    "composition": "poor/fair/good/excellent",
    "focus": "blurry/soft/sharp/crisp"
  },
  "enhancementActions": [
    "specific action 1 (e.g., remove background clutter)",
    "specific action 2 (e.g., improve lighting contrast)"
  ],
  "technicalImprovements": {
    "backgroundRemoval": true/false,
    "lightingAdjustment": "none/subtle/moderate/significant",
    "colorCorrection": true/false,
    "sharpening": true/false
  },
  "marketplaceOptimization": {
    "suggestedAngles": ["front view", "detail shot", "usage context"],
    "additionalPhotos": "recommend 2-4 additional photos for complete listing"
  },
  "qualityScore": 85,
  "readyForMarketplace": true/false
}

Return only the JSON object.`;
    
    const request = {
      contents: [{
        role: 'user',
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Image
            }
          },
          { text: enhancementPrompt }
        ]
      }],
      generationConfig: {
        temperature: 0.2, // Lower for more consistent JSON
        maxOutputTokens: 1024
      }
    };
    
    const result = await imageGenerationModel.generateContent(request);
    
    let responseText = '';
    if (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      responseText = result.response.candidates[0].content.parts[0].text;
    } else {
      throw new Error('No valid response from Gemini');
    }
    
    // Parse JSON response
    let enhancement = null;
    try {
      // Clean up response text
      const cleanedResponse = responseText.replace(/```json\s*|\s*```/g, '').trim();
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}') + 1;
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonStr = cleanedResponse.substring(jsonStart, jsonEnd);
        enhancement = JSON.parse(jsonStr);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.log('⚠️ Gemini JSON parsing failed, creating fallback enhancement');
      enhancement = createFallbackEnhancement(visionAnalysis);
    }
    
    console.log('✅ Gemini image enhancement analysis completed');
    return { success: true, data: enhancement };
    
  } catch (error) {
    console.error('❌ Gemini image enhancement failed:', error.message);
    return {
      success: false,
      error: error.message,
      fallback: createFallbackEnhancement(visionAnalysis)
    };
  }
}

/**
 * Create fallback enhancement when AI fails
 */
function createFallbackEnhancement(visionAnalysis) {
  const productType = detectProductType(visionAnalysis?.labels || []);
  
  return {
    productType: productType,
    currentQuality: {
      lighting: 'fair',
      background: 'plain', 
      composition: 'good',
      focus: 'sharp'
    },
    enhancementActions: [
      'Optimize lighting for better product visibility',
      'Ensure clean, professional background',
      'Center product in frame for maximum impact'
    ],
    technicalImprovements: {
      backgroundRemoval: true,
      lightingAdjustment: 'moderate',
      colorCorrection: true,
      sharpening: false
    },
    marketplaceOptimization: {
      suggestedAngles: ['front view', 'detail shot', 'usage context'],
      additionalPhotos: 'Recommend 3-4 photos showing different angles and details'
    },
    qualityScore: visionAnalysis?.quality || 75,
    readyForMarketplace: (visionAnalysis?.quality || 75) >= 70,
    enhanced: false,
    fallback: true
  };
}

/**
 * Detect product type from Vision API labels
 */
function detectProductType(labels) {
  const labelTexts = labels.map(l => l.description?.toLowerCase() || '');
  
  if (labelTexts.some(l => ['pottery', 'ceramic', 'clay', 'bowl', 'vase', 'pot'].includes(l))) return 'pottery';
  if (labelTexts.some(l => ['textile', 'fabric', 'cloth', 'saree', 'silk', 'cotton'].includes(l))) return 'textile';
  if (labelTexts.some(l => ['jewelry', 'necklace', 'bracelet', 'earring', 'ring'].includes(l))) return 'jewelry';
  if (labelTexts.some(l => ['wood', 'wooden', 'furniture', 'carving'].includes(l))) return 'woodwork';
  if (labelTexts.some(l => ['metal', 'brass', 'copper', 'silver', 'bronze'].includes(l))) return 'metalwork';
  
  return 'craft';
}

/**
 * Upload image to Cloudinary with transformations
 */
async function uploadToCloudinary(imageBuffer, enhancements) {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return {
      success: false,
      error: 'Cloudinary not configured',
      fallback: {
        originalUrl: 'data:image/jpeg;base64,' + imageBuffer.toString('base64'),
        enhancedUrl: null
      }
    };
  }
  
  try {
    console.log('☁️ Uploading to Cloudinary with transformations...');
    
    // Build transformation chain based on enhancement recommendations
    const transformations = ['f_auto', 'q_auto'];
    
    if (enhancements?.technicalImprovements?.backgroundRemoval) {
      transformations.push('e_background_removal');
    }
    
    if (enhancements?.technicalImprovements?.lightingAdjustment === 'significant') {
      transformations.push('e_auto_brightness', 'e_auto_contrast');
    } else if (enhancements?.technicalImprovements?.lightingAdjustment === 'moderate') {
      transformations.push('e_auto_brightness:20');
    }
    
    if (enhancements?.technicalImprovements?.colorCorrection) {
      transformations.push('e_auto_color');
    }
    
    if (enhancements?.technicalImprovements?.sharpening) {
      transformations.push('e_unsharp_mask:100');
    }
    
    // Upload original
    const originalUpload = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${imageBuffer.toString('base64')}`,
      {
        folder: 'craftconnect/originals',
        resource_type: 'image',
        quality: 'auto',
        format: 'jpg'
      }
    );
    
    // Create enhanced version URL
    const enhancedUrl = cloudinary.url(originalUpload.public_id, {
      transformation: transformations,
      secure: true
    });
    
    console.log('✅ Image uploaded and enhanced URL generated');
    return {
      success: true,
      data: {
        originalUrl: originalUpload.secure_url,
        enhancedUrl: enhancedUrl,
        publicId: originalUpload.public_id,
        transformations: transformations
      }
    };
    
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error.message);
    return {
      success: false,
      error: error.message,
      fallback: {
        originalUrl: 'data:image/jpeg;base64,' + imageBuffer.toString('base64'),
        enhancedUrl: null
      }
    };
  }
}

/**
 * Main Smart Product Enhancer endpoint
 */
exports.enhanceProduct = async (req, res) => {
  try {
    console.log('\n✨ === SMART PRODUCT ENHANCER STARTED ===');
    
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        error: 'No image uploaded',
        message: 'Please upload an image for enhancement'
      });
    }
    
    console.log(`🖼️ Image received: ${req.file.originalname}, ${(req.file.size / 1024).toFixed(2)} KB`);
    
    // Step 1: Vision API Analysis
    console.log('\n🔍 === VISION API ANALYSIS ===');
    const visionResult = await analyzeImageWithVision(req.file.buffer);
    
    const visionData = visionResult.success ? visionResult.data : visionResult.fallback;
    console.log(`⚙️ Vision analysis - Quality: ${visionData.quality}/100`);
    
    // Step 2: Gemini Enhancement Analysis (Nano Banana model)
    console.log('\n✨ === GEMINI 2.5 FLASH (NANO BANANA) ANALYSIS ===');
    const geminiResult = await enhanceImageWithGemini(req.file.buffer, visionData);
    
    const enhancementData = geminiResult.success ? geminiResult.data : geminiResult.fallback;
    console.log(`🎨 Enhancement analysis - Product: ${enhancementData.productType}`);
    console.log(`📊 Marketplace ready: ${enhancementData.readyForMarketplace}`);
    
    // Step 3: Image Upload & Enhancement
    console.log('\n☁️ === IMAGE PROCESSING & UPLOAD ===');
    const uploadResult = await uploadToCloudinary(req.file.buffer, enhancementData);
    
    const imageUrls = uploadResult.success ? uploadResult.data : uploadResult.fallback;
    console.log(`🔗 Image URLs generated - Enhanced: ${!!imageUrls.enhancedUrl}`);
    
    // Compile final response
    const response = {
      success: true,
      processing: {
        vision: visionResult.success,
        gemini: geminiResult.success,
        cloudinary: uploadResult.success
      },
      analysis: {
        vision: visionData,
        enhancement: enhancementData
      },
      images: {
        original: imageUrls.originalUrl,
        enhanced: imageUrls.enhancedUrl,
        publicId: imageUrls.publicId
      },
      recommendations: {
        immediate: enhancementData.enhancementActions || [],
        technical: enhancementData.technicalImprovements || {},
        marketplace: enhancementData.marketplaceOptimization || {}
      },
      scores: {
        originalQuality: visionData.quality,
        enhancedQuality: enhancementData.qualityScore,
        marketplaceReadiness: enhancementData.readyForMarketplace
      },
      processingTime: new Date().toISOString()
    };
    
    console.log('✅ === SMART PRODUCT ENHANCER COMPLETED ===\n');
    res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Smart Product Enhancer error:', error);
    res.status(500).json({
      success: false,
      error: 'Enhancement processing failed',
      message: error.message,
      fallback: {
        recommendations: [
          'Use bright, natural lighting',
          'Remove background distractions',
          'Center product in frame'
        ]
      }
    });
  }
};

/**
 * Batch enhancement for multiple images
 */
exports.enhanceBatch = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No images uploaded'
      });
    }
    
    console.log(`📋 Processing batch of ${req.files.length} images`);
    
    const results = [];
    
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      console.log(`\n🖼️ Processing image ${i + 1}/${req.files.length}: ${file.originalname}`);
      
      try {
        // Vision analysis
        const visionResult = await analyzeImageWithVision(file.buffer);
        const visionData = visionResult.success ? visionResult.data : visionResult.fallback;
        
        // Gemini enhancement
        const geminiResult = await enhanceImageWithGemini(file.buffer, visionData);
        const enhancementData = geminiResult.success ? geminiResult.data : geminiResult.fallback;
        
        // Upload with enhancements
        const uploadResult = await uploadToCloudinary(file.buffer, enhancementData);
        const imageUrls = uploadResult.success ? uploadResult.data : uploadResult.fallback;
        
        results.push({
          index: i,
          filename: file.originalname,
          success: true,
          analysis: enhancementData,
          images: imageUrls,
          scores: {
            originalQuality: visionData.quality,
            enhancedQuality: enhancementData.qualityScore,
            marketplaceReadiness: enhancementData.readyForMarketplace
          }
        });
        
      } catch (fileError) {
        console.error(`❌ Failed to process ${file.originalname}:`, fileError.message);
        results.push({
          index: i,
          filename: file.originalname,
          success: false,
          error: fileError.message
        });
      }
    }
    
    const successful = results.filter(r => r.success).length;
    console.log(`✅ Batch processing completed: ${successful}/${req.files.length} successful`);
    
    res.status(200).json({
      success: true,
      batchSize: req.files.length,
      results: results,
      summary: {
        successful: successful,
        failed: results.length - successful,
        averageQuality: successful > 0 ? 
          results.filter(r => r.success).reduce((acc, r) => acc + r.scores.enhancedQuality, 0) / successful : 0
      }
    });
    
  } catch (error) {
    console.error('❌ Batch enhancement error:', error);
    res.status(500).json({
      success: false,
      error: 'Batch enhancement failed',
      message: error.message
    });
  }
};

/**
 * Get enhancement service status
 */
exports.getEnhancerStatus = (req, res) => {
  const status = {
    available: true,
    services: {
      gemini: {
        available: !!imageGenerationModel,
        model: 'gemini-2.5-flash',
        nanoBanana: !!imageGenerationModel,
        features: ['image_analysis', 'enhancement_recommendations', 'quality_scoring']
      },
      vision: {
        available: !!visionClient,
        features: ['label_detection', 'color_analysis', 'object_localization', 'quality_assessment']
      },
      cloudinary: {
        available: !!process.env.CLOUDINARY_CLOUD_NAME,
        features: ['image_upload', 'background_removal', 'auto_enhancement', 'format_optimization']
      }
    },
    capabilities: {
      qualityAnalysis: true,
      backgroundRemoval: !!process.env.CLOUDINARY_CLOUD_NAME,
      lightingEnhancement: true,
      colorCorrection: !!process.env.CLOUDINARY_CLOUD_NAME,
      batchProcessing: true
    },
    limits: {
      maxFileSize: '10MB',
      supportedFormats: ['jpeg', 'png', 'webp'],
      batchSize: 10
    },
    timestamp: new Date().toISOString()
  };
  
  res.status(200).json(status);
};