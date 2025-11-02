import React, { useState } from "react";

const WhatsAppModule = ({ analysisData }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [polishedMessage, setPolishedMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const generateMessage = async () => {
    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append("transcription", analysisData.transcription);
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const response = await fetch("/api/generate-whatsapp-message", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setPolishedMessage(result.polishedMessage);
      }
    } catch (error) {
      console.error("Error generating message:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(polishedMessage);
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  return (
    <div className="whatsapp-module">
      <div className="container">
        <div className="hero-section">
          <span className="eyebrow">WHATSAPP BUSINESS SETUP</span>
          <h1 className="hero-title">Professional Customer Connection</h1>
          <p className="hero-subtitle">
            Create compelling business messages that build trust and drive sales
            through WhatsApp.
          </p>
        </div>

        <div className="upload-section">
          <h3>📸 Add Product Image (Optional)</h3>
          <p>Upload a product photo to create more compelling messaging</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{
              margin: "1rem 0",
              padding: "1rem",
              border: "2px dashed #ec6d13",
              borderRadius: "8px",
              width: "100%",
            }}
          />
          {selectedImage && (
            <p style={{ color: "#10b981", fontWeight: "600" }}>
              ✅ Image selected: {selectedImage.name}
            </p>
          )}
        </div>

        <div className="generate-section">
          <button
            onClick={generateMessage}
            disabled={isGenerating}
            style={{
              padding: "1rem 2rem",
              margin: "1rem 0",
              fontSize: "1.1rem",
              backgroundColor: isGenerating ? "#ccc" : "#25D366",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: isGenerating ? "not-allowed" : "pointer",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {isGenerating
              ? "🤖 AI is crafting your message..."
              : "✨ Generate Professional Message"}
          </button>
        </div>

        {polishedMessage && (
          <div
            className="message-preview"
            style={{
              marginTop: "2rem",
              padding: "2rem",
              backgroundColor: "#f8f9fa",
              borderRadius: "12px",
              border: "1px solid #e9ecef",
            }}
          >
            <h3 style={{ marginBottom: "1rem", color: "#ec6d13" }}>
              📱 Your Professional WhatsApp Message:
            </h3>
            <div
              style={{
                backgroundColor: "white",
                padding: "1.5rem",
                borderRadius: "8px",
                border: "1px solid #ddd",
                marginBottom: "1rem",
              }}
            >
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "inherit",
                  fontSize: "0.95rem",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                {polishedMessage}
              </pre>
            </div>

            <button
              onClick={openWhatsApp}
              style={{
                padding: "1rem 2rem",
                backgroundColor: "#25D366",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              💬 Open WhatsApp Business
            </button>

            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                backgroundColor: "#fef3e9",
                borderRadius: "8px",
              }}
            >
              <h4 style={{ color: "#ec6d13", marginBottom: "0.5rem" }}>
                💡 Pro Tips for WhatsApp Business:
              </h4>
              <ul
                style={{ margin: 0, paddingLeft: "1.5rem", fontSize: "0.9rem" }}
              >
                <li>Set up a business profile with your craft details</li>
                <li>Use WhatsApp Business catalog for product showcase</li>
                <li>Create quick replies for common customer questions</li>
                <li>Set up automated greetings for new customers</li>
                <li>Add your business location for local customers</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppModule;
