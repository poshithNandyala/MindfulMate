/**
 * Health check utility for backend connection
 */

import { API_BASE_URL } from '../config/config';

export interface HealthStatus {
  isOnline: boolean;
  latency: number;
  error?: string;
}

export const checkBackendHealth = async (): Promise<HealthStatus> => {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${API_BASE_URL}/llm-status/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    
    if (response.ok) {
      console.log(`✅ Backend healthy - ${latency}ms`);
      return { isOnline: true, latency };
    } else {
      console.warn(`⚠️ Backend responded with status: ${response.status}`);
      return { 
        isOnline: false, 
        latency, 
        error: `Server responded with status ${response.status}` 
      };
    }
  } catch (error: any) {
    const latency = Date.now() - startTime;
    console.error('❌ Backend health check failed:', error.message);
    
    return { 
      isOnline: false, 
      latency, 
      error: error.name === 'AbortError' ? 'Connection timeout' : error.message 
    };
  }
};

export const waitForBackend = async (maxRetries: number = 10, delay: number = 2000): Promise<boolean> => {
  for (let i = 0; i < maxRetries; i++) {
    const health = await checkBackendHealth();
    if (health.isOnline) {
      return true;
    }
    
    console.log(`⏳ Waiting for backend... (${i + 1}/${maxRetries})`);
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return false;
};
