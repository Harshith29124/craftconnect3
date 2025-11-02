const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  currentStep: {
    type: String,
    enum: ['voice_recording', 'image_upload', 'ai_processing', 'review', 'channels'],
    default: 'voice_recording'
  },
  tempData: {
    transcript: String,
    analysis: mongoose.Schema.Types.Mixed,
    originalImageUrl: String,
    visionResults: mongoose.Schema.Types.Mixed,
    currentProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // set 24h in future
  }
}, { timestamps: true });

// Indexes (single TTL index only)
SessionSchema.index({ userId: 1 });
SessionSchema.index({ sessionId: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // expire at the stored date

module.exports = mongoose.model('Session', SessionSchema);
