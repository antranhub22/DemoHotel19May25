import { logger } from '@shared/utils/logger';
import { DebugManager } from './DebugManager';
import { EmergencyStopManager } from './EmergencyStopManager';
import { CanvasRenderer, CanvasRenderState } from './CanvasRenderer';

export interface AnimationState {
  pulsePhase: number;
  waveformPhase: number;
  gradientRotation: number;
  elapsedTime: number;
  displayedTime: number;
  timeTarget: number;
  idleFrame: number;
  idleFlash: number;
  lastActiveTime: number;
  animationFrameId: number;
}

export class AnimationController {
  private state: AnimationState;
  private debug: DebugManager;
  private emergency: EmergencyStopManager;
  private renderer: CanvasRenderer;
  private isRunning: boolean = false;

  constructor(
    debug: DebugManager,
    emergency: EmergencyStopManager,
    renderer: CanvasRenderer
  ) {
    this.debug = debug;
    this.emergency = emergency;
    this.renderer = renderer;

    this.state = {
      pulsePhase: 0,
      waveformPhase: 0,
      gradientRotation: 0,
      elapsedTime: 0,
      displayedTime: 0,
      timeTarget: 60,
      idleFrame: 0,
      idleFlash: 0,
      lastActiveTime: Date.now(),
      animationFrameId: 0,
    };
  }

  /**
   * Start the animation loop
   */
  public start(): void {
    if (this.isRunning) {
      this.debug.warn('Animation already running');
      return;
    }

    this.debug.log('Starting animation loop');
    this.isRunning = true;
    this.emergency.clearEmergencyStop();
    this.animate();
  }

  /**
   * Stop the animation loop
   */
  public stop(): void {
    if (!this.isRunning) {
      this.debug.warn('Animation already stopped');
      return;
    }

    this.debug.log('Stopping animation loop');
    this.isRunning = false;

    if (this.state.animationFrameId) {
      cancelAnimationFrame(this.state.animationFrameId);
      this.state.animationFrameId = 0;
    }
  }

  /**
   * Main animation loop
   */
  private animate = (): void => {
    // Emergency stop check
    if (this.emergency.shouldSkipAnimation()) {
      this.debug.warn('Animation stopped due to emergency stop');
      this.stop();
      return;
    }

    if (!this.isRunning) {
      this.debug.log('Animation stopped by external request');
      return;
    }

    this.debug.debug('🔍 [AnimationController] Animation frame start');

    // Update animation phases
    this.updateAnimationPhases();

    // Request next frame first, before any potential errors
    if (this.isRunning && !this.emergency.isEmergencyStopRequested()) {
      this.state.animationFrameId = requestAnimationFrame(this.animate);
    }
  };

  /**
   * Update all animation phase values
   */
  private updateAnimationPhases(): void {
    // Update pulse phase for breathing effect
    this.state.pulsePhase += 0.05;

    // Update waveform for audio visualization
    this.state.waveformPhase += 0.08;

    // Update gradient rotation for shimmer effects
    this.state.gradientRotation += 0.02;
    if (this.state.gradientRotation > Math.PI * 2) {
      this.state.gradientRotation -= Math.PI * 2;
    }

    // Update idle flash animation
    this.state.idleFlash += 0.08;

    // Update idle frame counter
    this.state.idleFrame++;

    // Update elapsed time display animation
    this.updateTimeDisplay();
  }

  /**
   * Update time display with smooth animation
   */
  private updateTimeDisplay(): void {
    // Animate displayedTime for smooth counting
    this.state.displayedTime +=
      (this.state.elapsedTime - this.state.displayedTime) * 0.18;
  }

  /**
   * Trigger rendering with current animation state
   */
  public render(renderState: CanvasRenderState): void {
    if (this.emergency.shouldSkipAnimation()) {
      return;
    }

    // Merge animation state with render state
    const completeState: CanvasRenderState = {
      ...renderState,
      ...this.state,
    };

    // Safe rendering operation
    this.emergency.safeCanvasOperation(
      () => {
        this.renderer.renderAll(completeState);
        return true;
      },
      () => {
        this.renderer.drawFallbackCircle(completeState);
        return false;
      },
      'render'
    );
  }

  /**
   * Add new ripple effect
   */
  public addRipple(
    ripples: Array<{ radius: number; alpha: number; speed: number }>,
    radius: number,
    volumeLevel: number
  ): void {
    if (Math.random() < 0.1) {
      // 10% chance per frame when listening
      ripples.push({
        radius,
        alpha: 0.4,
        speed: 1 + volumeLevel * 2,
      });
    }
  }

  /**
   * Add new particle effect
   */
  public addParticle(
    particles: Array<{
      x: number;
      y: number;
      alpha: number;
      size: number;
      speed: number;
    }>,
    centerX: number,
    centerY: number,
    radius: number
  ): void {
    if (Math.random() < 0.05) {
      // 5% chance per frame
      const angle = Math.random() * Math.PI * 2;
      const distance = radius + Math.random() * 20;

      particles.push({
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        alpha: 0.8,
        size: 2 + Math.random() * 3,
        speed: 0.5 + Math.random() * 1,
      });
    }
  }

  /**
   * Update volume level for visual effects
   */
  public setVolumeLevel(level: number): void {
    // Smooth volume level changes
    const targetLevel = Math.max(0, Math.min(1, level));
    // Implement smooth interpolation if needed
  }

  /**
   * Mark user activity to reset idle timers
   */
  public markActivity(): void {
    this.state.lastActiveTime = Date.now();
    this.debug.debug('User activity marked');
  }

  /**
   * Set listening state for audio-reactive animations
   */
  public setListening(isListening: boolean): void {
    if (isListening) {
      this.markActivity();
    }
    this.debug.debug('Animation listening state:', isListening);
  }

  /**
   * Reset elapsed time
   */
  public resetTime(): void {
    this.state.elapsedTime = 0;
    this.state.displayedTime = 0;
    this.debug.log('Animation time reset');
  }

  /**
   * Update elapsed time
   */
  public updateElapsedTime(seconds: number): void {
    this.state.elapsedTime = seconds;
  }

  /**
   * Set time target for progress visualization
   */
  public setTimeTarget(target: number): void {
    this.state.timeTarget = target;
    this.debug.log('Animation time target set to:', target);
  }

  /**
   * Get current animation state for debugging
   */
  public getState(): AnimationState {
    return { ...this.state };
  }

  /**
   * Check if animation is currently running
   */
  public isAnimating(): boolean {
    return this.isRunning;
  }

  /**
   * Force restart animation (use with caution)
   */
  public forceRestart(): void {
    this.debug.warn('🔧 Force restarting animation');
    this.stop();

    // Small delay to ensure cleanup
    setTimeout(() => {
      this.start();
    }, 50);
  }

  /**
   * Cleanup animation resources
   */
  public cleanup(): void {
    this.debug.log('Cleaning up animation controller');
    this.stop();

    // Reset all state
    this.state = {
      pulsePhase: 0,
      waveformPhase: 0,
      gradientRotation: 0,
      elapsedTime: 0,
      displayedTime: 0,
      timeTarget: 60,
      idleFrame: 0,
      idleFlash: 0,
      lastActiveTime: Date.now(),
      animationFrameId: 0,
    };
  }
}
