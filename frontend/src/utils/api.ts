import axios from 'axios';
import { API_BASE_URL } from '../config/config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Add request/response interceptors for better error handling
api.interceptors.request.use(
  (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const chatAPI = {
  sendMessage: async (prompt: string) => {
    try {
      const response = await api.post('/chat/', { prompt });
      return response.data;
    } catch (error: any) {
      throw new Error(`Chat API Error: ${error.response?.data?.detail || error.message}`);
    }
  },
  
  getConversations: async (date: string) => {
    try {
      const response = await api.get(`/conversations/?date=${date}`);
      return response.data;
    } catch (error: any) {
      console.warn(`No conversations found for ${date}`);
      return { date, conversations: [] };
    }
  },
};

export const journalAPI = {
  saveEntry: async (title: string, entry: string) => {
    try {
      const response = await api.post('/journal/', { title, entry });
      return response.data;
    } catch (error: any) {
      throw new Error(`Journal Save Error: ${error.response?.data?.detail || error.message}`);
    }
  },
  
  getEntries: async (date: string) => {
    try {
      const response = await api.get(`/journal/?date=${date}`);
      return response.data;
    } catch (error: any) {
      console.warn(`No journal entries found for ${date}`);
      return { date, journals: [] };
    }
  },
};

export const healthAPI = {
  checkHealth: async () => {
    try {
      const response = await api.get('/receive_hello/');
      return response.data;
    } catch (error: any) {
      throw new Error(`Health Check Error: ${error.response?.data?.detail || error.message}`);
    }
  },
  
  checkLLMStatus: async () => {
    try {
      const response = await api.get('/llm-status/');
      return response.data;
    } catch (error: any) {
      console.warn('LLM Status check failed:', error);
      return null;
    }
  },
};

export default api;
