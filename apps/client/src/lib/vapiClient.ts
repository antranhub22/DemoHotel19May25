// 🚀 REAL VAPI INTEGRATION: Dynamic import to fix module issues
let VapiClass: any = null;

// Dynamically load Vapi to handle module format issues
const loadVapi = async () => {
  if (VapiClass) return VapiClass;

  try {
    logger.debug('🔄 [VAPI] Loading Vapi module...', 'Component');

    // Try dynamic import first
    const vapiModule = await import('@vapi-ai/web');
    VapiClass = vapiModule.default || vapiModule;

    if (typeof VapiClass === 'function') {
      logger.debug('✅ [VAPI] Successfully loaded via dynamic import', 'Component');
      return VapiClass;
    }

    // If dynamic import doesn't work, try require
    throw new Error('Dynamic import failed, trying alternative...');
  } catch (error) {
    logger.warn('⚠️ [VAPI] Dynamic import failed:', 'Component', error.message);

    try {
      // Alternative: Try to access from window if available
      if (typeof window !== 'undefined' && (window as any).Vapi) {
        VapiClass = (window as any).Vapi;
        logger.debug('✅ [VAPI] Found Vapi on window object', 'Component');
        return VapiClass;
      }

      throw new Error('No Vapi available');
    } catch (fallbackError) {
      logger.error('❌ [VAPI] All import methods failed:', 'Component', fallbackError);
      throw new Error(`Failed to load Vapi: ${fallbackError.message}`);
    }
  }
};

// Initialize with environment variable or fallback
const publicKey =
  import.meta.env.VITE_VAPI_PUBLIC_KEY ||
  'pk_c3e56893-4a8b-45bb-b3d6-b5a2a0edd8f8';
logger.debug('[vapiClient] Environment public key:', 'Component', publicKey);

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
    logger.debug('🚀 [REAL VAPI] Initializing with key:', 'Component', `${publicKey?.substring(0, 10)}...`
    );

    // ✅ NEW: Prevent multiple simultaneous initializations
    if (isInitializing) {
      logger.debug('⏳ [REAL VAPI] Already initializing, waiting for current initialization...', 'Component');
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
    logger.debug('🚀 [REAL VAPI] Vapi class loaded:', 'Component', typeof Vapi);

    // ✅ ENHANCED: Always cleanup existing instance properly
    if (vapiInstance) {
      logger.debug('🧹 [REAL VAPI] Cleaning up existing instance...', 'Component');
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

        logger.debug('✅ [REAL VAPI] Existing instance cleaned up successfully', 'Component');
      } catch (cleanupError) {
        logger.warn('⚠️ [REAL VAPI] Cleanup error (continuing anyway):', 'Component', cleanupError);
      }

      // Brief pause to ensure cleanup completes
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    logger.debug('🚀 [REAL VAPI] Creating new Vapi instance...', 'Component');
    vapiInstance = new Vapi(publicKey, {
      // ✅ NEW: Prevent multiple call instances
      allowMultipleCallInstances: false,
    });
    logger.debug('✅ [REAL VAPI] Instance created successfully!', 'Component');

    // Add event listeners
    vapiInstance.on('call-start', () => {
      logger.debug('[vapiClient] Call started', 'Component');
    });

    vapiInstance.on('call-end', () => {
      logger.debug('[vapiClient] Call ended', 'Component');
    });

    vapiInstance.on('speech-start', () => {
      logger.debug('[vapiClient] Speech started', 'Component');
    });

    vapiInstance.on('speech-end', () => {
      logger.debug('[vapiClient] Speech ended', 'Component');
    });

    vapiInstance.on('volume-level', (volume: number) => {
      logger.debug('[vapiClient] Volume level:', 'Component', volume);
    });

    vapiInstance.on('message', (message: VapiMessage) => {
      logger.debug('[vapiClient] Message received:', 'Component', message);
    });

    vapiInstance.on('error', (error: any) => {
      logger.error('[vapiClient] Vapi error:', 'Component', error);
    });

    // ✅ NEW: Clear initialization flag on success
    isInitializing = false;
    logger.debug('✅ [REAL VAPI] Initialization completed successfully', 'Component');

    return vapiInstance;
  } catch (error) {
    // ✅ NEW: Clear initialization flag on error
    isInitializing = false;
    logger.error('[vapiClient] Failed to initialize Vapi:', 'Component', error);
    throw error;
  }
};

export const isVapiInitialized = (): boolean => {
  return vapiInstance !== null;
};

export const startCall = async (
  assistantId: string,
  assistantOverrides?: any
) => {
  if (!vapiInstance) {
    throw new Error('Vapi not initialized. Call initVapi first.');
  }

  try {
    logger.debug('🚀 [REAL VAPI] Starting call with assistant:', 'Component', assistantId);
    const call = await vapiInstance.start(assistantId, assistantOverrides);

    // ✅ IMPROVED: Validate call object before using it
    if (!call) {
      const error = new Error(
        'Failed to start call - Vapi returned null/undefined call object'
      );
      logger.error('❌ [REAL VAPI] Call object is null/undefined:', 'Component', error);
      throw error;
    }

    // ✅ IMPROVED: Check if call has required properties
    if (typeof call !== 'object') {
      const error = new Error(
        'Failed to start call - Invalid call object type'
      );
      logger.error('❌ [REAL VAPI] Invalid call object type:', 'Component', typeof call,
        call);
      throw error;
    }

    logger.debug('✅ [REAL VAPI] Call started successfully!', 'Component', call);
    logger.debug('🔍 [REAL VAPI] Call object properties:', 'Component', Object.keys(call));

    return call;
  } catch (error) {
    logger.error('❌ [REAL VAPI] Failed to start call:', 'Component', error);

    // ✅ IMPROVED: Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('webCallUrl')) {
        throw new Error(
          'Vapi call initialization failed - webCallUrl issue. Please check Vapi configuration and try again.'
        );
      } else if (error.message.includes('assistant')) {
        throw new Error(
          'Invalid assistant configuration. Please check assistant ID and permissions.'
        );
      } else {
        throw new Error(`Vapi call failed: ${error.message}`);
      }
    }

    throw error;
  }
};

export const endCall = async () => {
  if (!vapiInstance) {
    logger.warn('[vapiClient] No Vapi instance to end call', 'Component');
    return;
  }

  try {
    logger.debug('[vapiClient] Ending call', 'Component');
    await vapiInstance.stop();
  } catch (error) {
    logger.error('[vapiClient] Failed to end call:', 'Component', error);
    throw error;
  }
};

export const getVapiInstance = (): any => {
  return vapiInstance;
};

export const setMuted = (muted: boolean) => {
  if (!vapiInstance) {
    logger.warn('[vapiClient] No Vapi instance to set muted', 'Component');
    return;
  }

  try {
    vapiInstance.setMuted(muted);
  } catch (error) {
    logger.error('[vapiClient] Failed to set muted:', 'Component', error);
  }
};

export const sendMessage = (message: VapiMessage) => {
  if (!vapiInstance) {
    logger.warn('[vapiClient] No Vapi instance to send message', 'Component');
    return;
  }

  try {
    vapiInstance.send(JSON.stringify(message));
  } catch (error) {
    logger.error('[vapiClient] Failed to send message:', 'Component', error);
  }
};

export const resetVapi = () => {
  logger.debug('🧹 [vapiClient] Resetting Vapi instance', 'Component');

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

      logger.debug('✅ [vapiClient] Instance cleanup completed', 'Component');
    } catch (error) {
      logger.warn('⚠️ [vapiClient] Error during reset cleanup:', 'Component', error);
    }
    vapiInstance = null;
  }

  logger.debug('✅ [vapiClient] Reset completed - ready for fresh initialization', 'Component');
};

// Auto-initialize with default key if available
if (publicKey && publicKey !== 'demo') {
  logger.debug('[vapiClient] Auto-initializing with environment key', 'Component');
  initVapi(publicKey).catch(error => {
    logger.error('[vapiClient] Auto-initialization failed:', 'Component', error);
  });
} else {
  logger.warn('[vapiClient] No valid public key found, manual initialization required', 'Component');
}

export { publicKey };
