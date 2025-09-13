/**
 * Connection test utilities for frontend
 */

import { journalAPI, authAPI } from './api';

export const testBackendConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🔍 Testing backend connection...');
    
    // Test 1: Try to register a test user
    const testUsername = `test_${Date.now()}`;
    const registrationResult = await authAPI.register(testUsername, 'test@example.com', 'password123');
    
    if (registrationResult.success) {
      console.log('✅ Registration test passed');
      
      // Test 2: Try to save a journal
      const journalResult = await journalAPI.saveEntry(
        'Connection Test',
        'Testing if the connection and journal saving works properly.',
        testUsername
      );
      
      if (journalResult.success !== false) {
        console.log('✅ Journal save test passed');
        
        // Test 3: Try to retrieve journals
        const retrievalResult = await journalAPI.getUserJournals(testUsername);
        
        if (retrievalResult.success !== false && retrievalResult.count > 0) {
          console.log('✅ Journal retrieval test passed');
          return { success: true, message: 'All backend connections working perfectly!' };
        } else {
          return { success: false, message: 'Journal retrieval failed' };
        }
      } else {
        return { success: false, message: 'Journal saving failed' };
      }
    } else {
      return { success: false, message: 'User registration failed' };
    }
    
  } catch (error: any) {
    console.error('❌ Connection test failed:', error);
    return { 
      success: false, 
      message: `Backend connection failed: ${error.message}. Make sure backend is running on port 8080.` 
    };
  }
};

export const showConnectionStatus = (success: boolean, message: string) => {
  const statusDiv = document.createElement('div');
  statusDiv.innerHTML = `
    <div style="
      position: fixed; 
      top: 20px; 
      right: 20px; 
      z-index: 9999;
      background: ${success ? '#22c55e' : '#ef4444'};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      max-width: 300px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
    ">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>${success ? '✅' : '❌'}</span>
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" style="
          margin-left: auto;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 16px;
        ">×</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(statusDiv);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (statusDiv.parentElement) {
      statusDiv.remove();
    }
  }, 10000);
};
