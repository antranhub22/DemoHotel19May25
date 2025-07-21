import { DebugManager } from './DebugManager';
import { EmergencyStopManager } from './EmergencyStopManager';
import { logger } from '@shared/utils/logger';

export interface DimensionsState {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  radius: number;
}

export class DimensionsManager {
  private debug: DebugManager;
  private emergency: EmergencyStopManager;
  private canvas: HTMLCanvasElement | null = null;
  private resizeTimeout: number | null = null;
  private debouncedResize: () => void;

  constructor(debug: DebugManager, emergency: EmergencyStopManager) {
    this.debug = debug;
    this.emergency = emergency;

    // Create debounced resize function
    this.debouncedResize = this.debounce(() => {
      this.safeResize();
    }, 150);
  }

  /**
   * Set canvas reference for dimension management
   */
  public setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.debug.log('Canvas reference set for dimensions manager');
  }

  /**
   * Initialize with default dimensions
   */
  public initialize(): DimensionsState {
    const initialState = {
      width: 400,
      height: 400,
      centerX: 200,
      centerY: 200,
      radius: 180,
    };

    this.debug.log('Dimensions initialized:', initialState);
    return initialState;
  }

  /**
   * Calculate dimensions based on container
   */
  public calculateDimensions(): DimensionsState {
    if (!this.canvas || !this.canvas.parentElement) {
      this.debug.warn(
        'Canvas or container not available, using fallback dimensions'
      );
      return this.emergency.setFallbackDimensions();
    }

    try {
      const container = this.canvas.parentElement;
      const containerRect = container.getBoundingClientRect();

      this.debug.debug('Container dimensions:', {
        width: containerRect.width,
        height: containerRect.height,
      });

      // Calculate optimal canvas size
      const width = Math.max(200, containerRect.width || 400);
      const height = Math.max(200, containerRect.height || 400);
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.max(60, Math.min(width, height) * 0.35);

      const dimensions = { width, height, centerX, centerY, radius };

      this.debug.log('Calculated dimensions:', dimensions);
      return dimensions;
    } catch (error) {
      this.debug.error('Error calculating dimensions:', error);
      return this.emergency.setFallbackDimensions();
    }
  }

  /**
   * Apply dimensions to canvas
   */
  public applyDimensions(dimensions: DimensionsState): boolean {
    if (!this.canvas) {
      this.debug.error('Cannot apply dimensions - no canvas reference');
      return false;
    }

    try {
      // Set canvas internal dimensions
      this.canvas.width = dimensions.width;
      this.canvas.height = dimensions.height;

      // Set canvas CSS dimensions
      this.canvas.style.width = `${dimensions.width}px`;
      this.canvas.style.height = `${dimensions.height}px`;

      this.debug.log('Dimensions applied successfully:', dimensions);
      return true;
    } catch (error) {
      this.debug.error('Error applying dimensions:', error);
      return false;
    }
  }

  /**
   * Perform safe resize operation
   */
  public safeResize(): DimensionsState {
    this.debug.log('🔍 [DimensionsManager] Starting safe resize');

    // Check if resize is safe to perform
    if (!this.emergency.startResize()) {
      this.debug.warn('Resize operation blocked by emergency manager');
      return this.emergency.setFallbackDimensions();
    }

    try {
      // Calculate new dimensions
      const dimensions = this.calculateDimensions();

      // Apply dimensions to canvas
      const success = this.applyDimensions(dimensions);

      // Notify emergency manager of result
      this.emergency.finishResize(success);

      if (success) {
        this.debug.log('Resize completed successfully');
        return dimensions;
      } else {
        this.debug.warn('Resize failed, using fallback');
        return this.emergency.setFallbackDimensions();
      }
    } catch (error) {
      this.debug.error('Resize operation failed:', error);
      this.emergency.finishResize(false);
      return this.emergency.setFallbackDimensions();
    }
  }

  /**
   * Set up resize listener
   */
  public setupResizeListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.debouncedResize);
      this.debug.log('Resize listener attached');
    }
  }

  /**
   * Remove resize listener
   */
  public removeResizeListener(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.debouncedResize);
      this.debug.log('Resize listener removed');
    }
  }

  /**
   * Force immediate resize
   */
  public forceResize(): DimensionsState {
    this.debug.warn('🔧 Force resize triggered');

    // Clear any pending debounced resize
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = null;
    }

    return this.safeResize();
  }

  /**
   * Debounce utility function
   */
  private debounce(func: () => void, wait: number): () => void {
    return () => {
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }

      this.resizeTimeout = window.setTimeout(() => {
        this.resizeTimeout = null;
        func();
      }, wait);
    };
  }

  /**
   * Check if dimensions are valid
   */
  public validateDimensions(dimensions: DimensionsState): boolean {
    const { width, height, radius } = dimensions;

    if (width <= 0 || height <= 0) {
      this.debug.error(
        'Invalid dimensions: width or height is zero or negative'
      );
      return false;
    }

    if (radius <= 0 || radius > Math.min(width, height) / 2) {
      this.debug.error(
        'Invalid radius: must be positive and fit within dimensions'
      );
      return false;
    }

    return true;
  }

  /**
   * Get optimal radius based on dimensions
   */
  public getOptimalRadius(width: number, height: number): number {
    return Math.max(60, Math.min(width, height) * 0.35);
  }

  /**
   * Update dimensions with validation
   */
  public updateDimensions(
    newDimensions: Partial<DimensionsState>,
    currentDimensions: DimensionsState
  ): DimensionsState {
    const updated = {
      ...currentDimensions,
      ...newDimensions,
    };

    // Recalculate center points if width/height changed
    if (
      newDimensions.width !== undefined ||
      newDimensions.height !== undefined
    ) {
      updated.centerX = updated.width / 2;
      updated.centerY = updated.height / 2;
    }

    // Recalculate radius if not explicitly provided
    if (
      newDimensions.radius === undefined &&
      (newDimensions.width !== undefined || newDimensions.height !== undefined)
    ) {
      updated.radius = this.getOptimalRadius(updated.width, updated.height);
    }

    if (!this.validateDimensions(updated)) {
      this.debug.warn('Invalid dimensions provided, keeping current state');
      return currentDimensions;
    }

    this.debug.log('Dimensions updated:', updated);
    return updated;
  }

  /**
   * Cleanup dimensions manager
   */
  public cleanup(): void {
    this.debug.log('Cleaning up dimensions manager');

    this.removeResizeListener();

    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = null;
    }

    this.canvas = null;
  }
}
