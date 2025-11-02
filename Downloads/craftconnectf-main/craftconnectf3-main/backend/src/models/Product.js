const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow guest usage
  },
  sessionId: {
    type: String, // For guest users
    required: false
  },

  // Source data
  transcript: {
    type: String,
    required: true
  },
  originalImageUrl: {
    type: String,
    required: true
  },

  // AI Analysis results
  vision: {
    labels: [String],
    colors: [{
      color: String,
      score: Number
    }],
    safeSearch: {
      adult: String,
      medical: String,
      racy: String,
      spoof: String,
      violence: String
    },
    text: String // OCR if any
  },

  // AI-generated product info
  ai: {
    productName: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    bulletPoints: [String],
    priceSuggestion: {
      type: Number,
      required: true
    },
    tags: [String],
    category: String
  },

  // Enhanced media
  enhancedImageUrl: {
    type: String,
    required: true
  },

  // Workflow status
  status: {
    type: String,
    enum: ['draft', 'processing', 'ready_for_approval', 'approved', 'published'],
    default: 'draft'
  },
  approved: {
    type: Boolean,
    default: false
  },
  approvedAt: {
    type: Date,
    default: null
  },

  // Publishing history
  channels: {
    whatsapp: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      messageId: String,
      recipients: [String] // phone numbers
    },
    instagram: {
      posted: {
        type: Boolean,
        default: false
      },
      postedAt: Date,
      igMediaId: String,
      igPostId: String
    },
    shopify: {
      synced: {
        type: Boolean,
        default: false
      },
      syncedAt: Date,
      shopifyProductId: String,
      shopifyVariantId: String
    }
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for performance
ProductSchema.index({ userId: 1, createdAt: -1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ approved: 1 });
ProductSchema.index({ sessionId: 1 });

module.exports = mongoose.model('Product', ProductSchema);