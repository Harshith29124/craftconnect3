const axios = require('axios');
const { VertexAI } = require('@google-cloud/vertexai');
const FormData = require('form-data');

// Facebook Graph API configuration
const FACEBOOK_API_URL = 'https://graph.facebook.com/v18.0';

// Initialize Vertex AI for content generation
let vertexAI = null;
let contentModel = null;

try {
  if (process.env.GOOGLE_PROJECT_ID) {
    vertexAI = new VertexAI({
      project: process.env.GOOGLE_PROJECT_ID,
      location: process.env.GOOGLE_LOCATION || 'us-central1',
    });
    
    contentModel = vertexAI.getGenerativeModel({
      model: process.env.VERTEX_MODEL || 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.6,
        topP: 0.9,
        maxOutputTokens: 800,
      },
    });
  }
} catch (error) {
  console.error('❌ Facebook controller - Vertex AI initialization failed:', error.message);
}

/**
 * Generate Facebook post caption using AI
 */
async function generateFacebookCaption(businessData, productData, postType = 'product') {
  if (contentModel) {
    const prompt = `Create an engaging Facebook post caption for this craft business:

Business: ${businessData.businessType || 'Craft Business'}
Products: ${businessData.detectedFocus || 'Handmade products'}
Product Name: ${productData.name || 'Featured Product'}
Price: ₹${productData.price || 'Contact for pricing'}
Description: ${productData.description || 'Authentic handmade craft'}

Post Type: ${postType}

Create a caption that:
- Starts with engaging hook (question/emotion/story)
- Highlights the craft's authenticity and quality
- Uses 2-3 relevant emojis (not overwhelming)
- Includes product benefits naturally
- Mentions price if provided
- Ends with strong call-to-action
- Uses 2-3 hashtags relevant to craft/local business
- Stays under 200 words for best engagement
- Feels authentic, not overly promotional

Return only the caption text with hashtags.`;
    
    try {
      const result = await contentModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      
      if (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return result.response.candidates[0].content.parts[0].text.trim();
      }
    } catch (error) {
      console.log('AI caption generation failed, using template:', error.message);
    }
  }
  
  // Fallback template
  const priceText = productData.price ? ` for just ₹${productData.price}` : ' - DM for pricing';
  
  return `🎨 Every piece tells a story...

✋ Made with traditional techniques and modern quality standards, our ${productData.name || 'handmade creations'} bring authentic ${businessData.businessType?.toLowerCase() || 'craftsmanship'} to your home.

✨ What makes it special:
• Handcrafted with love and precision
• ${businessData.detectedFocus || 'Traditional materials and methods'}
• Each piece is unique
• Supporting local artisan community

🛍 Available now${priceText}

📲 Comment 'INTERESTED' or DM us to order!

#HandmadeCrafts #${(businessData.businessType || 'Craft').replace(/\s+/g, '')} #LocalArtisan #AuthenticCrafts`;
}

/**
 * Create Facebook post with image
 */
exports.createFacebookPost = async (req, res) => {
  try {
    console.log('\n📱 === FACEBOOK POST CREATION ===');
    
    const { businessData, productData, imageUrl, caption: customCaption } = req.body;
    
    if (!businessData || !productData) {
      return res.status(400).json({
        success: false,
        error: 'Business and product data required'
      });
    }
    
    console.log(`🎨 Creating Facebook post for: ${productData.name}`);
    
    // Generate or use provided caption
    const caption = customCaption || await generateFacebookCaption(businessData, productData, 'product');
    console.log(`📝 Caption generated (${caption.length} chars)`);
    
    // Check if Facebook API is configured
    const hasFacebookConfig = process.env.FACEBOOK_ACCESS_TOKEN && process.env.FACEBOOK_PAGE_ID;
    
    if (!hasFacebookConfig) {
      console.log('📱 Facebook API not configured, returning preview');
      
      return res.status(200).json({
        success: true,
        mode: 'preview',
        post: {
          caption: caption,
          imageUrl: imageUrl,
          businessName: businessData.businessType,
          productName: productData.name
        },
        instructions: 'Copy this caption and image to post manually on Facebook',
        actions: {
          copyCaption: true,
          downloadImage: !!imageUrl,
          manualPost: true
        },
        note: 'To enable automatic posting, configure FACEBOOK_ACCESS_TOKEN and FACEBOOK_PAGE_ID'
      });
    }
    
    // Production mode - post via Facebook Graph API
    console.log('📤 Posting to Facebook via Graph API...');
    
    let postPayload = {
      message: caption,
      access_token: process.env.FACEBOOK_ACCESS_TOKEN
    };
    
    // If image URL provided, upload it first
    let photoId = null;
    if (imageUrl) {
      try {
        console.log('🖼️ Uploading image to Facebook...');
        
        const photoResponse = await axios.post(
          `${FACEBOOK_API_URL}/${process.env.FACEBOOK_PAGE_ID}/photos`,
          {
            url: imageUrl,
            caption: caption,
            published: false, // Upload but don't publish yet
            access_token: process.env.FACEBOOK_ACCESS_TOKEN
          },
          { timeout: 30000 }
        );
        
        photoId = photoResponse.data.id;
        console.log(`✅ Image uploaded to Facebook: ${photoId}`);
        
        // Update payload to use uploaded photo
        postPayload = {
          attached_media: [{ media_fbid: photoId }],
          message: caption,
          access_token: process.env.FACEBOOK_ACCESS_TOKEN
        };
        
      } catch (imageError) {
        console.log('⚠️ Image upload failed, posting text only:', imageError.message);
      }
    }
    
    // Create the post
    const postResponse = await axios.post(
      `${FACEBOOK_API_URL}/${process.env.FACEBOOK_PAGE_ID}/feed`,
      postPayload,
      { timeout: 20000 }
    );
    
    const postId = postResponse.data.id;
    console.log(`✅ Facebook post created: ${postId}`);
    
    res.status(200).json({
      success: true,
      mode: 'production',
      post: {
        id: postId,
        caption: caption,
        imageUrl: imageUrl,
        photoId: photoId,
        url: `https://facebook.com/${postId}`
      },
      postedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Facebook post creation error:', error);
    
    // Provide fallback information for manual posting
    const fallbackCaption = req.body.caption || await generateFacebookCaption(
      req.body.businessData || {}, 
      req.body.productData || {}
    );
    
    res.status(200).json({
      success: false,
      mode: 'fallback',
      error: 'Facebook API error',
      post: {
        caption: fallbackCaption,
        imageUrl: req.body.imageUrl,
        businessName: req.body.businessData?.businessType
      },
      fallbackInstructions: 'Please copy this caption and post manually on Facebook',
      apiError: error.response?.data || error.message
    });
  }
};

/**
 * Preview Facebook post without posting
 */
exports.previewFacebookPost = async (req, res) => {
  try {
    const { businessData, productData, imageUrl } = req.body;
    
    if (!businessData || !productData) {
      return res.status(400).json({
        success: false,
        error: 'Business and product data required for preview'
      });
    }
    
    console.log('👀 Generating Facebook post preview');
    
    const caption = await generateFacebookCaption(businessData, productData, 'product');
    
    const preview = {
      caption: caption,
      imageUrl: imageUrl,
      businessName: businessData.businessType,
      productName: productData.name,
      hashtags: extractHashtags(caption),
      estimatedReach: calculateEstimatedReach(caption, !!imageUrl),
      engagementTips: [
        'Post during peak hours (7-9 PM)',
        'Respond quickly to comments',
        'Share customer testimonials',
        'Use Instagram stories for behind-the-scenes content'
      ]
    };
    
    res.status(200).json({
      success: true,
      mode: 'preview',
      preview: preview,
      actions: {
        copyCaption: true,
        postToFacebook: !!process.env.FACEBOOK_ACCESS_TOKEN && !!process.env.FACEBOOK_PAGE_ID,
        schedulePost: false // Could be implemented later
      }
    });
    
  } catch (error) {
    console.error('❌ Facebook preview error:', error);
    res.status(500).json({
      success: false,
      error: 'Preview generation failed',
      message: error.message
    });
  }
};

/**
 * Extract hashtags from caption text
 */
function extractHashtags(caption) {
  const hashtags = caption.match(/#\w+/g) || [];
  return hashtags.map(tag => tag.toLowerCase());
}

/**
 * Calculate estimated reach (simplified algorithm)
 */
function calculateEstimatedReach(caption, hasImage) {
  let baseReach = 50;
  
  // Boost for image
  if (hasImage) baseReach += 25;
  
  // Boost for hashtags
  const hashtags = extractHashtags(caption);
  baseReach += Math.min(hashtags.length * 5, 20);
  
  // Boost for engagement elements
  if (caption.toLowerCase().includes('comment')) baseReach += 10;
  if (caption.toLowerCase().includes('share')) baseReach += 10;
  if (caption.toLowerCase().includes('dm')) baseReach += 15;
  
  return {
    estimated: baseReach,
    factors: {
      hasImage: hasImage,
      hashtagCount: hashtags.length,
      hasCallToAction: caption.toLowerCase().includes('comment') || caption.toLowerCase().includes('dm')
    }
  };
}

/**
 * Get Facebook page insights (if available)
 */
exports.getPageInsights = async (req, res) => {
  try {
    if (!process.env.FACEBOOK_ACCESS_TOKEN || !process.env.FACEBOOK_PAGE_ID) {
      return res.status(200).json({
        success: false,
        mode: 'demo',
        message: 'Facebook API not configured',
        demoInsights: {
          followers: 'Configure API to see real data',
          engagement: 'Configure API to see real data',
          reach: 'Configure API to see real data'
        }
      });
    }
    
    console.log('📈 Fetching Facebook page insights...');
    
    const response = await axios.get(
      `${FACEBOOK_API_URL}/${process.env.FACEBOOK_PAGE_ID}`,
      {
        params: {
          fields: 'name,followers_count,fan_count,talking_about_count',
          access_token: process.env.FACEBOOK_ACCESS_TOKEN
        }
      }
    );
    
    res.status(200).json({
      success: true,
      mode: 'production',
      insights: {
        pageName: response.data.name,
        followers: response.data.followers_count || response.data.fan_count || 0,
        engagement: response.data.talking_about_count || 0,
        lastUpdated: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Facebook insights error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch page insights',
      message: error.response?.data?.error?.message || error.message
    });
  }
};

/**
 * Get Facebook service status
 */
exports.getFacebookStatus = (req, res) => {
  const hasToken = !!process.env.FACEBOOK_ACCESS_TOKEN;
  const hasPageId = !!process.env.FACEBOOK_PAGE_ID;
  
  const status = {
    available: true,
    mode: hasToken && hasPageId ? 'production' : 'demo',
    services: {
      graphAPI: {
        available: hasToken && hasPageId,
        version: 'v18.0',
        features: ['post_creation', 'image_upload', 'page_insights']
      },
      contentGeneration: {
        available: !!contentModel,
        model: 'gemini-1.5-flash',
        features: ['caption_generation', 'hashtag_optimization', 'engagement_optimization']
      }
    },
    configuration: {
      hasAccessToken: hasToken,
      hasPageId: hasPageId,
      apiUrl: FACEBOOK_API_URL
    },
    capabilities: {
      previewPost: true,
      createPost: hasToken && hasPageId,
      uploadImage: hasToken && hasPageId,
      pageInsights: hasToken && hasPageId,
      captionGeneration: !!contentModel
    },
    limits: {
      maxImageSize: '10MB',
      supportedFormats: ['jpeg', 'png', 'gif'],
      dailyPostLimit: 25
    },
    timestamp: new Date().toISOString()
  };
  
  res.status(200).json(status);
};

/**
 * Schedule Facebook post (future feature)
 */
exports.scheduleFacebookPost = async (req, res) => {
  try {
    const { businessData, productData, imageUrl, scheduledTime } = req.body;
    
    if (!businessData || !productData || !scheduledTime) {
      return res.status(400).json({
        success: false,
        error: 'Business data, product data, and scheduled time required'
      });
    }
    
    // For now, return a placeholder response
    // In production, would integrate with Facebook's scheduled posts API
    res.status(200).json({
      success: true,
      mode: 'scheduled',
      scheduledPost: {
        id: `scheduled_${Date.now()}`,
        scheduledFor: scheduledTime,
        businessName: businessData.businessType,
        productName: productData.name,
        status: 'scheduled'
      },
      message: 'Post scheduling feature coming soon - use preview and manual posting for now'
    });
    
  } catch (error) {
    console.error('❌ Facebook scheduling error:', error);
    res.status(500).json({
      success: false,
      error: 'Post scheduling failed',
      message: error.message
    });
  }
};

/**
 * Generate multiple Facebook post variations
 */
exports.generatePostVariations = async (req, res) => {
  try {
    const { businessData, productData, count = 3 } = req.body;
    
    if (!businessData || !productData) {
      return res.status(400).json({
        success: false,
        error: 'Business and product data required'
      });
    }
    
    if (count > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 variations per request'
      });
    }
    
    console.log(`🔄 Generating ${count} Facebook post variations`);
    
    const variations = [];
    const postTypes = ['product', 'story', 'benefit', 'community', 'process'];
    
    for (let i = 0; i < count; i++) {
      const postType = postTypes[i % postTypes.length];
      const caption = await generateFacebookCaption(businessData, productData, postType);
      
      variations.push({
        id: i + 1,
        type: postType,
        caption: caption,
        hashtags: extractHashtags(caption),
        estimatedReach: calculateEstimatedReach(caption, !!req.body.imageUrl),
        tone: getContentTone(caption)
      });
    }
    
    res.status(200).json({
      success: true,
      variations: variations,
      businessContext: {
        businessType: businessData.businessType,
        productName: productData.name
      },
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Facebook variations error:', error);
    res.status(500).json({
      success: false,
      error: 'Post variations generation failed',
      message: error.message
    });
  }
};

/**
 * Determine content tone
 */
function getContentTone(caption) {
  const text = caption.toLowerCase();
  
  if (text.includes('story') || text.includes('tradition') || text.includes('heritage')) {
    return 'storytelling';
  }
  if (text.includes('quality') || text.includes('authentic') || text.includes('premium')) {
    return 'quality-focused';
  }
  if (text.includes('community') || text.includes('support') || text.includes('local')) {
    return 'community-oriented';
  }
  if (text.includes('available') || text.includes('order') || text.includes('buy')) {
    return 'sales-focused';
  }
  
  return 'balanced';
}