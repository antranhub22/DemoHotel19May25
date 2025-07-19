import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ✅ FIX: Initialize auth on app startup
import { getAuthToken } from '@/lib/authHelper';
import '@/lib/debugAuth'; // Make debugAuth available globally

// Auto-authenticate for development with fresh token
const initAuth = async () => {
  try {
    console.log('🚀 [Main] Starting authentication initialization...');
    
    // Clear any potentially expired tokens first
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('dev_auth_token');
    console.log('🧹 [Main] Cleared all existing tokens to test new credentials');
    
    const token = await getAuthToken();
    if (token) {
      console.log('✅ [Main] Fresh authentication token generated successfully');
      console.log('🎫 [Main] Token stored in localStorage');
    } else {
      console.warn('⚠️ [Main] Failed to generate authentication token');
      console.log('🔧 [Main] You can run: debugAuth.runFullTest() in console to debug');
    }
  } catch (error) {
    console.error('❌ [Main] Failed to initialize authentication:', error);
    console.log('🔧 [Main] You can run: debugAuth.runFullTest() in console to debug');
  }
};

// Initialize auth before rendering
console.log('🚀 [Main] App starting - initializing authentication...');
initAuth();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
