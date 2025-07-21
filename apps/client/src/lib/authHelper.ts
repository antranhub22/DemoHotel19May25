import { jwtDecode } from 'jwt-decode';
import { logger } from '@shared/utils/logger';

export interface LoginCredentials {
  username: string;
  password: string;
}

// Development credentials for testing
const DEV_CREDENTIALS: LoginCredentials[] = [
  { username: 'admin', password: 'admin123' },
  { username: 'manager', password: 'manager123' },
  { username: 'frontdesk', password: 'frontdesk123' },
  { username: 'itmanager', password: 'itmanager123' },
];

export const attemptLogin = async (cred: LoginCredentials): Promise<string | null> => {
  try {
    logger.debug(`🔐 [AuthHelper] Trying login with ${cred.username}...`, 'Component');

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cred),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        logger.debug(`✅ [AuthHelper] Dev token generated with ${cred.username}`, 'Component');
        return data.token;
      }
    } else {
      logger.warn(`⚠️ [AuthHelper] Login failed for ${cred.username}: ${response.status}`, 'Component');
    }
  } catch (error) {
    logger.warn(`⚠️ [AuthHelper] Error with ${cred.username}:`, 'Component', error);
  }
  return null;
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: { exp?: number } = jwtDecode(token);
    if (decoded.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = decoded.exp < currentTime;
      if (isExpired) {
        logger.debug('⏰ [AuthHelper] Token expired:', 'Component', new Date(decoded.exp * 1000));
      }
      return isExpired;
    }
    return true;
  } catch (error) {
    logger.error('❌ [AuthHelper] Failed to decode token:', 'Component', error);
    return true;
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  // Check for existing valid token
  const existingToken = localStorage.getItem('token');
  if (existingToken && !isTokenExpired(existingToken)) {
    // Token is valid, return it
    logger.debug('✅ [AuthHelper] Valid token found', 'Component');
    return existingToken;
  } else if (existingToken) {
    // Token exists but is expired
    logger.debug('⏰ [AuthHelper] Token expired, removing it...', 'Component');
    localStorage.removeItem('token');
  }

  // Development mode: try to generate fresh token
  if (import.meta.env.DEV || import.meta.env.NODE_ENV === 'development') {
    logger.debug('🚧 [AuthHelper] Generating fresh token for dev mode...', 'Component');
    for (const cred of DEV_CREDENTIALS) {
      const token = await attemptLogin(cred);
      if (token) {
        logger.debug('✅ [AuthHelper] Fresh dev token generated', 'Component');
        return token;
      }
    }
    logger.warn('⚠️ [AuthHelper] Failed to auto-generate dev token', 'Component');
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
  const makeRequest = async (headers: Record<string, string>): Promise<Response> => {
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
