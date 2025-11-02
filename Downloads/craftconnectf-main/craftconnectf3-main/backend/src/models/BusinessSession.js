const mongoose = require('mongoose');

const BusinessSessionSchema = new mongoose.Schema({
  // Step 1: Business Overview
  transcript: { type: String, required: true },
  businessSummary: {
    businessType: String,
    businessName: String,
    experience: String,
    location: String,
    mainChallenges: [String],
    currentStatus: String,
    goals: [String],
    hasOnlinePresence: { type: mongoose.Schema.Types.Mixed },
    targetMarket: String,
    keyStrengths: [String]
  },
  businessSummaryApproved: { type: Boolean, default: false },

  // Step 2: Product Analysis
  productTranscript: { type: String },
  imageAnalyses: [{
    imageIndex: Number,
    labels: [{ description: String, score: Number }],
    objects: [{ name: String, score: Number }],
    text: String,
    colors: [{ red: Number, green: Number, blue: Number, score: Number }],
    error: String,
    details: String
  }],
  productAnalysis: {
    marketingInsights: {
      targetAudience: { type: [String], default: [] },
      pricingRange: String,
      sellingPoints: { type: [String], default: [] },
      competitiveAdvantage: { type: [String], default: [] },
      seasonality: String
    },
    productSummary: {
      name: String, category: String, materials: [String], techniques: [String],
      uniqueFeatures: [String], qualityLevel: String, timeToMake: String, difficulty: String
    },
    visualAnalysis: {
      overallAppearance: String, colorScheme: [String], craftsmanship: String,
      marketAppeal: String, photographyQuality: String, improvementSuggestions: [String]
    },
    digitalMarketingStrategy: {
      instagramHashtags: [String], keywordFocus: [String], contentAngles: [String],
      platformSuitability: { instagram: String, facebook: String, whatsapp: String, website: String }
    },
    recommendations: { immediate: [String], shortTerm: [String], longTerm: [String] }
  },
  productApproved: { type: Boolean, default: false },
  productFeedback: String,

  // Step 3: Final Recommendations
  finalRecommendations: {
    primaryRecommendations: [{ platform: String, priority: Number, reason: String, implementation: String, expectedOutcome: String }],
    contentStrategy: { focusAreas: [String], contentTypes: [String], postingFrequency: String },
    marketingMessages: { whatsapp: String, instagram: String, general: String },
    nextSteps: [String]
  },

  // Flow Management
  step: {
    type: String,
    enum: ['business_overview_complete','ready_for_product_analysis','product_analysis_complete','ready_for_recommendations','complete','product_needs_revision'],
    default: 'business_overview_complete'
  },

  // Session Management
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, default: Date.now },

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  // Optional user identification
  userIdentifier: String,

  // Analytics
  completionRate: { type: Number, default: 0 },
  timeSpent: { type: Number, default: 0 }
});

// Indexes
BusinessSessionSchema.index({ createdAt: 1 });
BusinessSessionSchema.index({ step: 1 });
BusinessSessionSchema.index({ isActive: 1 });
BusinessSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Coercions and computed fields
BusinessSessionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  const bs = this.businessSummary || {};
  if (bs && typeof bs.hasOnlinePresence !== 'boolean') {
    const v = String(bs.hasOnlinePresence || '').toLowerCase();
    if (['true','yes','y','1'].includes(v)) this.businessSummary.hasOnlinePresence = true;
    else if (['false','no','n','0'].includes(v)) this.businessSummary.hasOnlinePresence = false;
    else this.businessSummary.hasOnlinePresence = false;
  }
  const weights = { 'business_overview_complete':25,'ready_for_product_analysis':35,'product_analysis_complete':70,'ready_for_recommendations':85,'complete':100,'product_needs_revision':60 };
  this.completionRate = weights[this.step] || 0;
  next();
});

module.exports = mongoose.model('BusinessSession', BusinessSessionSchema);
