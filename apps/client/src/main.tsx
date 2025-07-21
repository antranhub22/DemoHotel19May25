import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ✅ FIX: Initialize auth on app startup
import { getAuthToken } from '@/lib/authHelper';
import '@/lib/debugAuth'; // Make debugAuth available globally
import { logger } from '@shared/utils/logger';

// Auto-authenticate for development with fresh token
const initAuth = async () => {
  try {
    logger.debug('🚀 [Main] Starting authentication initialization...', 'Component');

    // Clear any potentially expired tokens first
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('dev_auth_token');
    logger.debug('🧹 [Main] Cleared all existing tokens to test new credentials', 'Component');

    const token = await getAuthToken();
    if (token) {
      logger.debug('✅ [Main] Fresh authentication token generated successfully', 'Component');
      logger.debug('🎫 [Main] Token stored in localStorage', 'Component');
    } else {
      logger.warn('⚠️ [Main] Failed to generate authentication token', 'Component');
      logger.debug('🔧 [Main] You can run: debugAuth.runFullTest() in console to debug', 'Component');
    }
  } catch (error) {
    logger.error('❌ [Main] Failed to initialize authentication:', 'Component', error);
    logger.debug('🔧 [Main] You can run: debugAuth.runFullTest() in console to debug', 'Component');
  }
};

// Initialize auth before rendering
logger.debug('🚀 [Main] App starting - initializing authentication...', 'Component');
initAuth();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
