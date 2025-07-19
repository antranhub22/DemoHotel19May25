import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ✅ FIX: Initialize auth on app startup
import { getAuthToken } from '@/lib/authHelper';
import '@/lib/debugAuth'; // Make debugAuth available globally

// Auto-authenticate for development
const initAuth = async () => {
  try {
    console.log('🚀 [Main] Starting authentication initialization...');
    
    const token = await getAuthToken();
    if (token) {
      console.log('✅ [Main] Authentication initialized successfully');
      console.log('🎫 [Main] Token stored in localStorage');
    } else {
      console.warn('⚠️ [Main] No authentication token available');
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
