// 🚀 VAPI CLIENT - RELAXED VERSION (WITHOUT STRICT FORMAT VALIDATION)
import { logger } from '@shared/utils/logger';

/* eslint-disable no-console */
// VAPI debug system requires console access for troubleshooting

// ✅ Enhanced Debug System
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
  }

  log(level: 'error' | 'info' | 'verbose', message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message, data };
    
    this.logs.unshift(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    if (this.shouldLog(level)) {
      const logMethod = level === 'error' ? console.error : level === 'info' ? console.info : console.log;
      if (data) {
        logMethod(`[VAPI ${level.toUpperCase()}] ${message}`, data);
      } else {
        logMethod(`[VAPI ${level.toUpperCase()}] ${message}`);
      }
    }
  }

  private shouldLog(level: 'error' | 'info' | 'verbose'): boolean {
    if (this.debugLevel === 'none') return false;
    if (this.debugLevel === 'error') return level === 'error';
    if (this.debugLevel === 'info') return ['error', 'info'].includes(level);
    return true; // verbose logs everything
  }

  getLogs(): Array<{ timestamp: string; level: string; message: string; data?: any }> {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}

const debugger = VapiDebugger.getInstance();

// ✅ RELAXED: Basic validation without strict format requirements
export function validateVapiCredentialsRelaxed(publicKey?: string, assistantId?: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic presence check only
  if (!publicKey || publicKey.trim() === '') {
    errors.push('Public key is required');
  } else if (publicKey.trim().length < 10) {
    warnings.push('Public key seems too short (less than 10 characters)');
  }

  if (!assistantId || assistantId.trim() === '') {
    errors.push('Assistant ID is required');
  } else if (assistantId.trim().length < 10) {
    warnings.push('Assistant ID seems too short (less than 10 characters)');
  }

  // Log validation results
  debugger.log('info', 'VAPI Credentials Validation (Relaxed)', {
    publicKeyPresent: !!publicKey,
    publicKeyLength: publicKey?.length || 0,
    assistantIdPresent: !!assistantId,
    assistantIdLength: assistantId?.length || 0,
    errors,
    warnings
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ✅ VAPI Client Instance Management
let vapiInstance: any = null;
let currentState: {
  isInitialized: boolean;
  isConnected: boolean;
  isCallActive: boolean;
  lastError?: string;
} = {
  isInitialized: false,
  isConnected: false,
  isCallActive: false
};

// ✅ Initialize VAPI with relaxed validation
export async function initVapiRelaxed(publicKey: string): Promise<{
  success: boolean;
  error?: string;
  instance?: any;
}> {
  try {
    debugger.log('info', 'Initializing VAPI with relaxed validation', { publicKey: publicKey ? 'Present' : 'Missing' });

    // Basic validation only
    const validation = validateVapiCredentialsRelaxed(publicKey);
    if (!validation.isValid) {
      const error = `Validation failed: ${validation.errors.join(', ')}`;
      debugger.log('error', error);
      return { success: false, error };
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      debugger.log('info', `Validation warnings: ${validation.warnings.join(', ')}`);
    }

    // Import VAPI dynamically
    const { default: Vapi } = await import('@vapi-ai/web');
    
    // Clean up existing instance
    if (vapiInstance) {
      try {
        await vapiInstance.stop();
      } catch (e) {
        debugger.log('info', 'Previous instance cleanup completed');
      }
    }

    // Create new instance
    vapiInstance = new Vapi(publicKey);
    
    // Set up event listeners
    setupVapiEventListeners(vapiInstance);
    
    currentState.isInitialized = true;
    currentState.lastError = undefined;

    debugger.log('info', 'VAPI initialized successfully');
    
    return { 
      success: true, 
      instance: vapiInstance 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during VAPI initialization';
    debugger.log('error', 'VAPI initialization failed', { error: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    
    currentState.isInitialized = false;
    currentState.lastError = errorMessage;
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

// ✅ Start Call with relaxed validation
export async function startCallRelaxed(assistantId: string, assistantOverrides?: any): Promise<{
  success: boolean;
  error?: string;
  callId?: string;
}> {
  try {
    debugger.log('info', 'Starting VAPI call', { assistantId: assistantId ? 'Present' : 'Missing' });

    // Basic validation
    const validation = validateVapiCredentialsRelaxed(undefined, assistantId);
    if (!validation.isValid) {
      const error = `Assistant ID validation failed: ${validation.errors.join(', ')}`;
      debugger.log('error', error);
      return { success: false, error };
    }

    if (!vapiInstance) {
      const error = 'VAPI not initialized. Call initVapiRelaxed() first.';
      debugger.log('error', error);
      return { success: false, error };
    }

    if (currentState.isCallActive) {
      debugger.log('info', 'Stopping existing call before starting new one');
      await vapiInstance.stop();
    }

    // Start the call
    debugger.log('info', 'Attempting to start call', { assistantId, hasOverrides: !!assistantOverrides });
    
    await vapiInstance.start(assistantId, assistantOverrides);
    
    currentState.isCallActive = true;
    currentState.lastError = undefined;

    debugger.log('info', 'Call started successfully');
    
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during call start';
    debugger.log('error', 'Failed to start call', { 
      error: errorMessage, 
      stack: error instanceof Error ? error.stack : undefined,
      assistantId
    });
    
    currentState.isCallActive = false;
    currentState.lastError = errorMessage;
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

// ✅ Stop Call
export async function stopCallRelaxed(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!vapiInstance) {
      return { success: true }; // Already stopped
    }

    debugger.log('info', 'Stopping VAPI call');
    await vapiInstance.stop();
    
    currentState.isCallActive = false;
    currentState.lastError = undefined;

    debugger.log('info', 'Call stopped successfully');
    
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during call stop';
    debugger.log('error', 'Failed to stop call', { error: errorMessage });
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

// ✅ Setup Event Listeners
function setupVapiEventListeners(vapi: any): void {
  vapi.on('call-start', () => {
    debugger.log('info', 'VAPI Event: Call started');
    currentState.isCallActive = true;
    currentState.isConnected = true;
  });

  vapi.on('call-end', () => {
    debugger.log('info', 'VAPI Event: Call ended');
    currentState.isCallActive = false;
    currentState.isConnected = false;
  });

  vapi.on('error', (error: any) => {
    debugger.log('error', 'VAPI Event: Error occurred', error);
    currentState.lastError = error?.message || 'Unknown VAPI error';
    currentState.isCallActive = false;
  });

  vapi.on('message', (message: any) => {
    debugger.log('verbose', 'VAPI Event: Message received', message);
  });

  vapi.on('speech-start', () => {
    debugger.log('verbose', 'VAPI Event: Speech started');
  });

  vapi.on('speech-end', () => {
    debugger.log('verbose', 'VAPI Event: Speech ended');
  });

  vapi.on('volume-level', (volume: number) => {
    debugger.log('verbose', 'VAPI Event: Volume level', { volume });
  });
}

// ✅ Get Current State
export function getVapiStateRelaxed(): typeof currentState {
  return { ...currentState };
}

// ✅ Reset VAPI
export async function resetVapiRelaxed(): Promise<void> {
  debugger.log('info', 'Resetting VAPI');
  
  if (vapiInstance) {
    try {
      await vapiInstance.stop();
    } catch (e) {
      debugger.log('info', 'Cleanup during reset completed');
    }
    vapiInstance = null;
  }
  
  currentState = {
    isInitialized: false,
    isConnected: false,
    isCallActive: false
  };

  debugger.log('info', 'VAPI reset completed');
}

// ✅ Debug Utilities
export function setVapiDebugLevel(level: 'none' | 'error' | 'info' | 'verbose'): void {
  debugger.setLevel(level);
  debugger.log('info', `Debug level set to: ${level}`);
}

export function getVapiDebugLogs(): Array<{ timestamp: string; level: string; message: string; data?: any }> {
  return debugger.getLogs();
}

export function clearVapiDebugLogs(): void {
  debugger.clear();
  debugger.log('info', 'Debug logs cleared');
}

// ✅ Export debugger for global access
export { debugger as vapiDebugger };

// ✅ Global debug commands for browser console
if (typeof window !== 'undefined') {
  (window as any).vapiDebug = {
    setLevel: setVapiDebugLevel,
    getLogs: getVapiDebugLogs,
    clearLogs: clearVapiDebugLogs,
    getState: getVapiStateRelaxed,
    reset: resetVapiRelaxed
  };
}