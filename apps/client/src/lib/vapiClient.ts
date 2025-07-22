/// <reference types="vite/client" />

// Type declaration for import.meta


// 🚀 REAL VAPI INTEGRATION: Enhanced for Production with better error handling
import { logger } from '@shared/utils/logger';

/* eslint-disable no-console */
// Vapi debug system requires console access for troubleshooting

// ✅ NEW: Production Debug System
class VapiDebugger {
  private static instance: VapiDebugger;
  private debugLevel: 'none' | 'error' | 'info' | 'verbose' = 'error';
  private logs: Array<{
    timestamp: string;
    level: string;
    message: string;
    data?: any;
  }> = [];
  private maxLogs = 100;

  static getInstance(): VapiDebugger {
    if (!VapiDebugger.instance) {
      VapiDebugger.instance = new VapiDebugger();
    }
    return VapiDebugger.instance;
  }

  setLevel(level: 'none' | 'error' | 'info' | 'verbose') {
    this.debugLevel = level;
    console.log(`🔧 Vapi debug level set to: ${level}`);
  }

  log(level: 'error' | 'info' | 'verbose', message: string, data?: any) {
    const timestamp = new Date().toISOString();

    // Store log
    this.logs.push({ timestamp, level, message, data });
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Output based on debug level
    const levelPriority = { error: 3, info: 2, verbose: 1 };
    const currentPriority =
      levelPriority[this.debugLevel as keyof typeof levelPriority] || 0;

    if (levelPriority[level] >= currentPriority) {
      const emoji = level === 'error' ? '🚨' : level === 'info' ? '📋' : '🔍';
      console.log(`${emoji} [VAPI-DEBUG] ${message}`, data || '');
    }
  }

  getLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
    console.log('🧹 Vapi debug logs cleared');
  }

  exportLogs() {
    const logsText = this.logs
      .map(
        log =>
          `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}${log.data ? ' | Data: ' + JSON.stringify(log.data) : ''}`
      )
      .join('\n');

    console.log('📄 Vapi Debug Logs Export:');
    console.log(logsText);
    return logsText;
  }
}

const vapiDebugger = VapiDebugger.getInstance();

// Set initial debug level based on environment
if (import.meta.env.PROD) {
  vapiDebugger.setLevel('info'); // Production: info + errors
} else {
  vapiDebugger.setLevel('verbose'); // Development: all logs
}

// Make debugger available globally
if (typeof window !== 'undefined') {
  (window as any).vapiDebug = {
    setLevel: (level: 'none' | 'error' | 'info' | 'verbose') =>
      vapiDebugger.setLevel(level),
    getLogs: () => vapiDebugger.getLogs(),
    clearLogs: () => vapiDebugger.clearLogs(),
    exportLogs: () => vapiDebugger.exportLogs(),
    help: () => {
      console.log('🔧 Vapi Debug Commands:');
      console.log('- vapiDebug.setLevel("verbose") - Enable all logs');
      console.log('- vapiDebug.setLevel("info") - Info + errors only');
      console.log('- vapiDebug.setLevel("error") - Errors only');
      console.log('- vapiDebug.setLevel("none") - Disable logs');
      console.log('- vapiDebug.getLogs() - Get stored logs');
      console.log('- vapiDebug.exportLogs() - Export logs as text');
      console.log('- vapiDebug.clearLogs() - Clear stored logs');
    },
  };
}

let VapiClass: any = null;

// Dynamically load Vapi to handle module format issues
const loadVapi = async () => {
  if (VapiClass) {return VapiClass;}

  try {
    logger.debug('🔄 [VAPI] Loading Vapi module...', 'Component');

    // Try dynamic import first
    const vapiModule = await import('@vapi-ai/web');
    VapiClass = vapiModule.default || vapiModule;

    if (typeof VapiClass === 'function') {
      logger.debug(
        '✅ [VAPI] Successfully loaded via dynamic import',
        'Component'
      );
      return VapiClass;
    }

    // If dynamic import doesn't work, try require
    throw new Error('Dynamic import failed, trying alternative...');
  } catch (error) {
    logger.warn(
      '⚠️ [VAPI] Dynamic import failed:',
      'Component',
      (error as Error).message
    );

    try {
      // Alternative: Try to access from window if available
      if (typeof window !== 'undefined' && (window as any).Vapi) {
        VapiClass = (window as any).Vapi;
        logger.debug('✅ [VAPI] Found Vapi on window object', 'Component');
        return VapiClass;
      }

      // ✅ NEW: Try CDN fallback for production
      if (import.meta.env.PROD) {
        logger.debug(
          '🌐 [VAPI] Trying CDN fallback for production...',
          'Component'
        );

        // Load from CDN as fallback
        const script = document.createElement('script');
        script.src = 'https://cdn.vapi.ai/web/latest.js';
        script.async = true;

        return new Promise((resolve, reject) => {
          script.onload = () => {
            if ((window as any).Vapi) {
              VapiClass = (window as any).Vapi;
              logger.debug(
                '✅ [VAPI] Successfully loaded from CDN',
                'Component'
              );
              resolve(VapiClass);
            } else {
              reject(new Error('Vapi not found on window after CDN load'));
            }
          };

          script.onerror = () => {
            reject(new Error('Failed to load Vapi from CDN'));
          };

          document.head.appendChild(script);

          // Timeout after 10 seconds
          setTimeout(() => {
            reject(new Error('CDN load timeout'));
          }, 10000);
        });
      }

      throw new Error('No Vapi available');
    } catch (fallbackError) {
      logger.error(
        '❌ [VAPI] All import methods failed:',
        'Component',
        fallbackError
      );
      throw new Error(
        `Failed to load Vapi: ${(fallbackError as Error).message}`
      );
    }
  }
};

// 🚀 REAL VAPI CLIENT: Enhanced with production checks
let vapiInstance: any = null;
let isInitializing = false;

export const initVapi = async (publicKey: string): Promise<any> => {
  try {
    vapiDebugger.log('info', 'initVapi called', {
      publicKeyPrefix: publicKey?.substring(0, 15) + '...',
      environment: import.meta.env.MODE,
      timestamp: new Date().toISOString(),
    });

    // ✅ PRODUCTION: Validate public key format
    if (!publicKey || !publicKey.startsWith('pk_')) {
      const error = `Invalid Vapi public key format: ${publicKey ? 'invalid format' : 'missing'}`;
      vapiDebugger.log('error', 'Public key validation failed', {
        publicKey: publicKey?.substring(0, 10) + '...',
        error,
      });
      throw new Error(error);
    }

    vapiDebugger.log('verbose', 'Public key validation passed', {
      keyLength: publicKey.length,
      keyPrefix: publicKey.substring(0, 15),
    });

    logger.debug(
      '🚀 [REAL VAPI] Initializing with key:',
      'Component',
      `${publicKey?.substring(0, 15)}...`
    );

    // ✅ NEW: Prevent multiple simultaneous initializations
    if (isInitializing) {
      logger.debug(
        '⏳ [REAL VAPI] Already initializing, waiting...',
        'Component'
      );
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (!isInitializing) {
            clearInterval(checkInterval);
            if (vapiInstance) {
              resolve(vapiInstance);
            } else {
              reject(new Error('Vapi initialization failed'));
            }
          }
        }, 100);

        // Timeout after 10 seconds for production
        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error('Vapi initialization timeout'));
        }, 10000);
      });
    }

    isInitializing = true;

    // Load Vapi class dynamically
    vapiDebugger.log('verbose', 'Loading Vapi class dynamically');
    const Vapi = await loadVapi();
    vapiDebugger.log('info', 'Vapi class loaded successfully', {
      vapiType: typeof Vapi,
      hasConstructor: typeof Vapi === 'function',
    });
    logger.debug('🚀 [REAL VAPI] Vapi class loaded:', 'Component', typeof Vapi);

    // Clean up existing instance if any
    if (vapiInstance) {
      vapiDebugger.log('info', 'Cleaning up existing Vapi instance');
      logger.debug(
        '🧹 [REAL VAPI] Cleaning up existing instance...',
        'Component'
      );
      try {
        if (typeof vapiInstance.stop === 'function') {
          await vapiInstance.stop();
        }
        if (typeof vapiInstance.destroy === 'function') {
          vapiInstance.destroy();
        }
        vapiDebugger.log('verbose', 'Existing instance cleanup completed');
        logger.debug(
          '✅ [REAL VAPI] Existing instance cleaned up successfully',
          'Component'
        );
      } catch (cleanupError) {
        vapiDebugger.log('error', 'Cleanup error during instance replacement', {
          error: cleanupError,
        });
        logger.warn(
          '⚠️ [REAL VAPI] Cleanup error (continuing anyway):',
          'Component',
          cleanupError
        );
      }
    }

    // Create new instance with enhanced config
    vapiDebugger.log('info', 'Creating new Vapi instance', {
      isProd: import.meta.env.PROD,
      config: import.meta.env.PROD
        ? { baseUrl: 'https://api.vapi.ai', timeout: 30000, retries: 3 }
        : 'default',
    });
    logger.debug('🚀 [REAL VAPI] Creating new Vapi instance...', 'Component');

    try {
      vapiInstance = new Vapi({
        publicKey,
        // ✅ NEW: Production-specific settings
        ...(import.meta.env.PROD && {
          baseUrl: 'https://api.vapi.ai',
          timeout: 30000,
          retries: 3,
        }),
      });

      vapiDebugger.log('info', 'Vapi instance created successfully', {
        instanceType: typeof vapiInstance,
        hasStartMethod: typeof vapiInstance.start === 'function',
        hasStopMethod: typeof vapiInstance.stop === 'function',
      });
    } catch (createError) {
      vapiDebugger.log('error', 'Failed to create Vapi instance', {
        error: createError,
      });
      throw createError;
    }

    logger.debug('✅ [REAL VAPI] Instance created successfully!', 'Component');

    // ✅ ENHANCED: Better event listeners with error recovery
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

    vapiInstance.on('message', (message: any) => {
      logger.debug('[vapiClient] Message received:', 'Component', message);
    });

    vapiInstance.on('error', (error: any) => {
      logger.error('[vapiClient] Vapi error:', 'Component', error);

      // ✅ NEW: Auto-recovery for certain errors
      if (error?.type === 'network' || error?.message?.includes('connection')) {
        logger.debug(
          '[vapiClient] Attempting auto-recovery for network error...',
          'Component'
        );
        setTimeout(() => {
          if (vapiInstance && typeof vapiInstance.reconnect === 'function') {
            vapiInstance.reconnect();
          }
        }, 2000);
      }
    });

    // ✅ NEW: Clear initialization flag on success
    isInitializing = false;
    logger.debug(
      '✅ [REAL VAPI] Initialization completed successfully',
      'Component'
    );

    return vapiInstance;
  } catch (error) {
    // ✅ NEW: Clear initialization flag on error
    isInitializing = false;
    logger.error('[vapiClient] Failed to initialize Vapi:', 'Component', error);
    throw error;
  }
};

export const startCall = async (
  assistantId: string,
  assistantOverrides?: any
): Promise<any> => {
  vapiDebugger.log('info', 'startCall invoked', {
    assistantIdPrefix: assistantId?.substring(0, 15) + '...',
    hasOverrides: !!assistantOverrides,
    vapiInstanceExists: !!vapiInstance,
    timestamp: new Date().toISOString(),
  });

  if (!vapiInstance) {
    vapiDebugger.log('error', 'Vapi instance not available for startCall', {
      instanceType: typeof vapiInstance,
      instanceValue: vapiInstance,
    });
    throw new Error('Vapi not initialized. Call initVapi first.');
  }

  // ✅ PRODUCTION: Validate assistant ID format
  if (!assistantId || !assistantId.startsWith('asst_')) {
    const error = `Invalid assistant ID format: ${assistantId ? 'invalid format' : 'missing'}`;
    vapiDebugger.log('error', 'Assistant ID validation failed', {
      assistantId: assistantId?.substring(0, 10) + '...',
      error,
    });
    throw new Error(error);
  }

  vapiDebugger.log('verbose', 'Assistant ID validation passed', {
    assistantIdLength: assistantId.length,
    assistantIdPrefix: assistantId.substring(0, 15),
  });

  try {
    logger.debug(
      '🚀 [REAL VAPI] Starting call with assistant:',
      'Component',
      `${assistantId.substring(0, 15)}...`
    );

    // ✅ ENHANCED: Add retry logic for production
    let lastError: any = null;
    const maxRetries = import.meta.env.PROD ? 3 : 1;

    vapiDebugger.log('info', 'Starting call with retry logic', {
      maxRetries,
      isProd: import.meta.env.PROD,
    });

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        vapiDebugger.log(
          'verbose',
          `Starting call attempt ${attempt}/${maxRetries}`,
          {
            attempt,
            maxRetries,
            assistantId: assistantId.substring(0, 15) + '...',
          }
        );

        const call = await vapiInstance.start(assistantId, assistantOverrides);

        // ✅ IMPROVED: Validate call object before using it
        if (!call) {
          const error = new Error(
            'Failed to start call - Vapi returned null/undefined call object'
          );
          vapiDebugger.log(
            'error',
            'Call object validation failed - null/undefined',
            {
              attempt,
              assistantId: assistantId.substring(0, 15) + '...',
              callValue: call,
            }
          );
          logger.error(
            '❌ [REAL VAPI] Call object is null/undefined:',
            'Component',
            error
          );
          throw error;
        }

        // ✅ IMPROVED: Check if call has required properties
        if (typeof call !== 'object') {
          const error = new Error(
            'Failed to start call - Invalid call object type'
          );
          vapiDebugger.log(
            'error',
            'Call object validation failed - invalid type',
            {
              attempt,
              assistantId: assistantId.substring(0, 15) + '...',
              callType: typeof call,
              callValue: call,
            }
          );
          logger.error(
            '❌ [REAL VAPI] Invalid call object type:',
            'Component',
            typeof call
          );
          throw error;
        }

        vapiDebugger.log('info', 'Call started successfully!', {
          attempt,
          callId: call?.id || 'unknown',
          callType: typeof call,
          callKeys: Object.keys(call || {}),
          duration: `${Date.now() - (call?.startTime || Date.now())}ms`,
        });

        logger.debug(
          '✅ [REAL VAPI] Call started successfully!',
          'Component',
          call
        );
        logger.debug(
          '🔍 [REAL VAPI] Call object properties:',
          'Component',
          Object.keys(call)
        );

        return call;
      } catch (attemptError) {
        lastError = attemptError;

        vapiDebugger.log(
          'error',
          `Call attempt ${attempt}/${maxRetries} failed`,
          {
            attempt,
            maxRetries,
            error: attemptError,
            errorMessage:
              attemptError instanceof Error
                ? attemptError.message
                : String(attemptError),
            errorType: attemptError?.constructor?.name,
            assistantId: assistantId.substring(0, 15) + '...',
          }
        );

        if (attempt < maxRetries) {
          const delay = attempt * 1000; // 1s, 2s, 3s delays
          vapiDebugger.log('info', `Retrying call in ${delay}ms`, {
            attempt,
            maxRetries,
            delay,
            nextAttempt: attempt + 1,
          });
          logger.warn(
            `⚠️ [REAL VAPI] Attempt ${attempt}/${maxRetries} failed, retrying in ${delay}ms...`,
            'Component',
            attemptError
          );
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    vapiDebugger.log('error', 'All call attempts exhausted', {
      totalAttempts: maxRetries,
      finalError: lastError,
      assistantId: assistantId.substring(0, 15) + '...',
    });
    throw lastError;
  } catch (error) {
    vapiDebugger.log('error', 'startCall failed with exception', {
      error,
      errorMessage: error instanceof Error ? (error as Error).message : String(error),
      errorStack: error instanceof Error ? (error as Error).stack : undefined,
      assistantId: assistantId.substring(0, 15) + '...',
      vapiInstanceExists: !!vapiInstance,
    });

    logger.error('❌ [REAL VAPI] Failed to start call:', 'Component', error);

    // ✅ IMPROVED: Provide more specific error messages
    if (error instanceof Error) {
      let enhancedError: Error;

      if ((error as Error).message.includes('webCallUrl')) {
        enhancedError = new Error(
          'Vapi call initialization failed - webCallUrl issue. Please check Vapi configuration and try again.'
        );
        vapiDebugger.log('error', 'webCallUrl issue detected', {
          originalError: (error as Error).message,
        });
      } else if ((error as Error).message.includes('assistant')) {
        enhancedError = new Error(
          'Invalid assistant configuration. Please check assistant ID and permissions.'
        );
        vapiDebugger.log('error', 'Assistant configuration issue detected', {
          originalError: (error as Error).message,
        });
      } else if (
        (error as Error).message.includes('network') ||
        (error as Error).message.includes('timeout')
      ) {
        enhancedError = new Error(
          'Network error during call start. Please check your internet connection and try again.'
        );
        vapiDebugger.log('error', 'Network/timeout issue detected', {
          originalError: (error as Error).message,
        });
      } else {
        enhancedError = new Error(`Vapi call failed: ${(error as Error).message}`);
        vapiDebugger.log('error', 'Generic call failure', {
          originalError: (error as Error).message,
        });
      }

      throw enhancedError;
    }

    throw error;
  }
};

export const endCall = async (): Promise<void> => {
    // Function returns void implicitly
  if (!vapiInstance) {
    logger.warn('[vapiClient] No Vapi instance to end call', 'Component');
    return;
  }

  try {
    logger.debug('[vapiClient] Ending call...', 'Component');
    await vapiInstance.stop();
    logger.debug('✅ [vapiClient] Call ended successfully', 'Component');
  } catch (error) {
    logger.error('[vapiClient] Error ending call:', 'Component', error);
    throw error;
  }
};

export const getVapiInstance = (): any => {
  return vapiInstance;
};

export const resetVapi = () => {
  logger.debug('🧹 [vapiClient] Resetting Vapi instance', 'Component');

  if (vapiInstance) {
    try {
      // Clean up existing instance
      if (typeof vapiInstance.stop === 'function') {
        vapiInstance.stop().catch(() => {
          // Ignore errors during cleanup
        });
      }

      if (typeof vapiInstance.destroy === 'function') {
        vapiInstance.destroy();
      }

      // Remove all event listeners
      if (typeof vapiInstance.removeAllListeners === 'function') {
        vapiInstance.removeAllListeners();
      }

      logger.debug('✅ [vapiClient] Instance cleanup completed', 'Component');
    } catch (error) {
      logger.warn(
        '⚠️ [vapiClient] Error during reset cleanup:',
        'Component',
        error
      );
    }
  }

  vapiInstance = null;
  isInitializing = false;
  logger.debug(
    '✅ [vapiClient] Reset completed - ready for fresh initialization',
    'Component'
  );
};

// ✅ NEW: Health check function
export const checkVapiHealth = async (): Promise<boolean> => {
  try {
    if (!vapiInstance) {
      return false;
    }

    // Simple health check
    if (typeof vapiInstance.getState === 'function') {
      const state = vapiInstance.getState();
      return state !== 'error';
    }

    return true;
  } catch (error) {
    logger.error('[vapiClient] Health check failed:', 'Component', error);
    return false;
  }
};
