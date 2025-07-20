// 🚀 REAL VAPI INTEGRATION: Dynamic import to fix module issues
let VapiClass: any = null;

// Dynamically load Vapi to handle module format issues
const loadVapi = async () => {
  if (VapiClass) return VapiClass;
  
  try {
    console.log('🔄 [VAPI] Loading Vapi module...');
    
    // Try dynamic import first
    const vapiModule = await import('@vapi-ai/web');
    VapiClass = vapiModule.default || vapiModule;
    
    if (typeof VapiClass === 'function') {
      console.log('✅ [VAPI] Successfully loaded via dynamic import');
      return VapiClass;
    }
    
    // If dynamic import doesn't work, try require
    throw new Error('Dynamic import failed, trying alternative...');
    
  } catch (error) {
    console.warn('⚠️ [VAPI] Dynamic import failed:', error.message);
    
    try {
      // Alternative: Try to access from window if available
      if (typeof window !== 'undefined' && (window as any).Vapi) {
        VapiClass = (window as any).Vapi;
        console.log('✅ [VAPI] Found Vapi on window object');
        return VapiClass;
      }
      
      throw new Error('No Vapi available');
    } catch (fallbackError) {
      console.error('❌ [VAPI] All import methods failed:', fallbackError);
      throw new Error('Failed to load Vapi: ' + fallbackError.message);
    }
  }
};

// Initialize with environment variable or fallback
const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY || 'pk_c3e56893-4a8b-45bb-b3d6-b5a2a0edd8f8';
console.log('[vapiClient] Environment public key:', publicKey);

// Option to force basic summary generation (for testing fallback)
export const FORCE_BASIC_SUMMARY = false; // Set to true to always use basic summary

let vapiInstance: any = null;
let isInitializing = false; // ✅ NEW: Prevent multiple simultaneous initializations

interface VapiConnectionStatus {
  status: 'connecting' | 'connected' | 'disconnected';
}

interface VapiMessage {
  type: string;
  content?: string;
  [key: string]: any;
}

export const initVapi = async (publicKey: string): Promise<any> => {
  try {
    console.log('🚀 [REAL VAPI] Initializing with key:', publicKey?.substring(0, 10) + '...');
    
    // ✅ NEW: Prevent multiple simultaneous initializations
    if (isInitializing) {
      console.log('⏳ [REAL VAPI] Already initializing, waiting for current initialization...');
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (!isInitializing) {
            clearInterval(checkInterval);
            resolve(vapiInstance);
          }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error('Vapi initialization timeout'));
        }, 5000);
      });
    }
    
    isInitializing = true;
    
    // Load Vapi class dynamically
    const Vapi = await loadVapi();
    console.log('🚀 [REAL VAPI] Vapi class loaded:', typeof Vapi);
    
    // ✅ ENHANCED: Always cleanup existing instance properly
    if (vapiInstance) {
      console.log('🧹 [REAL VAPI] Cleaning up existing instance...');
      try {
        // Enhanced cleanup - stop all activities
        if (typeof vapiInstance.stop === 'function') {
          vapiInstance.stop();
        }
        if (typeof vapiInstance.cleanup === 'function') {
          vapiInstance.cleanup();
        }
        if (typeof vapiInstance.disconnect === 'function') {
          vapiInstance.disconnect();
        }
        
        // Remove all event listeners to prevent conflicts
        if (typeof vapiInstance.removeAllListeners === 'function') {
          vapiInstance.removeAllListeners();
        }
        
        console.log('✅ [REAL VAPI] Existing instance cleaned up successfully');
      } catch (cleanupError) {
        console.warn('⚠️ [REAL VAPI] Cleanup error (continuing anyway):', cleanupError);
      }
      
      // Brief pause to ensure cleanup completes
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('🚀 [REAL VAPI] Creating new Vapi instance...');
    vapiInstance = new Vapi(publicKey, {
      // ✅ NEW: Prevent multiple call instances
      allowMultipleCallInstances: false
    });
    console.log('✅ [REAL VAPI] Instance created successfully!');

    // Add event listeners
    vapiInstance.on('call-start', () => {
      console.log('[vapiClient] Call started');
    });

    vapiInstance.on('call-end', () => {
      console.log('[vapiClient] Call ended');
    });

    vapiInstance.on('speech-start', () => {
      console.log('[vapiClient] Speech started');
    });

    vapiInstance.on('speech-end', () => {
      console.log('[vapiClient] Speech ended');
    });

    vapiInstance.on('volume-level', (volume: number) => {
      console.log('[vapiClient] Volume level:', volume);
    });

    vapiInstance.on('message', (message: VapiMessage) => {
      console.log('[vapiClient] Message received:', message);
    });

    vapiInstance.on('error', (error: any) => {
      console.error('[vapiClient] Vapi error:', error);
    });

    // ✅ NEW: Clear initialization flag on success
    isInitializing = false;
    console.log('✅ [REAL VAPI] Initialization completed successfully');

    return vapiInstance;
  } catch (error) {
    // ✅ NEW: Clear initialization flag on error
    isInitializing = false;
    console.error('[vapiClient] Failed to initialize Vapi:', error);
    throw error;
  }
};

export const isVapiInitialized = (): boolean => {
  return vapiInstance !== null;
};

export const startCall = async (assistantId: string, assistantOverrides?: any) => {
  if (!vapiInstance) {
    throw new Error('Vapi not initialized. Call initVapi first.');
  }

  try {
    console.log('🚀 [REAL VAPI] Starting call with assistant:', assistantId);
    const call = await vapiInstance.start(assistantId, assistantOverrides);
    console.log('✅ [REAL VAPI] Call started successfully!', call);
    return call;
  } catch (error) {
    console.error('❌ [REAL VAPI] Failed to start call:', error);
    throw error;
  }
};

export const endCall = async () => {
  if (!vapiInstance) {
    console.warn('[vapiClient] No Vapi instance to end call');
    return;
  }

  try {
    console.log('[vapiClient] Ending call');
    await vapiInstance.stop();
  } catch (error) {
    console.error('[vapiClient] Failed to end call:', error);
    throw error;
  }
};

export const getVapiInstance = (): any => {
  return vapiInstance;
};

export const setMuted = (muted: boolean) => {
  if (!vapiInstance) {
    console.warn('[vapiClient] No Vapi instance to set muted');
    return;
  }

  try {
    vapiInstance.setMuted(muted);
  } catch (error) {
    console.error('[vapiClient] Failed to set muted:', error);
  }
};

export const sendMessage = (message: VapiMessage) => {
  if (!vapiInstance) {
    console.warn('[vapiClient] No Vapi instance to send message');
    return;
  }

  try {
    vapiInstance.send(JSON.stringify(message));
  } catch (error) {
    console.error('[vapiClient] Failed to send message:', error);
  }
};

export const resetVapi = () => {
  console.log('🧹 [vapiClient] Resetting Vapi instance');
  
  // ✅ NEW: Clear initialization flag to allow fresh init
  isInitializing = false;
  
  if (vapiInstance) {
    try {
      // Enhanced cleanup - stop all activities
      if (typeof vapiInstance.stop === 'function') {
        vapiInstance.stop();
      }
      if (typeof vapiInstance.cleanup === 'function') {
        vapiInstance.cleanup();
      }
      if (typeof vapiInstance.disconnect === 'function') {
        vapiInstance.disconnect();
      }
      
      // Remove all event listeners to prevent conflicts
      if (typeof vapiInstance.removeAllListeners === 'function') {
        vapiInstance.removeAllListeners();
      }
      
      console.log('✅ [vapiClient] Instance cleanup completed');
    } catch (error) {
      console.warn('⚠️ [vapiClient] Error during reset cleanup:', error);
    }
    vapiInstance = null;
  }
  
  console.log('✅ [vapiClient] Reset completed - ready for fresh initialization');
};

// Auto-initialize with default key if available
if (publicKey && publicKey !== 'demo') {
  console.log('[vapiClient] Auto-initializing with environment key');
  initVapi(publicKey).catch(error => {
    console.error('[vapiClient] Auto-initialization failed:', error);
  });
} else {
  console.warn('[vapiClient] No valid public key found, manual initialization required');
}

export { publicKey };
