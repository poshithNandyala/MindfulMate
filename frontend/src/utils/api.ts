import axios from 'axios';
import { API_BASE_URL } from '../config/config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout (faster feedback)
});

// Add request/response interceptors with retry logic
api.interceptors.request.use(
  (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    // Add timestamp to prevent caching issues
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() };
    }
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with retry logic
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // Retry logic for connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.response?.status >= 500) {
      config.__retryCount = config.__retryCount || 0;
      
      if (config.__retryCount < 3) {
        config.__retryCount++;
        console.log(`🔄 Retrying request (${config.__retryCount}/3): ${config.url}`);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        return api(config);
      }
    }
    
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const chatAPI = {
  sendMessage: async (prompt: string) => {
    try {
      console.log('Sending message to backend...');
      
      // Direct API call without authentication for now
      const response = await fetch('http://localhost:8000/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Got response:', data);
      return data;
      
    } catch (error: any) {
      console.error('Chat error:', error);
      
      // Return a direct response instead of throwing error
      return {
        response: "I'm here to help you. Let me know what's on your mind and I'll do my best to support you."
      };
    }
  },
  
  getConversations: async (date: string) => {
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('mindfulmate_session');
      const headers: any = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await api.get(`/conversations/?date=${date}`, { headers });
      return response.data;
    } catch (error: any) {
      console.warn(`No conversations found for ${date}`);
      return { date, conversations: [] };
    }
  },
};

export const journalAPI = {
  saveEntry: async (title: string, entry: string, username: string) => {
    try {
      console.log('🚀 Saving journal entry:', { title: title.slice(0, 20) + '...', username });
      const response = await api.post('/journal/', { title, entry, username });
      console.log('✅ Journal save response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Journal save failed:', error.response?.data || error.message);
      
      // Return a user-friendly error
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to save journal';
      throw new Error(`Journal Save Error: ${errorMessage}`);
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

  getUserJournals: async (username: string) => {
    try {
      const response = await api.get(`/journal/user/${username}`);
      return response.data;
    } catch (error: any) {
      console.warn(`No journal entries found for user ${username}`);
      return { username, journals: [], count: 0 };
    }
  },
};

export const authAPI = {
  register: async (username: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register/', { username, email, password });
      return response.data;
    } catch (error: any) {
      throw new Error(`Registration Error: ${error.response?.data?.detail || error.message}`);
    }
  },
  
  login: async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login/', { username, password });
      return response.data;
    } catch (error: any) {
      throw new Error(`Login Error: ${error.response?.data?.detail || error.message}`);
    }
  },
  
  logout: async (sessionToken: string) => {
    try {
      const response = await api.post('/auth/logout/', {}, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Logout Error: ${error.response?.data?.detail || error.message}`);
    }
  },
  
  getCurrentUser: async (sessionToken: string) => {
    try {
      const response = await api.get('/auth/me/', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Get User Error: ${error.response?.data?.detail || error.message}`);
    }
  },
};

export const moodAPI = {
  sendMoodMessage: async (prompt: string, mood: string) => {
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('mindfulmate_session');
      const headers: any = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await api.post('/chat/mood/', { prompt, mood }, { headers });
      return response.data;
    } catch (error: any) {
      throw new Error(`Mood Chat Error: ${error.response?.data?.detail || error.message}`);
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
