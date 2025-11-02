const mongoose = require("mongoose");

const businessAnalysisSchema = new mongoose.Schema(
  {
    transcription: {
      type: String,
      required: true,
    },
    businessType: {
      type: String,
      required: true,
    },
    businessStage: String,
    topProblems: [
      {
        problem: String,
        severity: String,
      },
    ],
    topPlans: [
      {
        plan: String,
        priority: String,
      },
    ],
    recommendedSolution: {
      type: String,
      enum: ["whatsapp", "instagram", "website"],
      default: "whatsapp",
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.8,
    },
    fallback: {
      type: Boolean,
      default: false,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BusinessAnalysis", businessAnalysisSchema);
