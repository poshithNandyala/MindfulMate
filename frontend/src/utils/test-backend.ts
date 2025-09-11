import { healthAPI, chatAPI } from './api';

export const testBackendConnection = async () => {
  try {
    console.log('🔗 Testing backend connection...');
    const response = await healthAPI.checkHealth();
    console.log('✅ Backend connection successful:', response);
    
    // Test chat endpoint
    console.log('💬 Testing chat endpoint...');
    const chatResponse = await chatAPI.sendMessage('Hello, this is a test message');
    console.log('✅ Chat endpoint working:', chatResponse);
    
    return true;
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return false;
  }
};

// Run test if this file is imported
if (process.env.NODE_ENV === 'development') {
  // Uncomment to auto-test on development start
  // testBackendConnection();
}
