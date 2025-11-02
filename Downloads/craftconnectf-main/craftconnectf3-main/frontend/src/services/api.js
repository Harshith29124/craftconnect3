import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const apiClient = axios.create({
  baseURL: API_URL.replace(/\/$/, "") + "/api",
  timeout: 30000,
});

export const analyzeBusinessOverview = (audioBlob, options = {}) => {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");
  return apiClient.post("/business/analyze-overview", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    ...options,
  });
};

export const validateBusinessSummary = (payload) => {
  return apiClient.post("/business/validate-summary", payload);
};

export const analyzeComprehensive = (sessionId, audioBlob, images = []) => {
  const formData = new FormData();
  formData.append("sessionId", sessionId);
  if (audioBlob) formData.append("audio", audioBlob, "product.webm");
  images.forEach((file) => formData.append("images", file));
  return apiClient.post("/products/analyze-comprehensive", formData);
};

export const getSession = (sessionId) => apiClient.get(`/session/${sessionId}`);
export const updateSession = (sessionId, updates) => apiClient.post(`/session/${sessionId}/update`, updates);
export const generateRecommendations = (sessionId) => apiClient.post("/recommendations/generate", { sessionId });

export const analyzeBusinessAudio = (audioBlob, options = {}) => {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");
  return apiClient.post("/analyze-business", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    ...options,
  });
};

export const generateWhatsAppMessage = (data) => apiClient.post("/generate-whatsapp-message", data);
