/**
 * Authentication Helper - Auto-login for Development
 */

const DEV_TOKEN_KEY = 'dev_auth_token';

/**
 * Generate a development token for testing
 */
export const generateDevToken = async (): Promise<string> => {
  const credentials = [
    { username: 'manager', password: 'manager123' },
    { username: 'frontdesk', password: 'frontdesk123' },
    { username: 'itmanager', password: 'itmanager123' },
  ];

  for (const cred of credentials) {
    try {
      logger.debug('🔐 [AuthHelper] Trying login with ${cred.username}...', 'Component');

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
          logger.debug('✅ [AuthHelper] Dev token generated with ${cred.username}', 'Component');
          return data.token;
        }
      } else {
        logger.warn('⚠️ [AuthHelper] Login failed for ${cred.username}:', 'Component', response.status);
      }
    } catch (error) {
      logger.warn('⚠️ [AuthHelper] Error with ${cred.username}:', 'Component', error);
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
      logger.debug('⏰ [AuthHelper] Token expired:', 'Component', new Date(exp),
        'vs now:',
        new Date(now)
      );
    }

    return isExpired;
  } catch (error) {
    logger.error('❌ [AuthHelper] Failed to decode token:', 'Component', error);
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
      logger.debug('⏰ [AuthHelper] Token expired, generating new one...', 'Component');
      // Clear expired token
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      token = null;
    } else {
      logger.debug('✅ [AuthHelper] Valid token found', 'Component');
      return token;
    }
  }

  // In development, auto-generate token if none exists or expired
  if (import.meta.env.DEV || import.meta.env.NODE_ENV === 'development') {
    logger.debug('🚧 [AuthHelper] Generating fresh token for dev mode...', 'Component');
    try {
      token = await generateDevToken();
      return token;
    } catch (error) {
      logger.warn('⚠️ [AuthHelper] Failed to auto-generate dev token:', 'Component', error);
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
    logger.debug('🔄 [AuthHelper] 403 error, retrying with fresh token...', 'Component');

    // Force refresh token
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    // Get fresh headers and retry
    headers = await getAuthHeaders();
    response = await makeRequest(headers);

    if (response.status === 403) {
      logger.error('❌ [AuthHelper] Still 403 after token refresh - auth may be broken', 'Component');
    } else {
      logger.debug('✅ [AuthHelper] Success after token refresh!', 'Component');
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
