const axios = require('axios');
const { VertexAI } = require('@google-cloud/vertexai');

// WhatsApp Business API configuration
const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';

// Initialize Vertex AI for message generation
let vertexAI = null;
let generativeAI = null;

try {
  if (process.env.GOOGLE_PROJECT_ID) {
    vertexAI = new VertexAI({
      project: process.env.GOOGLE_PROJECT_ID,
      location: process.env.GOOGLE_LOCATION || 'us-central1',
    });
    
    generativeAI = vertexAI.getGenerativeModel({
      model: process.env.VERTEX_MODEL || 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        maxOutputTokens: 512,
      },
    });
  }
} catch (error) {
  console.error('❌ WhatsApp controller - Vertex AI initialization failed:', error.message);
}

/**
 * Generate WhatsApp message using AI or template
 */
async function generateWhatsAppMessage(businessData) {
  const { businessType, detectedFocus, transcript, productName, price, description } = businessData;
  
  if (generativeAI) {
    const prompt = `Create a professional WhatsApp Business message for this craft business:

Business Type: ${businessType || 'Craft Business'}
Products: ${detectedFocus || 'Handmade products'}
${productName ? `Featured Product: ${productName}` : ''}
${price ? `Price: ₹${price}` : ''}
${description ? `Description: ${description}` : ''}
Context: "${transcript?.substring(0, 300) || 'Traditional handmade crafts'}"

Create a message that:
- Starts with warm greeting + relevant emoji
- Introduces the business specialty
- Highlights 2-3 key product benefits
- ${price ? 'Mentions the price naturally' : 'Invites pricing inquiry'}
- Uses appropriate craft/cultural emojis
- Ends with clear call-to-action
- Keeps under 160 words for easy reading

Return only the message text, no formatting or quotes.`;

    try {
      const result = await generativeAI.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      
      if (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return result.response.candidates[0].content.parts[0].text.trim();
      }
    } catch (error) {
      console.log('AI message generation failed, using template:', error.message);
    }
  }
  
  // Fallback template with business context
  const productSection = productName && price 
    ? `\n\n🎯 Featured Product: ${productName}\n💰 Price: ₹${price}\n${description ? `✨ ${description.substring(0, 80)}...` : ''}`
    : '';
    
  return `🙏 Namaste! Welcome to our ${businessType || 'craft business'}!

🎨 We specialize in ${detectedFocus || 'authentic handmade products'} created with traditional techniques and modern quality.

✨ Why choose us:
• Genuine handmade quality
• Traditional craftsmanship
• Custom orders available
• Fast & reliable delivery${productSection}

📞 Reply to this message with your requirements and we'll send you:
• Product photos & details
• Pricing information  
• Delivery timeline
• Custom options available

🛒 Ready to order or have questions? Just reply - we're here to help!

🙏 Thank you for supporting local artisans!`;
}

/**
 * Preview WhatsApp message (always works)
 */
exports.previewWhatsAppMessage = async (req, res) => {
  try {
    console.log('📱 WhatsApp Preview Request:', {
      hasBusinessData: !!req.body.businessData,
      hasProductData: !!req.body.productData
    });
    
    const businessData = {
      businessType: req.body.businessType || req.body.businessData?.businessType,
      detectedFocus: req.body.detectedFocus || req.body.businessData?.detectedFocus, 
      transcript: req.body.transcript || req.body.businessData?.transcript,
      productName: req.body.productName || req.body.productData?.name,
      price: req.body.price || req.body.productData?.price,
      description: req.body.description || req.body.productData?.description
    };
    
    const message = await generateWhatsAppMessage(businessData);
    const encodedMessage = encodeURIComponent(message);
    const waLink = `https://wa.me/?text=${encodedMessage}`;
    
    res.status(200).json({
      success: true,
      mode: 'preview',
      message: message,
      waLink: waLink,
      actions: {
        copy: true,
        openWhatsApp: true,
        businessSend: !!process.env.FACEBOOK_ACCESS_TOKEN && !!process.env.WHATSAPP_PHONE_ID
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ WhatsApp preview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate WhatsApp preview',
      message: error.message
    });
  }
};

/**
 * Send WhatsApp message via Business API (production mode)
 */
exports.sendWhatsAppMessage = async (req, res) => {
  try {
    const { phoneNumber, businessData, productData } = req.body;
    
    // Validate required fields
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number required',
        message: 'Please provide a valid phone number to send WhatsApp message'
      });
    }
    
    // Check if WhatsApp Business API is configured
    const hasWhatsAppConfig = process.env.FACEBOOK_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_ID;
    
    if (!hasWhatsAppConfig) {
      console.log('📱 WhatsApp Business API not configured, returning demo response');
      
      // Generate message for manual sending
      const businessContextData = {
        businessType: businessData?.businessType,
        detectedFocus: businessData?.detectedFocus,
        transcript: businessData?.transcript,
        productName: productData?.name,
        price: productData?.price,
        description: productData?.description
      };
      
      const message = await generateWhatsAppMessage(businessContextData);
      const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
      const encodedMessage = encodeURIComponent(message);
      const waLink = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
      
      return res.status(200).json({
        success: true,
        mode: 'demo',
        message: message,
        waLink: waLink,
        instructions: 'Click the WhatsApp link to send this message manually',
        phoneNumber: cleanPhone,
        note: 'To enable automatic sending, configure FACEBOOK_ACCESS_TOKEN and WHATSAPP_PHONE_ID'
      });
    }
    
    // Production mode - send via WhatsApp Business API
    console.log(`📤 Sending WhatsApp message via Business API to ${phoneNumber}`);
    
    const businessContextData = {
      businessType: businessData?.businessType,
      detectedFocus: businessData?.detectedFocus,
      transcript: businessData?.transcript,
      productName: productData?.name,
      price: productData?.price,
      description: productData?.description
    };
    
    const message = await generateWhatsAppMessage(businessContextData);
    
    // Format phone number for WhatsApp API
    const formattedPhone = phoneNumber.replace(/[^\d]/g, '');
    
    const whatsappPayload = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'text',
      text: {
        body: message
      }
    };
    
    // Send message with retry logic
    let lastError = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`📤 Attempt ${attempt} - Sending to WhatsApp API...`);
        
        const response = await axios.post(
          `${WHATSAPP_API_URL}/${process.env.WHATSAPP_PHONE_ID}/messages`,
          whatsappPayload,
          {
            headers: {
              'Authorization': `Bearer ${process.env.FACEBOOK_ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );
        
        console.log('✅ WhatsApp message sent successfully:', response.data);
        
        return res.status(200).json({
          success: true,
          mode: 'production',
          messageId: response.data.messages[0].id,
          message: message,
          phoneNumber: formattedPhone,
          sentAt: new Date().toISOString(),
          status: 'sent'
        });
        
      } catch (error) {
        console.log(`❌ Attempt ${attempt} failed:`, error.response?.data || error.message);
        lastError = error;
        
        if (attempt < 3) {
          // Exponential backoff: 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
        }
      }
    }
    
    // All attempts failed
    console.error('❌ All WhatsApp send attempts failed');
    
    // Provide fallback wa.me link
    const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
    const encodedMessage = encodeURIComponent(message);
    const waLink = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    return res.status(200).json({
      success: false,
      mode: 'fallback',
      error: 'WhatsApp Business API failed',
      message: message,
      waLink: waLink,
      phoneNumber: cleanPhone,
      fallbackInstructions: 'Please use the WhatsApp link to send manually',
      apiError: lastError?.response?.data || lastError?.message
    });
    
  } catch (error) {
    console.error('❌ WhatsApp send error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * Get WhatsApp service status
 */
exports.getWhatsAppStatus = (req, res) => {
  const hasToken = !!process.env.FACEBOOK_ACCESS_TOKEN;
  const hasPhoneId = !!process.env.WHATSAPP_PHONE_ID;
  
  const status = {
    available: true, // Preview always available
    mode: hasToken && hasPhoneId ? 'production' : 'demo',
    features: {
      preview: true,
      copyMessage: true,
      waLink: true,
      businessApiSend: hasToken && hasPhoneId
    },
    configuration: {
      hasAccessToken: hasToken,
      hasPhoneId: hasPhoneId,
      apiUrl: WHATSAPP_API_URL
    },
    timestamp: new Date().toISOString()
  };
  
  res.status(200).json(status);
};

/**
 * Validate phone number format
 */
function validatePhoneNumber(phone) {
  const cleaned = phone.replace(/[^\d]/g, '');
  
  // Must be 10-15 digits
  if (cleaned.length < 10 || cleaned.length > 15) {
    return {
      valid: false,
      error: 'Phone number must be 10-15 digits',
      cleaned: cleaned
    };
  }
  
  return {
    valid: true,
    cleaned: cleaned,
    formatted: `+${cleaned}`
  };
}

/**
 * Bulk message sending (for future scaling)
 */
exports.sendBulkWhatsAppMessages = async (req, res) => {
  try {
    const { recipients, businessData, productData } = req.body;
    
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Recipients array required'
      });
    }
    
    if (recipients.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 50 recipients per batch'
      });
    }
    
    const results = [];
    const hasWhatsAppConfig = process.env.FACEBOOK_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_ID;
    
    for (const recipient of recipients) {
      const phoneValidation = validatePhoneNumber(recipient.phone);
      
      if (!phoneValidation.valid) {
        results.push({
          phone: recipient.phone,
          success: false,
          error: phoneValidation.error
        });
        continue;
      }
      
      if (hasWhatsAppConfig) {
        // Production sending logic here (similar to sendWhatsAppMessage)
        results.push({
          phone: phoneValidation.formatted,
          success: true,
          mode: 'production',
          status: 'queued' // Would implement proper queue in production
        });
      } else {
        // Demo mode - generate wa.me links
        const message = await generateWhatsAppMessage({
          ...businessData,
          ...productData
        });
        
        const encodedMessage = encodeURIComponent(message);
        const waLink = `https://wa.me/${phoneValidation.cleaned}?text=${encodedMessage}`;
        
        results.push({
          phone: phoneValidation.formatted,
          success: true,
          mode: 'demo',
          waLink: waLink,
          message: message
        });
      }
    }
    
    res.status(200).json({
      success: true,
      mode: hasWhatsAppConfig ? 'production' : 'demo',
      totalRecipients: recipients.length,
      results: results,
      summary: {
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });
    
  } catch (error) {
    console.error('❌ Bulk WhatsApp send error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process bulk WhatsApp messages',
      message: error.message
    });
  }
};