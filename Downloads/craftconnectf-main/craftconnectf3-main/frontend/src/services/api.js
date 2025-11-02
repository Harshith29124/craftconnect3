import axios from "axios";

// Enhanced API configuration with better error handling
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

console.log('API URL configured:', API_URL);

const apiClient = axios.create({
  baseURL: API_URL.replace(/\/$/, "") + "/api",
  timeout: 60000, // Increased timeout for AI processing
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('Request config:', {
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    // Provide user-friendly error messages
    if (!error.response) {
      error.userMessage = 'Network error - please check your connection';
    } else if (error.response.status >= 500) {
      error.userMessage = 'Server error - please try again later';
    } else if (error.response.status === 404) {
      error.userMessage = 'Service not found - please contact support';
    } else {
      error.userMessage = error.response?.data?.message || 'Request failed';
    }
    
    return Promise.reject(error);
  }
);

// Health check function
export const checkBackendHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: error.userMessage || error.message,
      status: error.response?.status || 0
    };
  }
};

// Enhanced API functions with better error handling

export const analyzeBusinessOverview = async (audioBlob, options = {}) => {
  try {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    
    console.log('Sending business overview analysis request...');
    const response = await apiClient.post("/business/analyze-overview", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      ...options,
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('analyzeBusinessOverview error:', error);
    return {
      success: false,
      error: error.userMessage || error.message,
      details: error.response?.data
    };
  }
};

export const validateBusinessSummary = async (payload) => {
  try {
    const response = await apiClient.post("/business/validate-summary", payload);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.userMessage || error.message,
      details: error.response?.data
    };
  }
};

export const analyzeComprehensive = async (sessionId, audioBlob, images = []) => {
  try {
    const formData = new FormData();
    formData.append("sessionId", sessionId);
    if (audioBlob) formData.append("audio", audioBlob, "product.webm");
    images.forEach((file, index) => {
      formData.append("images", file, `image_${index}.${file.type.split('/')[1]}`);
    });
    
    const response = await apiClient.post("/products/analyze-comprehensive", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.userMessage || error.message,
      details: error.response?.data
    };
  }
};

export const getSession = async (sessionId) => {
  try {
    const response = await apiClient.get(`/session/${sessionId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.userMessage || error.message
    };
  }
};

export const updateSession = async (sessionId, updates) => {
  try {
    const response = await apiClient.post(`/session/${sessionId}/update`, updates);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.userMessage || error.message
    };
  }
};

export const generateRecommendations = async (sessionId) => {
  try {
    const response = await apiClient.post("/recommendations/generate", { sessionId });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.userMessage || error.message
    };
  }
};

export const analyzeBusinessAudio = async (audioBlob, options = {}) => {
  try {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    
    console.log('Sending audio for business analysis...');
    const response = await apiClient.post("/analyze-business", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      ...options,
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('analyzeBusinessAudio error:', error);
    return {
      success: false,
      error: error.userMessage || error.message,
      details: error.response?.data
    };
  }
};

export const generateWhatsAppMessage = async (data) => {
  try {
    const response = await apiClient.post("/generate-whatsapp-message", data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.userMessage || error.message,
      details: error.response?.data
    };
  }
};

// Test connection function
export const testConnection = async () => {
  try {
    const response = await apiClient.get('/test');
    return {
      success: true,
      message: 'Backend connection successful',
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: 'Backend connection failed',
      error: error.userMessage || error.message,
      details: {
        baseURL: apiClient.defaults.baseURL,
        status: error.response?.status,
        statusText: error.response?.statusText
      }
    };
  }
};

export default apiClient;