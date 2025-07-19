export interface TouchCallbacks {
  onCallStart?: () => Promise<void>;
  onCallEnd?: () => void;
  onInteractionStart?: (position: { x: number; y: number }) => void;
  onInteractionEnd?: () => void;
}

export interface TouchHandlerConfig {
  containerId: string;
  isListening: boolean;
  enabled: boolean;
  debugEnabled?: boolean;
}

export class SimplifiedMobileTouchHandler {
  private element: HTMLElement | null = null;
  private callbacks: TouchCallbacks;
  private config: TouchHandlerConfig;
  private isProcessing = false;
  private touchStartTime = 0;
  private touchStartPosition: { x: number; y: number } | null = null;

  constructor(config: TouchHandlerConfig, callbacks: TouchCallbacks) {
    this.config = config;
    this.callbacks = callbacks;
    this.debug('SimplifiedMobileTouchHandler created', { config, callbacks });
  }

  public initialize(): boolean {
    this.cleanup(); // Ensure clean state

    this.element = document.getElementById(this.config.containerId);
    if (!this.element) {
      this.debugError('Container element not found:', this.config.containerId);
      return false;
    }

    // Add touch event listeners with simplified logic
    this.element.addEventListener('touchstart', this.handleTouchStart, { 
      passive: true // Don't interfere with scrolling
    });
    
    this.element.addEventListener('touchend', this.handleTouchEnd, { 
      passive: true // Don't prevent default - let browser handle it
    });
    
    this.element.addEventListener('touchcancel', this.handleTouchCancel, { 
      passive: true 
    });

    this.debug('Touch handlers initialized successfully', this.element);
    return true;
  }

  public cleanup(): void {
    if (!this.element) return;

    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
    this.element.removeEventListener('touchcancel', this.handleTouchCancel);
    
    this.debug('Touch handlers cleaned up');
  }

  public updateConfig(newConfig: Partial<TouchHandlerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.debug('Config updated', this.config);
  }

  public updateCallbacks(newCallbacks: Partial<TouchCallbacks>): void {
    this.callbacks = { ...this.callbacks, ...newCallbacks };
    this.debug('Callbacks updated', this.callbacks);
  }

  private handleTouchStart = (e: TouchEvent): void => {
    if (!this.config.enabled || this.isProcessing) {
      this.debug('Touch start ignored - disabled or processing');
      return;
    }

    this.touchStartTime = Date.now();
    
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = this.element!.getBoundingClientRect();
      
      this.touchStartPosition = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };

      this.debug('Touch start detected', {
        position: this.touchStartPosition,
        touchCount: e.touches.length,
        timestamp: this.touchStartTime
      });

      // Call interaction start callback
      if (this.callbacks.onInteractionStart && this.touchStartPosition) {
        this.callbacks.onInteractionStart(this.touchStartPosition);
      }
    }
  };

  private handleTouchEnd = async (e: TouchEvent): Promise<void> => {
    if (!this.config.enabled) {
      this.debug('Touch end ignored - disabled');
      return;
    }

    const touchDuration = Date.now() - this.touchStartTime;
    
    this.debug('Touch end detected', {
      duration: touchDuration,
      touchStartPosition: this.touchStartPosition,
      isListening: this.config.isListening,
      isProcessing: this.isProcessing,
      changedTouches: e.changedTouches.length
    });

    // Call interaction end callback
    if (this.callbacks.onInteractionEnd) {
      this.callbacks.onInteractionEnd();
    }

    // Only process if it's a valid tap (not too quick, not too long)
    if (touchDuration < 50 || touchDuration > 2000) {
      this.debug('Touch duration invalid, ignoring', { duration: touchDuration });
      return;
    }

    // Prevent double processing
    if (this.isProcessing) {
      this.debug('Already processing, ignoring touch end');
      return;
    }

    this.isProcessing = true;

    try {
      // Determine action based on current state
      if (!this.config.isListening) {
        // Start call
        if (this.callbacks.onCallStart) {
          this.debug('🟢 CALLING onCallStart()');
          await this.callbacks.onCallStart();
          this.debug('✅ onCallStart() completed successfully');
        } else {
          this.debugWarn('onCallStart callback not available');
        }
      } else {
        // End call
        if (this.callbacks.onCallEnd) {
          this.debug('🔴 CALLING onCallEnd()');
          this.callbacks.onCallEnd();
          this.debug('✅ onCallEnd() completed successfully');
        } else {
          this.debugWarn('onCallEnd callback not available');
        }
      }
    } catch (error) {
      this.debugError('Error in touch end handler:', error);
    } finally {
      // Reset processing flag after a short delay
      setTimeout(() => {
        this.isProcessing = false;
        this.debug('Processing flag reset');
      }, 100);
    }
  };

  private handleTouchCancel = (e: TouchEvent): void => {
    this.debug('Touch cancelled', e);
    
    // Reset state
    this.touchStartTime = 0;
    this.touchStartPosition = null;
    
    // Call interaction end callback
    if (this.callbacks.onInteractionEnd) {
      this.callbacks.onInteractionEnd();
    }
  };

  private debug(message: string, ...args: any[]): void {
    if (this.config.debugEnabled) {
      console.log(`[SimplifiedMobileTouchHandler] ${message}`, ...args);
    }
  }

  private debugWarn(message: string, ...args: any[]): void {
    if (this.config.debugEnabled) {
      console.warn(`[SimplifiedMobileTouchHandler] ${message}`, ...args);
    }
  }

  private debugError(message: string, ...args: any[]): void {
    // Always show errors
    console.error(`[SimplifiedMobileTouchHandler] ${message}`, ...args);
  }

  // Public getters for debugging
  public getState() {
    return {
      isProcessing: this.isProcessing,
      touchStartTime: this.touchStartTime,
      touchStartPosition: this.touchStartPosition,
      elementFound: !!this.element,
      config: this.config
    };
  }
} 