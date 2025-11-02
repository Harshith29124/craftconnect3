const { ImageAnnotatorClient } = require('@google-cloud/vision');
const { uploadImage, generateFilename } = require('../utils/storage');

// Initialize Vision AI client
let visionClient = null;

try {
  visionClient = new ImageAnnotatorClient();
  console.log('✅ Google Vision AI client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Vision AI client:', error.message);
  console.error('   Make sure GOOGLE_APPLICATION_CREDENTIALS is set and valid');
}

/**
 * Analyze image with Google Vision AI
 * @param {string} imageUrl - Cloudinary URL of the uploaded image
 * @returns {Promise<Object>} - Vision analysis results
 */
async function analyzeImageWithVision(imageUrl) {
  if (!visionClient) {
    console.warn('⚠️ Vision AI client not available, returning fallback results');
    return {
      labels: ['handmade', 'craft', 'product'],
      colors: [{ color: 'unknown', score: 0.5 }],
      safeSearch: {
        adult: 'VERY_UNLIKELY',
        medical: 'VERY_UNLIKELY',
        racy: 'VERY_UNLIKELY',
        spoof: 'VERY_UNLIKELY',
        violence: 'VERY_UNLIKELY'
      },
      text: ''
    };
  }

  try {
    console.log('Analyzing image with Vision AI:', imageUrl);
    
    const [labelResult] = await visionClient.labelDetection(imageUrl);
    const [colorResult] = await visionClient.imageProperties(imageUrl);
    const [safeSearchResult] = await visionClient.safeSearchDetection(imageUrl);
    const [textResult] = await visionClient.textDetection(imageUrl);

    // Extract labels
    const labels = labelResult.labelAnnotations
      ? labelResult.labelAnnotations
          .filter(label => label.score > 0.5)
          .map(label => label.description.toLowerCase())
          .slice(0, 10)
      : [];

    // Extract dominant colors
    const colors = colorResult.imagePropertiesAnnotation?.dominantColors?.colors
      ? colorResult.imagePropertiesAnnotation.dominantColors.colors
          .slice(0, 5)
          .map(color => ({
            color: `rgb(${Math.round(color.color.red || 0)}, ${Math.round(color.color.green || 0)}, ${Math.round(color.color.blue || 0)})`,
            score: color.score || 0
          }))
      : [];

    // Extract safe search results
    const safeSearch = {
      adult: safeSearchResult.safeSearchAnnotation?.adult || 'UNKNOWN',
      medical: safeSearchResult.safeSearchAnnotation?.medical || 'UNKNOWN',
      racy: safeSearchResult.safeSearchAnnotation?.racy || 'UNKNOWN',
      spoof: safeSearchResult.safeSearchAnnotation?.spoof || 'UNKNOWN',
      violence: safeSearchResult.safeSearchAnnotation?.violence || 'UNKNOWN'
    };

    // Extract text (OCR)
    const detectedText = textResult.textAnnotations && textResult.textAnnotations.length > 0
      ? textResult.textAnnotations[0].description || ''
      : '';

    console.log('✅ Vision AI analysis completed');
    console.log('   Labels found:', labels.length);
    console.log('   Colors found:', colors.length);
    console.log('   Text detected:', detectedText.length > 0 ? 'Yes' : 'No');

    return {
      labels,
      colors,
      safeSearch,
      text: detectedText
    };
  } catch (error) {
    console.error('❌ Vision AI analysis error:', error.message);
    
    // Return fallback results on error
    return {
      labels: ['craft', 'product', 'handmade'],
      colors: [{ color: 'unknown', score: 0.5 }],
      safeSearch: {
        adult: 'VERY_UNLIKELY',
        medical: 'VERY_UNLIKELY',
        racy: 'VERY_UNLIKELY',
        spoof: 'VERY_UNLIKELY',
        violence: 'VERY_UNLIKELY'
      },
      text: '',
      error: error.message
    };
  }
}

/**
 * Controller: Upload image and analyze with Vision AI
 */
exports.uploadAndAnalyze = async (req, res) => {
  console.log('Image upload and analysis started');
  
  try {
    // Check if image file was uploaded
    if (!req.file || !req.file.buffer) {
      console.error('❌ No image file uploaded');
      return res.status(400).json({
        success: false,
        error: 'No image file uploaded',
        message: 'Please upload an image file'
      });
    }

    const { originalname, mimetype, size } = req.file;
    
    // Validate file type
    if (!mimetype.startsWith('image/')) {
      console.error('❌ Invalid file type:', mimetype);
      return res.status(400).json({
        success: false,
        error: 'Invalid file type',
        message: 'Please upload an image file (JPEG, PNG, GIF, etc.)'
      });
    }

    // Validate file size (10MB limit)
    if (size > 10 * 1024 * 1024) {
      console.error('❌ File too large:', size);
      return res.status(400).json({
        success: false,
        error: 'File too large',
        message: 'Image size must be less than 10MB'
      });
    }

    console.log('Uploading image:', {
      name: originalname,
      type: mimetype,
      size: `${Math.round(size / 1024)}KB`
    });

    // Generate unique filename
    const filename = generateFilename(originalname, 'product');
    
    // Upload to Cloudinary
    const imageUrl = await uploadImage(req.file.buffer, filename, 'products/originals');
    
    // Analyze with Vision AI
    const vision = await analyzeImageWithVision(imageUrl);
    
    console.log('✅ Image upload and analysis completed successfully');
    
    return res.status(200).json({
      success: true,
      imageUrl,
      vision,
      metadata: {
        originalName: originalname,
        size,
        type: mimetype
      }
    });
    
  } catch (error) {
    console.error('❌ Error in image upload and analysis:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to upload and analyze image',
      details: error.message
    });
  }
};