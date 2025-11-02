import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeBusinessAudio } from "../services/api";

const ProcessingPage = ({ onProcessingComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [status, setStatus] = useState("Preparing audio...");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);

  const navigate = useNavigate();
  const MAX_RETRIES = 2;

  useEffect(() => {
    processAudio();
  }, []);

  const processAudio = async () => {
    try {
      const audioData = sessionStorage.getItem("recordedAudio");
      const mimeType = sessionStorage.getItem("audioMimeType");
      const duration = sessionStorage.getItem("recordingDuration");

      if (!audioData) {
        throw new Error("No audio data found. Please record audio first.");
      }

      console.log("Processing audio - Duration:", duration, "Type:", mimeType);

      // Step 1: Prepare audio data
      setCurrentStep(1);
      setStatus("🎵 Preparing audio for Google Cloud APIs...");
      setProgress(10);

      // Convert base64 to blob
      const response = await fetch(audioData);
      const audioBlob = await response.blob();

      console.log("Audio blob created - Size:", audioBlob.size, "bytes");

      // Estimate cost
      const durationSeconds = parseInt(duration) || 15;
      const speechCost = Math.ceil(durationSeconds / 15) * 0.006; // $0.006 per 15 seconds
      const aiCost = 0.000125; // Approximate for 1K tokens
      setEstimatedCost(speechCost + aiCost);

      // Create FormData for API call
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      setProgress(20);

      // Step 2: Call the real backend API (using your aiBusinessAnalyzer.js)
      setCurrentStep(2);
      setStatus("🗣️ Converting speech to text with Google Cloud Speech API...");
      setProgress(30);

      console.log("Calling /api/analyze-business endpoint...");

      const analysisResponse = await analyzeBusinessAudio(audioBlob, {
        timeout: 300000, // 5 minute timeout for full processing
        onUploadProgress: (progressEvent) => {
          const uploadProgress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(Math.min(40, 30 + uploadProgress * 0.1));
        },
      });

      console.log("API Response received:", analysisResponse.data);

      if (!analysisResponse.data.success) {
        throw new Error(analysisResponse.data.error || "API call failed");
      }

      // Step 3: Processing AI response
      setCurrentStep(3);
      setStatus("🤖 Analyzing your business with Vertex AI (Gemini)...");
      setProgress(70);

      // Simulate processing time for better UX
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 4: Complete processing
      setCurrentStep(4);
      setStatus(
        "✅ Analysis complete! Generating personalized recommendations..."
      );
      setProgress(100);

      const processedData = {
        transcription: analysisResponse.data.transcript,
        analysis: analysisResponse.data.analysis,
        confidence: analysisResponse.data.confidence || 0.85,
        processedAt: new Date().toISOString(),
        estimatedCost: estimatedCost,
        apiVersion: "vertex-ai-gemini",
        fallback: analysisResponse.data.fallback || false,
      };

      console.log("Processing complete:", processedData);

      // Wait a moment to show completion
      setTimeout(() => {
        onProcessingComplete(processedData);
        navigate("/insights", { state: processedData });
      }, 1500);
    } catch (error) {
      console.error("Processing error:", error);

      let errorMessage = "Processing failed";
      let canRetry = false;

      if (
        error.code === "ECONNREFUSED" ||
        error.message.includes("Network Error")
      ) {
        errorMessage =
          "Backend server is not running. Please start the Node.js backend.";
      } else if (error.response?.status === 429) {
        errorMessage = "Rate limit exceeded. Please wait a moment.";
        canRetry = true;
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error. Please try again.";
        canRetry = true;
      } else if (error.message.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
        canRetry = true;
      } else {
        errorMessage =
          error.response?.data?.error ||
          error.message ||
          "Unknown error occurred";
      }

      setError(errorMessage);
      setStatus("❌ Processing failed");

      // Auto-retry logic
      if (canRetry && retryCount < MAX_RETRIES) {
        const delay = (retryCount + 1) * 3000; // 3s, 6s delays
        setError(`${errorMessage} Retrying in ${delay / 1000} seconds...`);

        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          setError("");
          setProgress(0);
          setCurrentStep(1);
          processAudio();
        }, delay);
      } else {
        // Final failure - go back to home after 5 seconds
        setTimeout(() => {
          sessionStorage.removeItem("recordedAudio");
          navigate("/");
        }, 5000);
      }
    }
  };

  const steps = [
    {
      number: 1,
      title: "Preparing Audio",
      icon: "🎵",
      description: "Optimizing audio for Google Cloud APIs",
    },
    {
      number: 2,
      title: "Speech Recognition",
      icon: "🗣️",
      description: "Converting speech to text using Google Cloud Speech API",
    },
    {
      number: 3,
      title: "AI Business Analysis",
      icon: "🤖",
      description: "Analyzing business insights with Vertex AI (Gemini)",
    },
    {
      number: 4,
      title: "Generating Insights",
      icon: "✨",
      description: "Creating personalized recommendations",
    },
  ];

  return (
    <div className="processing-page">
      <div className="container">
        <div className="processing-content">
          <div className="processing-header">
            <h1>🤖 AI Processing Your Audio</h1>
            <p>Using real Google Cloud APIs to analyze your business</p>
            <div className="cost-estimate">
              <small>💰 Estimated cost: ${estimatedCost.toFixed(4)}</small>
            </div>
          </div>

          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="progress-text">{progress}%</span>
          </div>

          <div className="status-text">
            {status}
            {retryCount > 0 && (
              <small className="retry-info">
                <br />
                Retry attempt {retryCount}/{MAX_RETRIES}
              </small>
            )}
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <div className="error-content">
                <strong>Error:</strong> {error}
                {error.includes("Backend server is not running") && (
                  <div className="error-help">
                    <p>
                      <strong>To fix this:</strong>
                    </p>
                    <ol>
                      <li>
                        Navigate to the backend folder:{" "}
                        <code>cd craftconnect-backend</code>
                      </li>
                      <li>
                        Install dependencies: <code>npm install</code>
                      </li>
                      <li>
                        Set up your .env file with Google Cloud credentials
                      </li>
                      <li>
                        Start the server: <code>npm run dev</code>
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="steps-container">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`step ${
                  currentStep >= step.number ? "active" : ""
                } ${currentStep > step.number ? "completed" : ""}`}
              >
                <div className="step-icon">{step.icon}</div>
                <div className="step-content">
                  <div className="step-number">Step {step.number}</div>
                  <div className="step-title">{step.title}</div>
                  <div className="step-description">{step.description}</div>
                </div>
                {currentStep > step.number && (
                  <div className="step-check">✅</div>
                )}
              </div>
            ))}
          </div>

          <div className="api-info">
            <div className="api-badges">
              <span className="api-badge">🔊 Google Cloud Speech-to-Text</span>
              <span className="api-badge">🤖 Vertex AI (Gemini 2.5 Flash)</span>
              <span className="api-badge">🔒 Real-time Processing</span>
            </div>
            <p className="api-text">
              This is real AI processing - not a simulation! Your audio is being
              analyzed by actual Google Cloud services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingPage;
