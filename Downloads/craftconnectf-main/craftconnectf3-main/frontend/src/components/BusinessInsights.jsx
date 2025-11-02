import React from "react";
import { useNavigate } from "react-router-dom";

const BusinessInsights = ({ analysisData, onSolutionSelected }) => {
  const navigate = useNavigate();

  if (!analysisData) {
    return (
      <div className="business-insights">
        <div className="container">
          <h1>No analysis data available</h1>
          <p>Please record your audio first.</p>
        </div>
      </div>
    );
  }

  const { transcription, analysis, confidence, fallback } = analysisData;

  // Create solution cards based on AI analysis (no hardcoding!)
  const createSolutionCards = () => {
    const baseRecommendations = {
      whatsapp: {
        id: "whatsapp",
        title: "WhatsApp Business Setup",
        subtitle: "Direct Customer Connection",
        description:
          "Create professional customer conversations instantly. Build trust through direct messaging and support your craft business growth.",
        icon: "💬",
        features: [
          "Instant customer support",
          "Professional messaging",
          "Order management",
          "Business catalog",
        ],
        readyTime: "15 mins",
        difficulty: "Easy",
        recommended: false, // Will be set based on AI analysis
      },
      instagram: {
        id: "instagram",
        title: "Social Media Presence",
        subtitle: "Visual Brand Storytelling",
        description:
          "Launch hyper-focused campaigns to attract customers who love your unique style. Create compelling visual content that sells.",
        icon: "📸",
        features: [
          "Social media posts",
          "Brand storytelling",
          "Visual campaigns",
          "Hashtag optimization",
        ],
        readyTime: "30 mins",
        difficulty: "Medium",
        recommended: false,
      },
      website: {
        id: "website",
        title: "Digital Store Creation",
        subtitle: "Complete Online Presence",
        description:
          "Create a stunning online storefront to showcase your craft. Guide customers through seamless order processing.",
        icon: "🏪",
        features: [
          "Online storefront",
          "Product catalog",
          "Order processing",
          "Payment integration",
        ],
        readyTime: "60 mins",
        difficulty: "Advanced",
        recommended: false,
      },
    };

    // Determine recommendations based on AI analysis
    let primarySolution = "whatsapp"; // Default fallback
    let secondarySolution = "instagram";

    if (analysis) {
      // Use AI recommendation if available
      if (analysis.recommendedSolution) {
        primarySolution = analysis.recommendedSolution;
      }

      // Determine secondary solution based on business type
      if (analysis.businessType) {
        const businessType = analysis.businessType.toLowerCase();
        if (
          businessType.includes("jewelry") ||
          businessType.includes("pottery")
        ) {
          secondarySolution = "website"; // High-value items need professional presence
        } else if (
          businessType.includes("textile") ||
          businessType.includes("craft")
        ) {
          secondarySolution = "instagram"; // Visual items perform well on social
        }
      }
    }

    // Set recommendations
    baseRecommendations[primarySolution].recommended = true;

    // Return all three solutions with the primary one marked as recommended
    return [
      baseRecommendations[primarySolution],
      baseRecommendations[secondarySolution],
      baseRecommendations[
        Object.keys(baseRecommendations).find(
          (key) => key !== primarySolution && key !== secondarySolution
        )
      ],
    ];
  };

  const solutionCards = createSolutionCards();

  const handleSolutionClick = (solution) => {
    console.log("Solution clicked:", solution.id);

    if (solution.id === "whatsapp") {
      onSolutionSelected("whatsapp");
      navigate("/whatsapp");
    } else {
      alert(
        `${solution.title} is coming soon! We're focusing on WhatsApp first to get you immediate results.`
      );
    }
  };

  const getBusinessTypeEmoji = (businessType) => {
    if (!businessType) return "🎨";
    const type = businessType.toLowerCase();
    if (type.includes("pottery")) return "🏺";
    if (type.includes("jewelry")) return "💎";
    if (type.includes("textile")) return "🧵";
    if (type.includes("wood")) return "🪵";
    return "🎨";
  };

  return (
    <div className="business-insights">
      <div className="container">
        {/* Hero Section */}
        <div className="hero-section">
          <span className="eyebrow">AI ANALYSIS COMPLETE</span>
          <h1 className="hero-title">Your Personalized Business Toolkit</h1>
          <p className="hero-subtitle">
            Based on our AI analysis of your audio, here are the best solutions
            to grow your craft business.
          </p>
        </div>

        {/* Analysis Summary */}
        <div className="analysis-card">
          <div className="analysis-header">
            <h3 className="analysis-title">
              {getBusinessTypeEmoji(analysis?.businessType)} What we understood
              about your business:
            </h3>
            {fallback && (
              <span className="fallback-badge">⚠️ Fallback Analysis</span>
            )}
          </div>

          <div className="transcription-section">
            <p className="transcription-text">"{transcription}"</p>
          </div>

          {analysis && (
            <div className="analysis-details">
              <div className="analysis-grid">
                <div className="analysis-item">
                  <span className="analysis-label">Business Type:</span>
                  <span className="analysis-value">
                    {analysis.businessType || "Traditional Craft"}
                  </span>
                </div>
                <div className="analysis-item">
                  <span className="analysis-label">Business Stage:</span>
                  <span className="analysis-value">
                    {analysis.businessStage || "Growing"}
                  </span>
                </div>
                <div className="analysis-item">
                  <span className="analysis-label">AI Confidence:</span>
                  <span className="analysis-value">
                    {Math.round((confidence || 0.8) * 100)}%
                  </span>
                </div>
              </div>

              {analysis.topProblems && analysis.topProblems.length > 0 && (
                <div className="problems-section">
                  <h4>🎯 Key Challenges Identified:</h4>
                  <ul className="problems-list">
                    {analysis.topProblems.slice(0, 3).map((problem, index) => (
                      <li key={index} className="problem-item">
                        <span className="problem-text">
                          {problem.problem || problem}
                        </span>
                        {problem.severity && (
                          <span
                            className={`severity-badge ${problem.severity.toLowerCase()}`}
                          >
                            {problem.severity}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Solution Cards */}
        <div className="solutions-section">
          <h2 className="section-title">Recommended Solutions</h2>
          <p className="section-subtitle">
            Based on AI analysis of your audio, here's your personalized roadmap
            to digital success
          </p>

          <div className="solutions-grid">
            {solutionCards.map((solution, index) => (
              <div
                key={solution.id}
                className={`solution-card ${
                  solution.recommended ? "recommended" : ""
                } ${index % 2 === 1 ? "reverse" : ""}`}
                onClick={() => handleSolutionClick(solution)}
              >
                <div className="card-content">
                  <div className="card-header">
                    {solution.recommended && (
                      <div className="recommended-badge">
                        ⭐ AI Recommended for You
                      </div>
                    )}
                    <span className="card-label">
                      {solution.recommended ? "Best Match" : "Coming Soon"}
                    </span>
                    <h2 className="card-title">{solution.title}</h2>
                    <h3 className="card-subtitle">{solution.subtitle}</h3>
                  </div>

                  <p className="card-description">{solution.description}</p>

                  <div className="card-meta">
                    <span className="meta-item">
                      <span className="meta-icon">⏱️</span>
                      {solution.readyTime}
                    </span>
                    <span className="meta-item">
                      <span className="meta-icon">📊</span>
                      {solution.difficulty}
                    </span>
                  </div>

                  <div className="features-list">
                    {solution.features.map((feature, idx) => (
                      <div key={idx} className="feature">
                        <span className="feature-icon">✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    className={`action-button ${
                      solution.recommended ? "primary" : "secondary"
                    }`}
                  >
                    {solution.recommended ? "Get Started Now" : "Coming Soon"}
                    <span className="button-icon">→</span>
                  </button>
                </div>

                <div className="card-illustration">
                  <div className="illustration-container">
                    <span className="main-icon">{solution.icon}</span>
                    <div className="decorative-elements">
                      <div className="plant1">🌿</div>
                      <div className="plant2">🌱</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Explanation */}
        <div className="ai-explanation">
          <div className="ai-card">
            <div className="ai-icon">🤖</div>
            <div className="ai-content">
              <h3>Why This Recommendation?</h3>
              <p>
                Our AI analyzed your audio and detected that you would benefit
                most from
                <strong>
                  {" "}
                  {solutionCards.find((s) => s.recommended)?.title}
                </strong>{" "}
                because it's:
                <strong>
                  {" "}
                  immediate, personal, and requires zero technical expertise.
                </strong>
                {analysis?.reasoning && (
                  <>
                    <br />
                    <br />
                    <strong>AI Reasoning:</strong> {analysis.reasoning}
                  </>
                )}
              </p>

              {fallback && (
                <div className="fallback-note">
                  <small>
                    <strong>Note:</strong> This analysis used fallback logic due
                    to API limitations. The recommendation is based on general
                    craft business patterns.
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Debug Information (only in development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="debug-section">
            <details>
              <summary>Debug: Analysis Data</summary>
              <pre>{JSON.stringify(analysisData, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessInsights;
