// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost';

export const config = {
  apiBaseUrl: API_BASE_URL,
  authServiceUrl: `${API_BASE_URL}/auth`,
  emotionServiceUrl: `${API_BASE_URL}/emotions`,
  reportServiceUrl: `${API_BASE_URL}/reports`,
};
