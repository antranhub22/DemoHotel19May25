/**
 * Debug Authentication Utility
 * Test authentication functionality manually
 */

import { getAuthHeaders, getAuthToken } from '@/lib/authHelper';
import { logger } from '@shared/utils/logger';

export const debugAuth = {
  async testLogin(userType = 'manager') {
    logger.debug(
      '🔐 [DebugAuth] Testing login with ${userType}...',
      'Component'
    );

    const credentials = {
      manager: { username: 'manager', password: 'manager123' },
      frontdesk: { username: 'frontdesk', password: 'frontdesk123' },
      itmanager: { username: 'itmanager', password: 'itmanager123' },
    };

    const cred =
      credentials[userType as keyof typeof credentials] || credentials.manager;

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cred),
      });

      logger.debug(
        '📋 [DebugAuth] Login response status:',
        'Component',
        response.status
      );

      if (response.ok) {
        const data = await response.json();
        logger.debug('✅ [DebugAuth] Login successful:', 'Component', data);
        return data;
      } else {
        const error = await response.text();
        logger.error('❌ [DebugAuth] Login failed:', 'Component', error);

        // Try alternative users if manager fails
        if (userType === 'manager') {
          logger.debug(
            '🔄 [DebugAuth] Manager failed, trying frontdesk...',
            'Component'
          );
          return await this.testLogin('frontdesk');
        }

        return null;
      }
    } catch (error) {
      logger.error('❌ [DebugAuth] Login error:', 'Component', error);
      return null;
    }
  },

  async testGetAuthToken() {
    logger.debug('🎫 [DebugAuth] Testing getAuthToken...', 'Component');

    try {
      const token = await getAuthToken();
      logger.debug(
        '✅ [DebugAuth] Got token:',
        'Component',
        token ? 'YES' : 'NO'
      );
      return token;
    } catch (error) {
      logger.error('❌ [DebugAuth] getAuthToken error:', 'Component', error);
      return null;
    }
  },

  async testAuthHeaders() {
    logger.debug('📋 [DebugAuth] Testing auth headers...', 'Component');

    try {
      const headers = await getAuthHeaders();
      logger.debug('✅ [DebugAuth] Auth headers:', 'Component', headers);
      return headers;
    } catch (error) {
      logger.error('❌ [DebugAuth] Auth headers error:', 'Component', error);
      return null;
    }
  },

  async testApiRequest() {
    logger.debug(
      '🌐 [DebugAuth] Testing authenticated API request...',
      'Component'
    );

    try {
      const headers = await getAuthHeaders();

      const response = await fetch('/api/request', {
        method: 'GET',
        headers,
      });

      logger.debug(
        '📋 [DebugAuth] API request status:',
        'Component',
        response.status
      );

      if (response.ok) {
        const data = await response.json();
        logger.debug('✅ [DebugAuth] API request successful', 'Component');
        return data;
      } else {
        const error = await response.text();
        logger.error('❌ [DebugAuth] API request failed:', 'Component', error);
        return null;
      }
    } catch (error) {
      logger.error('❌ [DebugAuth] API request error:', 'Component', error);
      return null;
    }
  },

  async clearTokens() {
    logger.debug('🧹 [DebugAuth] Clearing all stored tokens...', 'Component');
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('dev_auth_token');
    logger.debug('✅ [DebugAuth] Tokens cleared', 'Component');
  },

  async forceRefreshToken() {
    logger.debug('🔄 [DebugAuth] Force refreshing token...', 'Component');
    await this.clearTokens();
    return await this.testGetAuthToken();
  },

  async runFullTest() {
    logger.debug(
      '🧪 [DebugAuth] Running full authentication test...',
      'Component'
    );

    const results: any = {
      login: await this.testLogin(),
      token: await this.testGetAuthToken(),
      headers: await this.testAuthHeaders(),
      apiRequest: await this.testApiRequest(),
    };

    logger.debug('📊 [DebugAuth] Full test results:', 'Component', results);

    // If API request failed, try with fresh token
    if (!results.apiRequest) {
      logger.debug(
        '🔄 [DebugAuth] API request failed, trying with fresh token...',
        'Component'
      );
      await this.forceRefreshToken();
      const retryResult = await this.testApiRequest();
      results.retryWithFreshToken = retryResult;
    }

    return results;
  },
};

// Make available globally for console debugging
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuth;
}
