/// <reference types="vite/client" />

// Type declaration for import.meta


/**
 * Authentication Helper - Auto-login for Development
 */

const DEV_TOKEN_KEY = 'dev_auth_token';

/**
 * Generate a development token for testing
 */
export const generateDevToken = async (): Promise<string> => {
  const credentials = [
    { email: 'manager', password: 'manager123' },
    { email: 'frontdesk', password: 'frontdesk123' },
    { email: 'itmanager', password: 'itmanager123' },
  ];

  for (const cred of (credentials as any[])) {
    try {
      console.log(`🔐 [AuthHelper] Trying login with ${cred.email}...`);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cred),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem(DEV_TOKEN_KEY, 'true');
          console.log(`✅ [AuthHelper] Dev token generated with ${cred.email}`);
          return data.token;
        }
      } else {
        console.warn(
          `⚠️ [AuthHelper] Login failed for ${cred.email}:`,
          response.status
        );
      }
    } catch (error) {
      console.warn(`⚠️ [AuthHelper] Error with ${cred.email}:`, error);
    }
  }

  throw new Error('Failed to generate dev token with any credentials');
};

/**
 * Check if token is expired
 */
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const isExpired = now >= exp;

    if (isExpired) {
      console.log(
        '⏰ [AuthHelper] Token expired:',
        new Date(exp),
        'vs now:',
        new Date(now)
      );
    }

    return isExpired;
  } catch (error) {
    console.error('❌ [AuthHelper] Failed to decode token:', error);
    return true; // Assume expired if can't decode
  }
};

/**
 * Get auth token, auto-generate for development if needed
 */
export const getAuthToken = async (): Promise<string | null> => {
  // Check if token exists
  let token = localStorage.getItem('token') || sessionStorage.getItem('token');

  // If token exists, check if it's expired
  if (token) {
    if (isTokenExpired(token)) {
      console.log('⏰ [AuthHelper] Token expired, generating new one...');
      // Clear expired token
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      token = null;
    } else {
      console.log('✅ [AuthHelper] Valid token found');
      return token;
    }
  }

  // In development, auto-generate token if none exists or expired
  if (import.meta.env.DEV || import.meta.env.NODE_ENV === 'development') {
    console.log('🚧 [AuthHelper] Generating fresh token for dev mode...');
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
    'Content-Type': 'application/json',
  };

  const token = await getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Make authenticated request with auto-retry on token expiry
 */
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const makeRequest = async (headers: Record<string, string>) => {
    return fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });
  };

  // First attempt
  let headers = await getAuthHeaders();
  let response = await makeRequest(headers);

  // If 403 (forbidden/expired), try once more with fresh token
  if (response.status === 403) {
    console.log('🔄 [AuthHelper] 403 error, retrying with fresh token...');

    // Force refresh token
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    // Get fresh headers and retry
    headers = await getAuthHeaders();
    response = await makeRequest(headers);

    if (response.status === 403) {
      console.error(
        '❌ [AuthHelper] Still 403 after token refresh - auth may be broken'
      );
    } else {
      console.log('✅ [AuthHelper] Success after token refresh!');
    }
  }

  return response;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token =
    localStorage.getItem('token') || sessionStorage.getItem('token');
  return !!token;
};
