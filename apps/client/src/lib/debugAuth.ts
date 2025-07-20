/**
 * Debug Authentication Utility
 * Test authentication functionality manually
 */

import { getAuthToken, getAuthHeaders } from './authHelper';

export const debugAuth = {
  async testLogin(userType = 'manager') {
    console.log(`🔐 [DebugAuth] Testing login with ${userType}...`);
    
    const credentials = {
      manager: { username: 'manager', password: 'manager123' },
      frontdesk: { username: 'frontdesk', password: 'frontdesk123' },
      itmanager: { username: 'itmanager', password: 'itmanager123' }
    };
    
    const cred = credentials[userType as keyof typeof credentials] || credentials.manager;
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cred)
      });

      console.log('📋 [DebugAuth] Login response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ [DebugAuth] Login successful:', data);
        return data;
      } else {
        const error = await response.text();
        console.error('❌ [DebugAuth] Login failed:', error);
        
        // Try alternative users if manager fails
        if (userType === 'manager') {
          console.log('🔄 [DebugAuth] Manager failed, trying frontdesk...');
          return await this.testLogin('frontdesk');
        }
        
        return null;
      }
    } catch (error) {
      console.error('❌ [DebugAuth] Login error:', error);
      return null;
    }
  },

  async testGetAuthToken() {
    console.log('🎫 [DebugAuth] Testing getAuthToken...');
    
    try {
      const token = await getAuthToken();
      console.log('✅ [DebugAuth] Got token:', token ? 'YES' : 'NO');
      return token;
    } catch (error) {
      console.error('❌ [DebugAuth] getAuthToken error:', error);
      return null;
    }
  },

  async testAuthHeaders() {
    console.log('📋 [DebugAuth] Testing auth headers...');
    
    try {
      const headers = await getAuthHeaders();
      console.log('✅ [DebugAuth] Auth headers:', headers);
      return headers;
    } catch (error) {
      console.error('❌ [DebugAuth] Auth headers error:', error);
      return null;
    }
  },

  async testApiRequest() {
    console.log('🌐 [DebugAuth] Testing authenticated API request...');
    
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch('/api/request', {
        method: 'GET',
        headers
      });

      console.log('📋 [DebugAuth] API request status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ [DebugAuth] API request successful');
        return data;
      } else {
        const error = await response.text();
        console.error('❌ [DebugAuth] API request failed:', error);
        return null;
      }
    } catch (error) {
      console.error('❌ [DebugAuth] API request error:', error);
      return null;
    }
  },

  async clearTokens() {
    console.log('🧹 [DebugAuth] Clearing all stored tokens...');
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('dev_auth_token');
    console.log('✅ [DebugAuth] Tokens cleared');
  },

  async forceRefreshToken() {
    console.log('🔄 [DebugAuth] Force refreshing token...');
    await this.clearTokens();
    return await this.testGetAuthToken();
  },

  async runFullTest() {
    console.log('🧪 [DebugAuth] Running full authentication test...');
    
    const results: any = {
      login: await this.testLogin(),
      token: await this.testGetAuthToken(),
      headers: await this.testAuthHeaders(),
      apiRequest: await this.testApiRequest()
    };

    console.log('📊 [DebugAuth] Full test results:', results);
    
    // If API request failed, try with fresh token
    if (!results.apiRequest) {
      console.log('🔄 [DebugAuth] API request failed, trying with fresh token...');
      await this.forceRefreshToken();
      const retryResult = await this.testApiRequest();
      results.retryWithFreshToken = retryResult;
    }
    
    return results;
  }
};

// Make available globally for console debugging
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuth;
} 