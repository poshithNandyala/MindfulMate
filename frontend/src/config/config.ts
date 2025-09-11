export const API_BASE_URL = 'http://localhost:8000';

export const API_ENDPOINTS = {
  chat: '/chat/',
  conversations: '/conversations/',
  journal: '/journal/',
  hello: '/receive_hello/',
};

export const CLERK_PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY || 'your-clerk-key';
