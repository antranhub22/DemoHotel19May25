import { logger } from '@shared/utils/logger';
import {
  DebugManager,
  EmergencyStopManager,
  CanvasRenderer,
  AnimationController,
  DimensionsManager,
  StateManager,
  type CanvasRenderState,
  type DimensionsState,
  type ExternalVisualState,
} from './modules';

export interface SiriButtonColors {
  primary: string;
  secondary: string;
  glow: string;
  name: string;
}

/**
 * SiriButton - Modular Architecture
 *
 * Orchestrates multiple specialized modules to create a responsive,
 * animated voice assistant button with robust error handling.
 *
 * This is a complete rewrite using the modular architecture pattern,
 * maintaining full backward compatibility with the original API.
 */
export class SiriButton {
  // Module instances
  private debug: DebugManager;
  private emergency: EmergencyStopManager;
  private renderer: CanvasRenderer;
  private animation: AnimationController;
  private dimensions: DimensionsManager;
  private state: StateManager;

  // Canvas references
  private canvas!: any; // HTMLCanvasElement
  private ctx!: any; // CanvasRenderingContext2D

  // Current state
  private currentDimensions!: DimensionsState;
  private isInitialized: boolean = false;

  constructor(containerId: string, colors?: SiriButtonColors) {
    // Initialize modules
    this.debug = new DebugManager();
    this.emergency = new EmergencyStopManager(this.debug);
    this.renderer = new CanvasRenderer(null as any, this.debug); // Will set context later
    this.animation = new AnimationController(
      this.debug,
      this.emergency,
      this.renderer
    );
    this.dimensions = new DimensionsManager(this.debug, this.emergency);
    this.state = new StateManager(this.debug);

    this.debug.log('🚀 [SiriButton] Modular architecture initializing...');
    this.debug.log('  📦 Container ID:', containerId);

    // Set colors if provided
    if (colors) {
      this.state.setColorScheme(colors);
      this.debug.log('  🎨 Custom colors applied:', colors);
    } else {
      // Use default colors
      this.state.setColorScheme({
        primary: '#5DB6B9',
        secondary: '#E8B554',
        glow: 'rgba(93, 182, 185, 0.4)',
        name: 'English',
      });
    }

    // Enhanced mobile debug info
    const deviceInfo = {
      userAgent: navigator.userAgent,
      isMobile:
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ),
      isTouch: 'ontouchstart' in window,
      screen: {
        width: (window as any).screen?.width || 375,
        height: (window as any).screen?.height || 667,
        devicePixelRatio: window.devicePixelRatio,
      },
    };

    this.debug.log('🔍 [SiriButton] DEVICE INFO:', deviceInfo);

    // Initialize canvas and setup
    this.initializeCanvas(containerId);
    this.setupModules();
    this.startSystems();

    this.debug.log('✅ [SiriButton] Modular initialization completed');
  }

  /**
   * Initialize canvas element and context
   */
  private initializeCanvas(containerId: string): void {
    this.debug.log(
      '🎨 [SiriButton] Initializing canvas for container:',
      containerId
    );

    // Find container
    const container = document.getElementById(containerId);
    if (!container) {
      this.debug.error(
        '❌ [SiriButton] Container element not found:',
        containerId
      );
      throw new Error(`Container element not found: ${containerId}`);
    }

    // Create canvas
    this.canvas = document.createElement('canvas');

    // Set canvas styles for proper display
    this.canvas.style.position = 'absolute';
    this.canvas.style.inset = '2px';
    this.canvas.style.borderRadius = '50%';
    this.canvas.style.display = 'block';
    this.canvas.style.background = 'transparent';
    this.canvas.style.zIndex = '1';
    this.canvas.style.pointerEvents = 'none'; // Let container handle events

    // Add debug attributes
    this.canvas.setAttribute('data-siri-canvas', 'true');
    this.canvas.setAttribute(
      'data-mobile-debug',
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
        ? 'mobile'
        : 'desktop'
    );
    this.canvas.id = `${containerId}-canvas`;

    // Append to container
    container.appendChild(this.canvas);

    // Get context
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      this.debug.error('❌ [SiriButton] Could not get canvas context');
      throw new Error('Could not get canvas context');
    }
    this.ctx = ctx;

    this.debug.log('✅ [SiriButton] Canvas created and context obtained');

    // Debug canvas verification
    setTimeout(() => {
      this.debug.debug('🔍 [SiriButton] CANVAS VERIFICATION:');
      this.debug.debug('  🎨 Canvas in DOM:', document.contains(this.canvas));
      this.debug.debug(
        '  🎨 Canvas rect:',
        this.canvas.getBoundingClientRect()
      );
    }, 200);
  }

  /**
   * Setup module cross-references and configuration
   */
  private setupModules(): void {
    this.debug.log('🔧 [SiriButton] Setting up module configuration...');

    // Configure emergency manager with canvas
    this.emergency.setCanvasReferences(this.canvas, this.ctx);

    // Configure dimensions manager with canvas
    this.dimensions.setCanvas(this.canvas);

    // Configure renderer with context
    (this.renderer as any).ctx = this.ctx;

    // Setup resize listener
    this.dimensions.setupResizeListener();

    this.debug.log('✅ [SiriButton] Module configuration completed');
  }

  /**
   * Start all systems and begin animation
   */
  private startSystems(): void {
    this.debug.log('🚀 [SiriButton] Starting systems...');

    // Initialize dimensions
    this.currentDimensions = this.dimensions.initialize();

    // Perform initial resize
    setTimeout(() => {
      this.currentDimensions = this.dimensions.safeResize();
      this.debug.log('📐 Initial resize completed:', this.currentDimensions);

      // Start animation loop
      this.animation.start();

      // Force initial render
      this.renderFrame();

      this.isInitialized = true;
      this.debug.log('✅ [SiriButton] All systems started');
    }, 100);

    // Additional resize for mobile compatibility
    setTimeout(() => {
      this.currentDimensions = this.dimensions.safeResize();
      this.renderFrame();
      this.debug.log('📱 [SiriButton] Mobile compatibility resize completed');
    }, 300);
  }

  /**
   * Render a single frame using current state
   */
  private renderFrame(): void {
    if (!this.isInitialized || this.emergency.shouldSkipAnimation()) {
      return;
    }

    // Get current visual state
    const visualState = this.state.getRenderState();

    // Create complete render state
    const renderState: CanvasRenderState = {
      ...this.currentDimensions,
      ...visualState,
      ...this.animation.getState(),
    };

    // Trigger rendering
    this.animation.render(renderState);
  }

  // =====================================================
  // PUBLIC API - Maintaining backward compatibility
  // =====================================================

  /**
   * Update color scheme dynamically
   */
  public updateColors(colors: SiriButtonColors): void {
    this.state.setColorScheme(colors);
    this.debug.log('🎨 [SiriButton] Colors updated:', colors);
  }

  /**
   * Set global debug level
   */
  public static setDebugLevel(level: 0 | 1 | 2): void {
    DebugManager.setDebugLevel(level);
  }

  /**
   * Get current debug level
   */
  public static getDebugLevel(): number {
    return DebugManager.getDebugLevel();
  }

  /**
   * Trigger emergency stop
   */
  public emergencyStopPublic(): void {
    this.emergency.triggerEmergencyStop();
    this.animation.stop();
    this.debug.warn('[SiriButton] Emergency stop triggered via public API');
  }

  /**
   * Set listening state for audio visualization
   */
  public setListening(listening: boolean): void {
    this.state.setListening(listening);
    this.animation.setListening(listening);
    this.debug.log('🎤 [SiriButton] Listening state:', listening);
  }

  /**
   * Update volume level for visualizations
   */
  public setVolumeLevel(level: number): void {
    this.state.setVolumeLevel(level);
    this.animation.setVolumeLevel(level);
  }

  /**
   * Set elapsed time and target for progress display
   */
  public setTime(seconds: number, target: number = 60): void {
    this.animation.updateElapsedTime(seconds);
    this.animation.setTimeTarget(target);
  }

  /**
   * Get current time information
   */
  public getTime(): { elapsed: number; target: number } {
    const animState = this.animation.getState();
    return {
      elapsed: animState.elapsedTime,
      target: animState.timeTarget,
    };
  }

  /**
   * Set interaction mode for visual feedback
   */
  public setInteractionMode(mode: 'hover' | 'active' | 'idle'): void {
    const externalState: ExternalVisualState = {
      isHovered: mode === 'hover',
      isActive: mode === 'active',
    };

    this.state.updateExternalState(externalState);
    this.animation.markActivity();

    this.debug.debug('👆 [SiriButton] Interaction mode:', mode);
  }

  /**
   * Update touch/mouse position
   */
  public setTouchPosition(x: number, y: number): void {
    this.state.setMousePosition(x, y);
    this.state.updateExternalState({ mousePosition: { x, y } });
  }

  /**
   * Update visual state from external controllers
   */
  public updateVisualState(newState: {
    isHovered?: boolean;
    isActive?: boolean;
    mousePosition?: { x: number; y: number };
  }): void {
    this.state.updateExternalState(newState);
    this.animation.markActivity();
  }

  /**
   * Cleanup all resources and stop systems
   */
  public cleanup(): void {
    this.debug.log('🧹 [SiriButton] Cleaning up modular components...');

    // Stop systems
    this.animation.stop();

    // Cleanup modules
    this.animation.cleanup();
    this.dimensions.cleanup();
    this.state.reset();

    // Remove canvas safely
    if (
      this.canvas &&
      this.canvas.parentElement &&
      document.contains(this.canvas)
    ) {
      try {
        this.canvas.parentElement.removeChild(this.canvas);
        this.debug.log('✅ [SiriButton] Canvas removed successfully');
      } catch (error) {
        this.debug.warn('[SiriButton] Error removing canvas:', error);
      }
    }

    // Clear references
    this.canvas = null as any;
    this.ctx = null as any;
    this.isInitialized = false;

    this.debug.log('✅ [SiriButton] Cleanup completed');
  }
}

// =====================================================
// GLOBAL DEBUG CONTROLS - Browser console integration
// =====================================================

if (typeof window !== 'undefined') {
  // Expose debug controls globally (same as original)
  (window as any).SiriDebugControls = {
    setLevel: (level: 0 | 1 | 2) => {
      SiriButton.setDebugLevel(level);
      logger.debug('🔧 Voice debug level set to: ${level}', 'Component');
    },
    getLevel: () => SiriButton.getDebugLevel(),
    silent: () => SiriButton.setDebugLevel(0),
    errorsOnly: () => SiriButton.setDebugLevel(1),
    verbose: () => SiriButton.setDebugLevel(2),
    help: () => {
      logger.debug([
        '🔧 SiriDebugControls Help:',
        '- SiriDebugControls.silent()     -> Turn off all debug logs',
        '- SiriDebugControls.errorsOnly() -> Show errors + warnings only',
        '- SiriDebugControls.verbose()    -> Show all debug logs',
        '- SiriDebugControls.setLevel(n)  -> Set level manually (0-2)',
        '- SiriDebugControls.getLevel()   -> Check current level',
        '',
        '🚀 NEW: Modular Architecture',
        '- Each module has independent debug logging',
        '- Better error isolation and reporting',
        '- Enhanced mobile debugging support'
      ].join('\n'), 'Component');
    },
  };

  // Quick shortcuts (same as original)
  (window as any).voiceDebugOff = () => SiriButton.setDebugLevel(0);
  (window as any).voiceDebugOn = () => SiriButton.setDebugLevel(2);
}
