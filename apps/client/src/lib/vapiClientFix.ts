// 🚀 ENHANCED VAPI CLIENT WITH AUTHENTICATION FIX
import { logger } from '@shared/utils/logger';

/* eslint-disable no-console */
// Vapi debug system requires console access for troubleshooting

// ✅ PRODUCTION: Enhanced Debug System
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
      console.log(`${emoji} [VAPI-FIX] ${message}`, data || '');
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
  (window as any).vapiDebugFix = {
    setLevel: (level: 'none' | 'error' | 'info' | 'verbose') =>
      vapiDebugger.setLevel(level),
    getLogs: () => vapiDebugger.getLogs(),
    clearLogs: () => vapiDebugger.clearLogs(),
    exportLogs: () => vapiDebugger.exportLogs(),
    help: () => {
      console.log('🔧 Vapi Fix Debug Commands:');
      console.log('- vapiDebugFix.setLevel("verbose") - Enable all logs');
      console.log('- vapiDebugFix.setLevel("info") - Info + errors only');
      console.log('- vapiDebugFix.setLevel("error") - Errors only');
      console.log('- vapiDebugFix.setLevel("none") - Disable logs');
      console.log('- vapiDebugFix.getLogs() - Get stored logs');
      console.log('- vapiDebugFix.exportLogs() - Export logs as text');
      console.log('- vapiDebugFix.clearLogs() - Clear stored logs');
    },
  };
}

let VapiClass: any = null;

// ✅ ENHANCED: Better Vapi loading with authentication validation
const loadVapi = async () => {
  if (VapiClass) return VapiClass;

  try {
    logger.debug('🔄 [VAPI-FIX] Loading Vapi module...', 'Component');

    // Try dynamic import first
    const vapiModule = await import('@vapi-ai/web');
    VapiClass = vapiModule.default || vapiModule;

    if (typeof VapiClass === 'function') {
      logger.debug(
        '✅ [VAPI-FIX] Successfully loaded via dynamic import',
        'Component'
      );
      return VapiClass;
    }

    // If dynamic import doesn't work, try require
    throw new Error('Dynamic import failed, trying alternative...');
  } catch (error) {
    logger.warn(
      '⚠️ [VAPI-FIX] Dynamic import failed:',
      'Component',
      (error as Error).message
    );

    try {
      // Alternative: Try to access from window if available
      if (typeof window !== 'undefined' && (window as any).Vapi) {
        VapiClass = (window as any).Vapi;
        logger.debug('✅ [VAPI-FIX] Found Vapi on window object', 'Component');
        return VapiClass;
      }

      // ✅ NEW: Try CDN fallback for production
      if (import.meta.env.PROD) {
        logger.debug(
          '🌐 [VAPI-FIX] Trying CDN fallback for production...',
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
                '✅ [VAPI-FIX] Successfully loaded from CDN',
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
        '❌ [VAPI-FIX] All import methods failed:',
        'Component',
        fallbackError
      );
      throw new Error(
        `Failed to load Vapi: ${(fallbackError as Error).message}`
      );
    }
  }
};

// ✅ ENHANCED: Authentication validation and error handling
export const validateVapiCredentials = (publicKey: string): {
  isValid: boolean;
  error?: string;
  details?: any;
} => {
  vapiDebugger.log('info', 'Validating VAPI credentials', {
    publicKeyPrefix: publicKey?.substring(0, 15) + '...',
    environment: import.meta.env.MODE,
  });

  // Check if public key exists
  if (!publicKey) {
    const error = 'VAPI Public Key is missing';
    vapiDebugger.log('error', 'Validation failed - missing public key', { publicKey });
    return {
      isValid: false,
      error,
      details: {
        issue: 'MISSING_PUBLIC_KEY',
        expectedFormat: 'pk_xxxxxxxxxxxxxxxxx',
        currentValue: 'undefined or empty',
        solution: 'Set VITE_VAPI_PUBLIC_KEY environment variable',
      },
    };
  }

  // Check public key format
  if (!publicKey.startsWith('pk_')) {
    const error = `Invalid VAPI public key format. Expected format: pk_xxxxx but got: ${publicKey.substring(0, 10)}...`;
    vapiDebugger.log('error', 'Validation failed - invalid format', {
      publicKey: publicKey.substring(0, 10) + '...',
      expectedPrefix: 'pk_',
      actualPrefix: publicKey.substring(0, 3),
    });
    return {
      isValid: false,
      error,
      details: {
        issue: 'INVALID_PUBLIC_KEY_FORMAT',
        expectedFormat: 'pk_xxxxxxxxxxxxxxxxx',
        currentValue: publicKey.substring(0, 10) + '...',
        solution: 'Get a valid public key from https://console.vapi.ai/',
      },
    };
  }

  // Check public key length
  if (publicKey.length < 20) {
    const error = `VAPI public key appears too short: ${publicKey.length} characters`;
    vapiDebugger.log('error', 'Validation failed - key too short', {
      length: publicKey.length,
      minExpected: 20,
    });
    return {
      isValid: false,
      error,
      details: {
        issue: 'PUBLIC_KEY_TOO_SHORT',
        expectedLength: '> 20 characters',
        currentLength: publicKey.length,
        solution: 'Verify you copied the complete public key from VAPI console',
      },
    };
  }

  vapiDebugger.log('info', 'VAPI credentials validation passed', {
    keyLength: publicKey.length,
    keyPrefix: publicKey.substring(0, 15),
  });

  return {
    isValid: true,
    details: {
      keyLength: publicKey.length,
      keyPrefix: publicKey.substring(0, 15),
      validatedAt: new Date().toISOString(),
    },
  };
};

// 🚀 ENHANCED VAPI CLIENT: Better error handling and authentication
let vapiInstance: any = null;
let isInitializing = false;

export const initVapiFix = async (publicKey: string): Promise<any> => {
  try {
    vapiDebugger.log('info', 'initVapiFix called', {
      publicKeyPrefix: publicKey?.substring(0, 15) + '...',
      environment: import.meta.env.MODE,
      timestamp: new Date().toISOString(),
    });

    // ✅ ENHANCED: Validate credentials before attempting initialization
    const validation = validateVapiCredentials(publicKey);
    if (!validation.isValid) {
      throw new Error(`VAPI Credentials Invalid: ${validation.error}`);
    }

    logger.debug(
      '🚀 [VAPI-FIX] Initializing with validated key:',
      'Component',
      `${publicKey?.substring(0, 15)}...`
    );

    // ✅ NEW: Prevent multiple simultaneous initializations
    if (isInitializing) {
      logger.debug(
        '⏳ [VAPI-FIX] Already initializing, waiting...',
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
    logger.debug('🚀 [VAPI-FIX] Vapi class loaded:', 'Component', typeof Vapi);

    // Clean up existing instance if any
    if (vapiInstance) {
      vapiDebugger.log('info', 'Cleaning up existing Vapi instance');
      logger.debug(
        '🧹 [VAPI-FIX] Cleaning up existing instance...',
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
          '✅ [VAPI-FIX] Existing instance cleaned up successfully',
          'Component'
        );
      } catch (cleanupError) {
        vapiDebugger.log('error', 'Cleanup error during instance replacement', {
          error: cleanupError,
        });
        logger.warn(
          '⚠️ [VAPI-FIX] Cleanup error (continuing anyway):',
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
    logger.debug('🚀 [VAPI-FIX] Creating new Vapi instance...', 'Component');

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
      
      // ✅ ENHANCED: Better error analysis
      const errorMessage = createError instanceof Error ? createError.message : String(createError);
      
      if (errorMessage.includes('Invalid public key') || errorMessage.includes('authentication')) {
        throw new Error(`VAPI Authentication Error: ${errorMessage}. Please check your VAPI public key in environment variables.`);
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        throw new Error(`VAPI Network Error: ${errorMessage}. Please check your internet connection.`);
      } else {
        throw new Error(`VAPI Initialization Error: ${errorMessage}`);
      }
    }

    logger.debug('✅ [VAPI-FIX] Instance created successfully!', 'Component');

    // ✅ ENHANCED: Better event listeners with error recovery
    vapiInstance.on('call-start', () => {
      logger.debug('[vapiClientFix] Call started', 'Component');
      vapiDebugger.log('info', 'Call started successfully');
    });

    vapiInstance.on('call-end', () => {
      logger.debug('[vapiClientFix] Call ended', 'Component');
      vapiDebugger.log('info', 'Call ended successfully');
    });

    vapiInstance.on('speech-start', () => {
      logger.debug('[vapiClientFix] Speech started', 'Component');
    });

    vapiInstance.on('speech-end', () => {
      logger.debug('[vapiClientFix] Speech ended', 'Component');
    });

    vapiInstance.on('volume-level', (volume: number) => {
      logger.debug('[vapiClientFix] Volume level:', 'Component', volume);
    });

    vapiInstance.on('message', (message: any) => {
      logger.debug('[vapiClientFix] Message received:', 'Component', message);
    });

    vapiInstance.on('error', (error: any) => {
      logger.error('[vapiClientFix] Vapi error:', 'Component', error);
      vapiDebugger.log('error', 'VAPI instance error', { error });

      // ✅ ENHANCED: Better error categorization
      const errorMessage = error?.message || String(error);
      
      if (errorMessage.includes('authentication') || errorMessage.includes('token') || errorMessage.includes('401')) {
        vapiDebugger.log('error', 'Authentication error detected', {
          error,
          solution: 'Check VAPI credentials and re-initialize'
        });
      } else if (error?.type === 'network' || errorMessage.includes('connection')) {
        logger.debug(
          '[vapiClientFix] Attempting auto-recovery for network error...',
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
      '✅ [VAPI-FIX] Initialization completed successfully',
      'Component'
    );

    return vapiInstance;
  } catch (error) {
    // ✅ NEW: Clear initialization flag on error
    isInitializing = false;
    logger.error('[vapiClientFix] Failed to initialize Vapi:', 'Component', error);
    vapiDebugger.log('error', 'Initialization failed', { error });
    throw error;
  }
};

export const startCallFix = async (
  assistantId: string,
  assistantOverrides?: any
): Promise<any> => {
  vapiDebugger.log('info', 'startCallFix invoked', {
    assistantIdPrefix: assistantId?.substring(0, 15) + '...',
    hasOverrides: !!assistantOverrides,
    vapiInstanceExists: !!vapiInstance,
    timestamp: new Date().toISOString(),
  });

  if (!vapiInstance) {
    vapiDebugger.log('error', 'Vapi instance not available for startCallFix', {
      instanceType: typeof vapiInstance,
      instanceValue: vapiInstance,
    });
    throw new Error('Vapi not initialized. Call initVapiFix first.');
  }

  // ✅ ENHANCED: Validate assistant ID format
  if (!assistantId || !assistantId.startsWith('asst_')) {
    const error = `Invalid assistant ID format: ${assistantId ? 'invalid format' : 'missing'}. Expected format: asst_xxxxx`;
    vapiDebugger.log('error', 'Assistant ID validation failed', {
      assistantId: assistantId?.substring(0, 10) + '...',
      error,
      expectedFormat: 'asst_xxxxxxxxx',
      solution: 'Check VITE_VAPI_ASSISTANT_ID environment variable'
    });
    throw new Error(error);
  }

  vapiDebugger.log('verbose', 'Assistant ID validation passed', {
    assistantIdLength: assistantId.length,
    assistantIdPrefix: assistantId.substring(0, 15),
  });

  try {
    logger.debug(
      '🚀 [VAPI-FIX] Starting call with assistant:',
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
          throw error;
        }

        vapiDebugger.log('info', 'Call started successfully!', {
          attempt,
          callId: call?.id || 'unknown',
          callType: typeof call,
          callKeys: Object.keys(call || {}),
        });

        logger.debug(
          '✅ [VAPI-FIX] Call started successfully!',
          'Component',
          call
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
            `⚠️ [VAPI-FIX] Attempt ${attempt}/${maxRetries} failed, retrying in ${delay}ms...`,
            'Component',
            attemptError
          );
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    throw lastError;
  } catch (error) {
    vapiDebugger.log('error', 'Call start failed completely', { error });
    logger.error('[vapiClientFix] Failed to start call:', 'Component', error);
    throw error;
  }
};

export const getVapiInstanceFix = () => vapiInstance;

export const resetVapiFix = () => {
  vapiDebugger.log('info', 'Resetting VAPI instance');
  if (vapiInstance) {
    try {
      if (typeof vapiInstance.stop === 'function') {
        vapiInstance.stop();
      }
      if (typeof vapiInstance.destroy === 'function') {
        vapiInstance.destroy();
      }
    } catch (error) {
      vapiDebugger.log('error', 'Error during VAPI reset', { error });
    }
  }
  vapiInstance = null;
  isInitializing = false;
  vapiDebugger.log('info', 'VAPI instance reset completed');
};