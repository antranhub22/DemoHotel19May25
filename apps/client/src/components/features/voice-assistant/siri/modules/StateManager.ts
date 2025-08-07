export interface VisualState {
  isListening: boolean;
  isHovered: boolean;
  isActive: boolean;
  volumeLevel: number;
  mouseX: number;
  mouseY: number;
  isDarkMode: boolean;
  colors: {
    primary: string;
    secondary: string;
    glow: string;
    name: string;
  };
  ripples: Array<{
    radius: number;
    alpha: number;
    speed: number;
  }>;
  particles: Array<{
    x: number;
    y: number;
    alpha: number;
    size: number;
    speed: number;
  }>;
}

export interface ExternalVisualState {
  isHovered?: boolean;
  isActive?: boolean;
  mousePosition?: { x: number; y: number };
}

// ✅ FIXED: Import missing types
import type { DebugManager } from './DebugManager.ts';

export class StateManager {
  private state: VisualState;
  private debug: DebugManager;

  constructor(debug: DebugManager) {
    this.debug = debug;

    // Initialize with default state
    this.state = {
      isListening: false,
      isHovered: false,
      isActive: false,
      volumeLevel: 0,
      mouseX: 0,
      mouseY: 0,
      isDarkMode: false,
      colors: {
        primary: '#60a5fa',
        secondary: '#34d399',
        glow: '#10b981',
        name: 'blue-green',
      },
      ripples: [],
      particles: [],
    };

    // Detect dark mode
    this.initializeDarkMode();
  }

  /**
   * Initialize dark mode detection
   */
  private initializeDarkMode(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.state.isDarkMode = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;

      // Listen for dark mode changes
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', e => {
          this.state.isDarkMode = e.matches;
          this.debug.log('Dark mode changed:', e.matches);
        });
    }
  }

  /**
   * Get current visual state
   */
  public getState(): VisualState {
    return { ...this.state };
  }

  /**
   * Update state from external input
   */
  public updateExternalState(newState: ExternalVisualState): void {
    let hasChanges = false;

    if (
      newState.isHovered !== undefined &&
      newState.isHovered !== this.state.isHovered
    ) {
      this.state.isHovered = newState.isHovered;
      hasChanges = true;
    }

    if (
      newState.isActive !== undefined &&
      newState.isActive !== this.state.isActive
    ) {
      this.state.isActive = newState.isActive;
      hasChanges = true;
    }

    if (newState.mousePosition) {
      this.state.mouseX = newState.mousePosition.x;
      this.state.mouseY = newState.mousePosition.y;
      hasChanges = true;
    }

    if (hasChanges) {
      this.debug.debug('External state updated:', newState);
    }
  }

  /**
   * Set listening state
   */
  public setListening(isListening: boolean): void {
    if (this.state.isListening !== isListening) {
      this.state.isListening = isListening;
      this.debug.log('Listening state changed:', isListening);
    }
  }

  /**
   * Update volume level
   */
  public setVolumeLevel(level: number): void {
    const normalizedLevel = Math.max(0, Math.min(1, level));
    if (this.state.volumeLevel !== normalizedLevel) {
      this.state.volumeLevel = normalizedLevel;
      this.debug.debug('Volume level updated:', normalizedLevel);
    }
  }

  /**
   * Set mouse position
   */
  public setMousePosition(x: number, y: number): void {
    this.state.mouseX = x;
    this.state.mouseY = y;
  }

  /**
   * Update colors dynamically
   */
  public updateColors(colors: Partial<VisualState['colors']>): void {
    this.state.colors = {
      ...this.state.colors,
      ...colors,
    };
    this.debug.log('Colors updated:', this.state.colors);
  }

  /**
   * Set complete color scheme
   */
  public setColorScheme(colors: VisualState['colors']): void {
    this.state.colors = { ...colors };
    this.debug.log('Color scheme set:', colors);
  }

  /**
   * Add ripple effect
   */
  public addRipple(
    radius: number,
    alpha: number = 0.4,
    speed: number = 1
  ): void {
    this.state.ripples.push({ radius, alpha, speed });
    this.debug.debug('Ripple added:', { radius, alpha, speed });
  }

  /**
   * Add particle effect
   */
  public addParticle(
    x: number,
    y: number,
    alpha: number = 0.8,
    size: number = 2,
    speed: number = 1
  ): void {
    this.state.particles.push({ x, y, alpha, size, speed });
    this.debug.debug('Particle added:', { x, y, alpha, size, speed });
  }

  /**
   * Clear all ripples
   */
  public clearRipples(): void {
    this.state.ripples = [];
    this.debug.debug('All ripples cleared');
  }

  /**
   * Clear all particles
   */
  public clearParticles(): void {
    this.state.particles = [];
    this.debug.debug('All particles cleared');
  }

  /**
   * Clear all effects
   */
  public clearAllEffects(): void {
    this.clearRipples();
    this.clearParticles();
    this.debug.log('All visual effects cleared');
  }

  /**
   * Get hover state
   */
  public isHovered(): boolean {
    return this.state.isHovered;
  }

  /**
   * Get active state
   */
  public isActive(): boolean {
    return this.state.isActive;
  }

  /**
   * Get listening state
   */
  public isListening(): boolean {
    return this.state.isListening;
  }

  /**
   * Get current volume level
   */
  public getVolumeLevel(): number {
    return this.state.volumeLevel;
  }

  /**
   * Get mouse position
   */
  public getMousePosition(): { x: number; y: number } {
    return { x: this.state.mouseX, y: this.state.mouseY };
  }

  /**
   * Get dark mode state
   */
  public isDarkMode(): boolean {
    return this.state.isDarkMode;
  }

  /**
   * Get current colors
   */
  public getColors(): VisualState['colors'] {
    return { ...this.state.colors };
  }

  /**
   * Get ripples array (for rendering)
   */
  public getRipples(): VisualState['ripples'] {
    return this.state.ripples;
  }

  /**
   * Get particles array (for rendering)
   */
  public getParticles(): VisualState['particles'] {
    return this.state.particles;
  }

  /**
   * Reset to initial state
   */
  public reset(): void {
    this.debug.log('Resetting visual state');

    const colors = this.state.colors; // Preserve colors
    const isDarkMode = this.state.isDarkMode; // Preserve dark mode

    this.state = {
      isListening: false,
      isHovered: false,
      isActive: false,
      volumeLevel: 0,
      mouseX: 0,
      mouseY: 0,
      isDarkMode,
      colors,
      ripples: [],
      particles: [],
    };
  }

  /**
   * Get state for animation rendering
   */
  public getRenderState(): Pick<
    VisualState,
    | 'isListening'
    | 'isHovered'
    | 'isActive'
    | 'volumeLevel'
    | 'mouseX'
    | 'mouseY'
    | 'isDarkMode'
    | 'colors'
    | 'ripples'
    | 'particles'
  > {
    return {
      isListening: this.state.isListening,
      isHovered: this.state.isHovered,
      isActive: this.state.isActive,
      volumeLevel: this.state.volumeLevel,
      mouseX: this.state.mouseX,
      mouseY: this.state.mouseY,
      isDarkMode: this.state.isDarkMode,
      colors: { ...this.state.colors },
      ripples: [...this.state.ripples],
      particles: [...this.state.particles],
    };
  }

  /**
   * Force update dark mode state
   */
  public forceUpdateDarkMode(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const wasDark = this.state.isDarkMode;
      this.state.isDarkMode = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;

      if (wasDark !== this.state.isDarkMode) {
        this.debug.log('Dark mode force updated:', this.state.isDarkMode);
      }
    }
  }
}
