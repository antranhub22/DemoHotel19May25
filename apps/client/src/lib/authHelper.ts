/**
 * Authentication Helper - Auto-login for Development
 */

const DEV_TOKEN_KEY = 'dev_auth_token';

/**
 * Generate a development token for testing
 */
export const generateDevToken = async (): Promise<string> => {
  try {
    // Try to login with default dev credentials
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@hotel.com',
        password: 'admin123'
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem(DEV_TOKEN_KEY, 'true');
        console.log('✅ [AuthHelper] Dev token generated and stored');
        return data.token;
      }
    }
    
    throw new Error('Failed to generate dev token');
  } catch (error) {
    console.error('❌ [AuthHelper] Failed to generate dev token:', error);
    throw error;
  }
};

/**
 * Get auth token, auto-generate for development if needed
 */
export const getAuthToken = async (): Promise<string | null> => {
  // Check if token exists
  let token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  if (token) {
    return token;
  }

  // In development, auto-generate token if none exists
  if (import.meta.env.DEV || import.meta.env.NODE_ENV === 'development') {
    console.log('🚧 [AuthHelper] No token found in dev mode, auto-generating...');
    try {
      token = await generateDevToken();
      return token;
    } catch (error) {
      console.warn('⚠️ [AuthHelper] Failed to auto-generate dev token:', error);
      return null;
    }
  }

  return null;
};

/**
 * Get auth headers with token
 */
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  const token = await getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return !!token;
}; 