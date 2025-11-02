const cloudinary = require('cloudinary').v2;
const axios = require('axios');

// Configure Cloudinary
let isConfigured = false;

function configureCloudinary() {
  if (isConfigured) return;
  
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('❌ Cloudinary configuration missing. Please set:');
    console.error('   CLOUDINARY_CLOUD_NAME');
    console.error('   CLOUDINARY_API_KEY');
    console.error('   CLOUDINARY_API_SECRET');
    throw new Error('Cloudinary configuration incomplete');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });

  isConfigured = true;
  console.log('✅ Cloudinary configured successfully');
}

/**
 * Upload image buffer to Cloudinary
 * @param {Buffer} buffer - Image buffer from multer
 * @param {string} filename - Filename for the upload
 * @param {string} folder - Cloudinary folder (default: 'products')
 * @returns {Promise<string>} - Cloudinary secure URL
 */
async function uploadImage(buffer, filename, folder = 'products') {
  configureCloudinary();
  
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        public_id: `${folder}/${filename}`,
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
          { width: 1024, height: 1024, crop: 'limit' }
        ],
        overwrite: true
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('✅ Image uploaded to Cloudinary:', result.secure_url);
          resolve(result.secure_url);
        }
      }
    );
    
    uploadStream.end(buffer);
  });
}

/**
 * Upload base64 image to Cloudinary (for AI-generated images)
 * @param {string} base64Data - Base64 image data (with or without data URL prefix)
 * @param {string} filename - Filename for the upload
 * @param {string} folder - Cloudinary folder (default: 'enhanced')
 * @returns {Promise<string>} - Cloudinary secure URL
 */
async function uploadBase64Image(base64Data, filename, folder = 'enhanced') {
  configureCloudinary();
  
  try {
    // Ensure the base64 has the proper data URL format
    let dataUrl = base64Data;
    if (!dataUrl.startsWith('data:image/')) {
      dataUrl = `data:image/jpeg;base64,${base64Data}`;
    }
    
    const result = await cloudinary.uploader.upload(dataUrl, {
      resource_type: 'image',
      public_id: `${folder}/${filename}`,
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ],
      overwrite: true
    });
    
    console.log('✅ Base64 image uploaded to Cloudinary:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary base64 upload error:', error);
    throw error;
  }
}

/**
 * Download image from URL and return as buffer
 * @param {string} imageUrl - URL of the image to download
 * @returns {Promise<Buffer>} - Image buffer
 */
async function downloadImageAsBuffer(imageUrl) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 10000 // 10 second timeout
    });
    
    return Buffer.from(response.data);
  } catch (error) {
    console.error('❌ Error downloading image:', error.message);
    throw new Error(`Failed to download image: ${error.message}`);
  }
}

/**
 * Convert image URL to base64 for AI processing
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<string>} - Base64 encoded image
 */
async function imageUrlToBase64(imageUrl) {
  try {
    const buffer = await downloadImageAsBuffer(imageUrl);
    return buffer.toString('base64');
  } catch (error) {
    console.error('❌ Error converting image to base64:', error.message);
    throw error;
  }
}

/**
 * Generate a unique filename with timestamp
 * @param {string} originalName - Original filename
 * @param {string} prefix - Prefix for the filename
 * @returns {string} - Unique filename
 */
function generateFilename(originalName, prefix = 'img') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName ? originalName.split('.').pop() : 'jpg';
  return `${prefix}_${timestamp}_${random}.${extension}`;
}

module.exports = {
  uploadImage,
  uploadBase64Image,
  downloadImageAsBuffer,
  imageUrlToBase64,
  generateFilename
};