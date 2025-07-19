export type DebugLevel = 0 | 1 | 2; // 0: off, 1: errors only, 2: all

export class DebugManager {
  private static DEBUG_LEVEL: DebugLevel = process.env.NODE_ENV === 'development' ? 1 : 0;

  /**
   * Set the global debug level
   */
  public static setDebugLevel(level: DebugLevel): void {
    DebugManager.DEBUG_LEVEL = level;
    console.log(`[DebugManager] Debug level set to: ${level} (0: off, 1: errors only, 2: all)`);
  }

  /**
   * Get the current debug level
   */
  public static getDebugLevel(): DebugLevel {
    return DebugManager.DEBUG_LEVEL;
  }

  /**
   * Log debug messages (level 2 only)
   */
  public log(message: string, ...args: any[]): void {
    if (DebugManager.DEBUG_LEVEL >= 2) {
      console.log(`[SiriButton] ${message}`, ...args);
    }
  }

  /**
   * Log debug messages with explicit prefix
   */
  public debug(message: string, ...args: any[]): void {
    if (DebugManager.DEBUG_LEVEL >= 2) {
      console.log(`[SiriButton] ${message}`, ...args);
    }
  }

  /**
   * Log warning messages (level 1+)
   */
  public warn(message: string, ...args: any[]): void {
    if (DebugManager.DEBUG_LEVEL >= 1) {
      console.warn(`[SiriButton] ${message}`, ...args);
    }
  }

  /**
   * Log warning messages with explicit prefix
   */
  public debugWarn(message: string, ...args: any[]): void {
    if (DebugManager.DEBUG_LEVEL >= 1) {
      console.warn(`[SiriButton] ${message}`, ...args);
    }
  }

  /**
   * Log error messages (always shown)
   */
  public error(message: string, ...args: any[]): void {
    console.error(`[SiriButton] ${message}`, ...args);
  }

  /**
   * Log error messages with explicit prefix
   */
  public debugError(message: string, ...args: any[]): void {
    console.error(`[SiriButton] ${message}`, ...args);
  }

  /**
   * Quick debug helpers
   */
  public silent(): void {
    DebugManager.setDebugLevel(0);
  }

  public errorsOnly(): void {
    DebugManager.setDebugLevel(1);
  }

  public verbose(): void {
    DebugManager.setDebugLevel(2);
  }
}

/**
 * Global browser console controls for debugging
 */
if (typeof window !== 'undefined') {
  (window as any).SiriDebugControls = {
    setLevel: (level: DebugLevel) => {
      DebugManager.setDebugLevel(level);
      console.log(`🔧 Voice debug level set to: ${level}`);
    },
    getLevel: () => DebugManager.getDebugLevel(),
    silent: () => DebugManager.setDebugLevel(0),
    errorsOnly: () => DebugManager.setDebugLevel(1), 
    verbose: () => DebugManager.setDebugLevel(2),
    help: () => {
      console.log(`
🔧 SiriDebugControls Help:
- SiriDebugControls.silent()     -> Turn off all debug logs
- SiriDebugControls.errorsOnly() -> Show errors + warnings only  
- SiriDebugControls.verbose()    -> Show all debug logs
- SiriDebugControls.setLevel(n)  -> Set level manually (0-2)
- SiriDebugControls.getLevel()   -> Check current level
      `);
    }
  };
  
  // Quick shortcuts
  (window as any).voiceDebugOff = () => DebugManager.setDebugLevel(0);
  (window as any).voiceDebugOn = () => DebugManager.setDebugLevel(2);
} 