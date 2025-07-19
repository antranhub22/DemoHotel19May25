import { DebugManager } from './DebugManager';

export interface EmergencyState {
  emergencyStopRequested: boolean;
  resizeInProgress: boolean;
  lastResizeTime: number;
  maxResizeAttempts: number;
  resizeAttemptCount: number;
  canvasValid: boolean;
}

export class EmergencyStopManager {
  private state: EmergencyState;
  private debug: DebugManager;
  private canvas: HTMLCanvasElement | null;
  private ctx: CanvasRenderingContext2D | null;

  constructor(debug: DebugManager) {
    this.debug = debug;
    this.canvas = null;
    this.ctx = null;
    
    this.state = {
      emergencyStopRequested: false,
      resizeInProgress: false,
      lastResizeTime: 0,
      maxResizeAttempts: 5,
      resizeAttemptCount: 0,
      canvasValid: true
    };
  }

  /**
   * Set canvas references for validation
   */
  public setCanvasReferences(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    this.canvas = canvas;
    this.ctx = ctx;
    this.state.canvasValid = true;
  }

  /**
   * Check if emergency stop has been requested
   */
  public isEmergencyStopRequested(): boolean {
    return this.state.emergencyStopRequested;
  }

  /**
   * Trigger emergency stop
   */
  public triggerEmergencyStop(): void {
    this.debug.warn('🚨 EMERGENCY STOP TRIGGERED');
    this.state.emergencyStopRequested = true;
    this.state.canvasValid = false;
  }

  /**
   * Clear emergency stop state
   */
  public clearEmergencyStop(): void {
    this.debug.log('✅ Emergency stop cleared');
    this.state.emergencyStopRequested = false;
    this.validateCanvas(); // Revalidate canvas
  }

  /**
   * Validate canvas and context are still valid
   */
  public validateCanvas(): boolean {
    if (!this.canvas || !this.ctx) {
      this.debug.error('Canvas or context invalid');
      this.state.canvasValid = false;
      return false;
    }
    
    if (!this.canvas.parentElement || !document.contains(this.canvas)) {
      this.debug.error('Canvas not in DOM');
      this.state.canvasValid = false;
      return false;
    }
    
    // Check if canvas has valid dimensions
    if (this.canvas.width === 0 || this.canvas.height === 0) {
      this.debug.warn('Canvas has zero dimensions');
      this.state.canvasValid = false;
      return false;
    }
    
    this.state.canvasValid = true;
    return true;
  }

  /**
   * Check if canvas is currently valid
   */
  public isCanvasValid(): boolean {
    return this.state.canvasValid;
  }

  /**
   * Check if it's safe to perform resize operations
   */
  public canSafeResize(): boolean {
    const now = Date.now();
    
    // Prevent too frequent resize attempts
    if (this.state.resizeInProgress) {
      this.debug.warn('Resize already in progress, skipping');
      return false;
    }
    
    // Prevent resize if too many recent attempts
    if (now - this.state.lastResizeTime < 100) {
      this.debug.warn('Resize attempted too recently, skipping');
      return false;
    }
    
    // Check resize attempt limits
    if (this.state.resizeAttemptCount >= this.state.maxResizeAttempts) {
      this.debug.error('Maximum resize attempts reached, stopping');
      this.triggerEmergencyStop();
      return false;
    }
    
    return true;
  }

  /**
   * Start a safe resize operation
   */
  public startResize(): boolean {
    if (!this.canSafeResize()) {
      return false;
    }
    
    this.state.resizeInProgress = true;
    this.state.lastResizeTime = Date.now();
    this.state.resizeAttemptCount++;
    
    this.debug.log(`Starting resize attempt ${this.state.resizeAttemptCount}/${this.state.maxResizeAttempts}`);
    return true;
  }

  /**
   * Finish a resize operation
   */
  public finishResize(success: boolean): void {
    this.state.resizeInProgress = false;
    
    if (success) {
      this.debug.log('Resize completed successfully');
      // Reset attempt count on success
      this.state.resizeAttemptCount = 0;
    } else {
      this.debug.warn('Resize failed');
      
      // If we've hit max attempts, trigger emergency stop
      if (this.state.resizeAttemptCount >= this.state.maxResizeAttempts) {
        this.debug.error('Max resize attempts reached, triggering emergency stop');
        this.triggerEmergencyStop();
      }
    }
  }

  /**
   * Reset resize attempt counter
   */
  public resetResizeAttempts(): void {
    this.state.resizeAttemptCount = 0;
    this.debug.log('Resize attempt counter reset');
  }

  /**
   * Execute a safe operation with error handling
   */
  public safeExecute<T>(
    operation: () => T,
    fallback: () => T,
    operationName: string
  ): T {
    try {
      if (this.state.emergencyStopRequested) {
        this.debug.warn(`Operation ${operationName} skipped due to emergency stop`);
        return fallback();
      }
      
      return operation();
    } catch (error) {
      this.debug.error(`Operation ${operationName} failed:`, error);
      
      try {
        return fallback();
      } catch (fallbackError) {
        this.debug.error(`Fallback for ${operationName} also failed:`, fallbackError);
        this.triggerEmergencyStop();
        throw fallbackError;
      }
    }
  }

  /**
   * Execute a safe canvas operation
   */
  public safeCanvasOperation<T>(
    operation: () => T,
    fallback: () => T,
    operationName: string
  ): T {
    if (!this.validateCanvas()) {
      this.debug.warn(`Canvas operation ${operationName} skipped - canvas invalid`);
      return fallback();
    }
    
    return this.safeExecute(operation, fallback, operationName);
  }

  /**
   * Set default fallback dimensions when resize fails
   */
  public setFallbackDimensions(): { width: number; height: number; centerX: number; centerY: number; radius: number } {
    try {
      const dimensions = {
        width: 300,
        height: 300,
        centerX: 150,
        centerY: 150,
        radius: 100
      };
      
      if (this.canvas) {
        this.canvas.width = dimensions.width;
        this.canvas.height = dimensions.height;
        this.canvas.style.width = `${dimensions.width}px`;
        this.canvas.style.height = `${dimensions.height}px`;
      }
      
      this.debug.warn('Using fallback dimensions due to resize failure');
      return dimensions;
    } catch (error) {
      this.debug.error('Failed to set fallback dimensions:', error);
      this.triggerEmergencyStop();
      throw error;
    }
  }

  /**
   * Get current emergency state for debugging
   */
  public getState(): EmergencyState {
    return { ...this.state };
  }

  /**
   * Check if we should skip animation frame
   */
  public shouldSkipAnimation(): boolean {
    return this.state.emergencyStopRequested || !this.state.canvasValid;
  }

  /**
   * Force reset all emergency states (use with caution)
   */
  public forceReset(): void {
    this.debug.warn('🔧 Force resetting emergency state');
    this.state = {
      emergencyStopRequested: false,
      resizeInProgress: false,
      lastResizeTime: 0,
      maxResizeAttempts: 5,
      resizeAttemptCount: 0,
      canvasValid: true
    };
  }
} 