export class SiriButton {
  // 🔧 PHASE 2: DEBUG CONTROL - Emergency debug level control
  private static DEBUG_LEVEL = process.env.NODE_ENV === 'development' ? 1 : 0; // 0: off, 1: errors only, 2: all
  
  // 🚨 PHASE 1: EMERGENCY GUARDS - Prevent infinite loops and crashes
  private resizeInProgress = false;
  private lastResizeTime = 0;
  private emergencyStopRequested = false;
  private maxResizeAttempts = 5;
  private resizeAttemptCount = 0;
  private canvasValid = true;

  // 🔧 PHASE 2: Debug utility methods
  private debug(message: string, ...args: any[]) {
    if (SiriButton.DEBUG_LEVEL >= 2) {
      console.log(`[SiriButton] ${message}`, ...args);
    }
  }

  private debugWarn(message: string, ...args: any[]) {
    if (SiriButton.DEBUG_LEVEL >= 1) {
      console.warn(`[SiriButton] ${message}`, ...args);
    }
  }

  private debugError(message: string, ...args: any[]) {
    // Always show errors, even in production
    console.error(`[SiriButton] ${message}`, ...args);
  }

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private centerX: number;
  private centerY: number;
  private radius: number;
  private ripples: Array<{
    radius: number;
    alpha: number;
    speed: number;
  }>;
  private isListening: boolean;
  private pulsePhase: number;
  private volumeLevel: number;
  private animationFrameId: number;
  private gradientRotation: number = 0;
  private isHovered: boolean = false;
  private isActive: boolean = false;
  private waveformPhase: number = 0;
  private particles: Array<{x: number, y: number, alpha: number, size: number, speed: number}> = [];
  private mouseX: number = 0;
  private mouseY: number = 0;
  private isDarkMode: boolean = false;
  private elapsedTime: number = 0;
  private displayedTime: number = 0;
  private timeTarget: number = 60;
  private idleFrame: number = 0;
  private lastActiveTime: number = Date.now();
  private idleFlash: number = 0;
  private colors: {
    primary: string;
    secondary: string;
    glow: string;
    name: string;
  };
  private resizeTimeout: number | null = null;

  // Visual state interface for external control
  private visualState: {
    isHovered: boolean;
    isActive: boolean;
    mousePosition?: { x: number; y: number };
  } = {
    isHovered: false,
    isActive: false
  };

  // 🚨 PHASE 1: EMERGENCY METHODS - Canvas validation and safety
  private validateCanvas(): boolean {
    if (!this.canvas || !this.ctx) {
      this.debugError('Canvas or context invalid');
      this.canvasValid = false;
      return false;
    }
    
    if (!this.canvas.parentElement || !document.contains(this.canvas)) {
      this.debugError('Canvas not in DOM');
      this.canvasValid = false;
      return false;
    }
    
    this.canvasValid = true;
    return true;
  }

  private emergencyStop(): void {
    this.debugWarn('🚨 EMERGENCY STOP TRIGGERED');
    this.emergencyStopRequested = true;
    
    try {
      // Stop animation
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = 0;
      }
      
      // Clear timeouts
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = null;
      }
      
      // Reset flags
      this.resizeInProgress = false;
      
      this.debugWarn('🚨 EMERGENCY STOP COMPLETED');
    } catch (error) {
      this.debugError('Emergency stop failed:', error);
    }
  }

  // 🚨 PHASE 1: SAFE DEBOUNCED RESIZE - Prevent infinite loops
  private debouncedResize() {
    const now = Date.now();
    
    // 🚨 EMERGENCY: Check for resize spam
    if (this.resizeInProgress) {
      this.debugWarn('Resize already in progress, skipping');
      return;
    }
    
    if (now - this.lastResizeTime < 100) {
      this.debugWarn('Resize too frequent, skipping');
      return;
    }
    
    // 🚨 EMERGENCY: Check attempt count
    this.resizeAttemptCount++;
    if (this.resizeAttemptCount > this.maxResizeAttempts) {
      this.debugError('Too many resize attempts, triggering emergency stop');
      this.emergencyStop();
      return;
    }
    
    this.resizeInProgress = true;
    this.lastResizeTime = now;
    
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    
    this.resizeTimeout = window.setTimeout(() => {
      try {
        if (!this.emergencyStopRequested && this.validateCanvas()) {
          this.safeResize();
        }
      } catch (error) {
        this.debugError('Debounced resize failed:', error);
        this.emergencyStop();
      } finally {
        this.resizeInProgress = false;
        this.resizeTimeout = null;
        
        // Reset attempt count after successful resize
        setTimeout(() => {
          this.resizeAttemptCount = 0;
        }, 1000);
      }
    }, 50);
  }

  constructor(containerId: string, colors?: {
    primary: string;
    secondary: string;
    glow: string;
    name: string;
  }) {
    // Set default colors or use provided colors
    this.colors = colors || {
      primary: '#5DB6B9',
      secondary: '#E8B554',
      glow: 'rgba(93, 182, 185, 0.4)',
      name: 'English'
    };

    // 🔍 ENHANCED MOBILE DEBUG: Device detection and environment info
    const deviceInfo = {
      userAgent: navigator.userAgent,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      hasTouch: 'ontouchstart' in window,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      screen: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      devicePixelRatio: window.devicePixelRatio || 1
    };

            this.debug('🔍 [SiriButton] MOBILE DEBUG - CONSTRUCTOR START');
        this.debug('  📱 Device Info:', deviceInfo);
        this.debug('  🎨 Container ID:', containerId);
        this.debug('  🌈 Colors:', this.colors);

        this.debug('[SiriButton] Creating canvas for container:', containerId, 'with colors:', this.colors);

    // Create canvas element
    this.canvas = document.createElement('canvas');
    const container = document.getElementById(containerId);
    if (!container) {
      this.debugError('❌ [SiriButton] Container element not found:', containerId);
      throw new Error('Container element not found');
    }

    // 🔍 MOBILE DEBUG: Container verification
    this.debug('🔍 [SiriButton] CONTAINER VERIFICATION:');
    this.debug('  📦 Container found:', !!container);
    this.debug('  📦 Container tag:', container.tagName);
    this.debug('  📦 Container classes:', container.className);
    this.debug('  📦 Container computed style:', {
      display: getComputedStyle(container).display,
      position: getComputedStyle(container).position,
      width: getComputedStyle(container).width,
      height: getComputedStyle(container).height,
      visibility: getComputedStyle(container).visibility,
      opacity: getComputedStyle(container).opacity
    });
    
    // Set canvas styles immediately for proper display
    // 🔧 FIX 2: Use CSS-only positioning with reduced padding
    this.canvas.style.position = 'absolute';
    this.canvas.style.inset = '2px';           // ✅ Reduced from 4px to 2px for larger canvas
    this.canvas.style.borderRadius = '50%';
    this.canvas.style.display = 'block';
    this.canvas.style.background = 'transparent';
    this.canvas.style.zIndex = '1';            // Lower than container for proper event flow
    this.canvas.style.pointerEvents = 'none'; // Let container handle all events
    // ❌ REMOVED: top, left, transform for conflicts elimination
    
    // Add debug attributes
    this.canvas.setAttribute('data-siri-canvas', 'true');
    this.canvas.setAttribute('data-mobile-debug', deviceInfo.isMobile ? 'mobile' : 'desktop');
    this.canvas.id = `${containerId}-canvas`;
    
    container.appendChild(this.canvas);
    this.debug('✅ [SiriButton] Canvas appended to container:', container);

    // 🔍 MOBILE DEBUG: Canvas verification after append
    setTimeout(() => {
      this.debug('🔍 [SiriButton] CANVAS VERIFICATION:');
      this.debug('  🎨 Canvas in DOM:', document.contains(this.canvas));
      this.debug('  🎨 Canvas element:', this.canvas);
      this.debug('  🎨 Canvas parent:', this.canvas.parentElement);
      this.debug('  🎨 Canvas getBoundingClientRect:', this.canvas.getBoundingClientRect());
      this.debug('  🎨 Canvas computed style:', {
        display: getComputedStyle(this.canvas).display,
        position: getComputedStyle(this.canvas).position,
        width: getComputedStyle(this.canvas).width,
        height: getComputedStyle(this.canvas).height,
        visibility: getComputedStyle(this.canvas).visibility,
        opacity: getComputedStyle(this.canvas).opacity,
        zIndex: getComputedStyle(this.canvas).zIndex,
        transform: getComputedStyle(this.canvas).transform
      });
    }, 200);
    
    // Get context
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      this.debugError('[SiriButton] Could not get canvas context');
      throw new Error('Could not get canvas context');
    }
    this.ctx = ctx;
    
    // Initialize with larger default size
    this.width = 400;
    this.height = 400;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.radius = 180; // Larger initial radius
    this.ripples = [];
    this.isListening = false;
    this.pulsePhase = 0;
    this.volumeLevel = 0;
    this.animationFrameId = 0;

    // 🚨 PHASE 1: SAFE INITIALIZATION - Use safe resize methods
    setTimeout(() => {
      this.safeResize();
      this.debug('[SiriButton] Initial resize completed, canvas size:', this.canvas.width, 'x', this.canvas.height);
      
      // Force a test draw to ensure canvas is working
      this.debugDraw();
    }, 100);

    // Additional resize for mobile - sometimes needs more time
    setTimeout(() => {
      this.safeResize();
      this.debugDraw();
      this.debug('[SiriButton] Secondary resize for mobile compatibility');
    }, 300);

    // Start animation loop
    this.animate();

    // Add resize listener only
    window.addEventListener('resize', this.debouncedResize.bind(this));

    this.debug('[SiriButton] Visual engine initialized - NO EVENT HANDLING (controlled externally)');

    // Detect dark mode
    this.isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      this.isDarkMode = e.matches;
    });

    this.debug('[SiriButton] Constructor completed successfully');
  }

  // Debug method to test canvas drawing
  private debugDraw() {
    this.debug('[SiriButton] Debug draw - testing canvas');
    
    try {
      // Clear canvas
      this.ctx.clearRect(0, 0, this.width, this.height);
      
      // Draw a simple test circle to verify canvas is working
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, 50, 0, Math.PI * 2);
      this.ctx.fillStyle = this.colors.primary;
      this.ctx.fill();
      this.ctx.restore();
      
      this.debug('[SiriButton] Debug draw successful');
    } catch (error) {
      this.debugError('[SiriButton] Debug draw failed:', error);
    }
  }

  // Method to update colors dynamically
  public updateColors(colors: {
    primary: string;
    secondary: string;
    glow: string;
    name: string;
  }) {
    this.colors = colors;
    this.debug('[SiriButton] Colors updated:', colors);
  }

  // 🔧 PHASE 2: DEBUG CONTROL - Runtime debug level control
  public static setDebugLevel(level: 0 | 1 | 2) {
    SiriButton.DEBUG_LEVEL = level;
    console.log(`[SiriButton] Debug level set to: ${level} (0: off, 1: errors only, 2: all)`);
  }

  public static getDebugLevel(): number {
    return SiriButton.DEBUG_LEVEL;
  }

  // 🚨 PHASE 1: EMERGENCY CONTROL - Public emergency stop
  public emergencyStopPublic(): void {
    this.emergencyStop();
  }

  // 🚨 PHASE 1: SAFE RESIZE - Try-catch wrapper for resize operations
  private safeResize(): void {
    try {
      this.resize();
    } catch (error) {
      this.debugError('🚨 Resize operation failed:', error);
      this.setDefaultDimensions();
    }
  }

  // 🚨 PHASE 1: Set fallback dimensions when resize fails
  private setDefaultDimensions(): void {
    try {
      this.width = 300;
      this.height = 300;
      this.centerX = this.width / 2;
      this.centerY = this.height / 2;
      this.radius = 100;
      
      if (this.canvas) {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
      }
      
      this.debugWarn('Using fallback dimensions due to resize failure');
    } catch (error) {
      this.debugError('Failed to set default dimensions:', error);
    }
  }

  private resize() {
    this.debug('🔍 [SiriButton] RESIZE START - Fixed positioning');
    
    const container = document.getElementById(this.canvas.id.replace('-canvas', ''));
    if (!container) {
      this.debugWarn('⚠️ [SiriButton] No container found during resize');
      return;
    }

    // 🔧 CRITICAL FIX: Get container dimensions more reliably
    const containerRect = container.getBoundingClientRect();
    
    // Force reflow to ensure accurate measurements
    container.offsetHeight;
    
    // 🔧 NEW: Use container's actual rendered size instead of responsive calculations
    const containerWidth = Math.max(containerRect.width, 280); // Minimum fallback
    const containerHeight = Math.max(containerRect.height, 280); // Minimum fallback
    
    this.debug('[SiriButton] 🔧 FIXED RESIZE:');
    this.debug('  📦 Container rect:', containerRect.width, 'x', containerRect.height);
    this.debug('  🎯 Used dimensions:', containerWidth, 'x', containerHeight);
    
    // Validate dimensions
    if (containerWidth === 0 || containerHeight === 0) {
      this.debugError('❌ [SiriButton] Invalid container dimensions:', {
        width: containerWidth,
        height: containerHeight,
        containerRect
      });
      return;
    }
    
    // 🔧 FIX 2: Reduced canvas padding for better mobile display
    const CANVAS_PADDING = 2; // ✅ Reduced from 4px to 2px for larger canvas area
    const finalWidth = containerWidth - CANVAS_PADDING;
    const finalHeight = containerHeight - CANVAS_PADDING;
    
    // Update internal dimensions
    this.width = finalWidth;
    this.height = finalHeight;
    
    // Set physical canvas size with DPR
    const dpr = window.devicePixelRatio || 1;
    const physicalWidth = Math.floor(finalWidth * dpr);
    const physicalHeight = Math.floor(finalHeight * dpr);
    this.canvas.width = physicalWidth;
    this.canvas.height = physicalHeight;
    
    // 🔧 CRITICAL FIX: Use exact pixel dimensions to match internal dimensions
    this.canvas.style.width = `${finalWidth}px`;   // Exact match with this.width
    this.canvas.style.height = `${finalHeight}px`; // Exact match with this.height
    
    this.debug('  🎨 Canvas size:', finalWidth, 'x', finalHeight);
    this.debug('  🎨 Physical size:', physicalWidth, 'x', physicalHeight);
    
    // 🔧 FIX 2: CSS-only positioning with reduced padding
    this.canvas.style.position = 'absolute';
    this.canvas.style.inset = '2px';              // ✅ Reduced to 2px padding from all sides
    this.canvas.style.borderRadius = '50%';
    this.canvas.style.display = 'block';
    this.canvas.style.background = 'transparent';
    this.canvas.style.zIndex = '1';
    this.canvas.style.pointerEvents = 'none';
    
    // ✅ NO MORE COMPLEX REPOSITIONING NEEDED - CSS handles it perfectly
    
    // Scale context for high DPI
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    
    // Update center coordinates and radius
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.radius = Math.max(80, Math.min(finalWidth, finalHeight) * 0.35);
    
    this.debug('  🎯 Canvas center:', this.centerX, this.centerY);
    this.debug('  ⭕ Canvas radius:', this.radius);
  }

  // 🔧 NEW: Alignment verification method
  private verifyAlignment() {
    const container = document.getElementById(this.canvas.id.replace('-canvas', ''));
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const canvasRect = this.canvas.getBoundingClientRect();
    
    console.log('🔍 [SiriButton] ALIGNMENT VERIFICATION:');
    console.log('  📦 Container rect:', {
      x: containerRect.x.toFixed(2),
      y: containerRect.y.toFixed(2), 
      width: containerRect.width.toFixed(2),
      height: containerRect.height.toFixed(2),
      centerX: (containerRect.x + containerRect.width/2).toFixed(2),
      centerY: (containerRect.y + containerRect.height/2).toFixed(2)
    });
    console.log('  🎨 Canvas rect:', {
      x: canvasRect.x.toFixed(2),
      y: canvasRect.y.toFixed(2),
      width: canvasRect.width.toFixed(2), 
      height: canvasRect.height.toFixed(2),
      centerX: (canvasRect.x + canvasRect.width/2).toFixed(2),
      centerY: (canvasRect.y + canvasRect.height/2).toFixed(2)
    });
    
    // Calculate alignment offsets
    const containerCenterX = containerRect.x + containerRect.width/2;
    const containerCenterY = containerRect.y + containerRect.height/2;
    const canvasCenterX = canvasRect.x + canvasRect.width/2;
    const canvasCenterY = canvasRect.y + canvasRect.height/2;
    
    const offsetX = canvasCenterX - containerCenterX;
    const offsetY = canvasCenterY - containerCenterY;
    
    console.log('  🎯 Alignment offset:', {
      x: offsetX.toFixed(2),
      y: offsetY.toFixed(2),
      total: Math.sqrt(offsetX*offsetX + offsetY*offsetY).toFixed(2)
    });
    
    // Warning if misaligned
    if (Math.abs(offsetX) > 1 || Math.abs(offsetY) > 1) {
      console.warn('⚠️ [SiriButton] Canvas misaligned! Offset:', offsetX.toFixed(2), offsetY.toFixed(2));
    } else {
      console.log('✅ [SiriButton] Canvas perfectly aligned!');
    }
  }

  // 🔧 NEW: Mobile test draw method
  private mobileTestDraw() {
    console.log('🔍 [SiriButton] MOBILE TEST DRAW START');
    
    if (!this.canvas || !this.ctx) {
      console.error('❌ [SiriButton] Canvas or context not available for mobile test');
      return;
    }

    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw simple test circle to verify canvas works
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius * 0.8, 0, Math.PI * 2);
    this.ctx.fillStyle = '#FF0000'; // Red test color
    this.ctx.fill();
    this.ctx.strokeStyle = '#00FF00'; // Green border
    this.ctx.lineWidth = 5;
    this.ctx.stroke();
    this.ctx.restore();
    
    // Draw test text
    this.ctx.save();
    this.ctx.font = '20px Arial';
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('MOBILE TEST', this.centerX, this.centerY);
    this.ctx.restore();
    
    console.log('🔍 [SiriButton] MOBILE TEST DRAW COMPLETED');
    console.log('  🎨 Canvas dimensions:', this.canvas.width, 'x', this.canvas.height);
    console.log('  🎨 Draw area:', this.width, 'x', this.height);
    console.log('  🎨 Center:', this.centerX, this.centerY);
    console.log('  🎨 Radius:', this.radius);
    
    // Verify canvas is visible after draw
    setTimeout(() => {
      const rect = this.canvas.getBoundingClientRect();
      console.log('🔍 [SiriButton] POST-DRAW VERIFICATION:');
      console.log('  📦 Canvas visible rect:', rect);
      console.log('  📦 Canvas has content:', rect.width > 0 && rect.height > 0);
      
      // Try to get image data to verify canvas has content
      try {
        const imageData = this.ctx.getImageData(0, 0, Math.min(this.width, 100), Math.min(this.height, 100));
        const hasContent = imageData.data.some(pixel => pixel > 0);
        console.log('  🎨 Canvas has pixel data:', hasContent);
      } catch (error) {
        console.error('  ❌ Failed to get image data:', error);
      }
    }, 100);
  }

  private drawTexturePattern() {
    // Dynamic texture pattern based on current color
    const dotColor = this.colors.secondary + '30'; // Add transparency
    const step = 14;
    for (let x = -this.radius; x < this.radius; x += step) {
      for (let y = -this.radius; y < this.radius; y += step) {
        if (x * x + y * y < this.radius * this.radius * 0.85) {
          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.arc(this.centerX + x, this.centerY + y, 1.2, 0, Math.PI * 2);
          this.ctx.fillStyle = dotColor;
          this.ctx.fill();
          this.ctx.restore();
        }
      }
    }
  }

  private drawLightBeam() {
    if (!(this.isHovered || this.isActive)) return;
    this.ctx.save();
    const grad = this.ctx.createLinearGradient(this.centerX, this.centerY - this.radius * 1.3, this.centerX, this.centerY + this.radius * 0.5);
    grad.addColorStop(0, 'rgba(255,255,255,0.22)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.08)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    this.ctx.beginPath();
    this.ctx.ellipse(this.centerX, this.centerY - this.radius * 0.7, this.radius * 0.7, this.radius * 0.22, 0, 0, 2 * Math.PI);
    this.ctx.fillStyle = grad;
    this.ctx.filter = 'blur(2.5px)';
    this.ctx.fill();
    this.ctx.filter = 'none';
    this.ctx.restore();
  }

  private drawBaseCircle() {
    // Parallax: offset center by mouse position (subtle)
    let offsetX = 0, offsetY = 0;
    if (this.isHovered) {
      offsetX = (this.mouseX - this.centerX) * 0.07;
      offsetY = (this.mouseY - this.centerY) * 0.07;
    }
    // Gradient rotation effect
    this.gradientRotation += 0.0025;
    const angle = this.gradientRotation % (2 * Math.PI);
    const gradX = this.centerX + Math.cos(angle) * this.radius * 1.2;
    const gradY = this.centerY + Math.sin(angle) * this.radius * 1.2;
    const outerGradient = this.ctx.createLinearGradient(
      this.centerX - this.radius * 1.2 + offsetX, this.centerY - this.radius * 1.2 + offsetY,
      gradX + offsetX, gradY + offsetY
    );
    outerGradient.addColorStop(0, this.colors.primary);
    outerGradient.addColorStop(1, this.colors.primary);
    this.ctx.save();
    this.ctx.globalAlpha = 0.85;
    this.ctx.beginPath();
    this.ctx.arc(this.centerX + offsetX, this.centerY + offsetY, this.radius * 1.25, 0, Math.PI * 2);
    this.ctx.strokeStyle = outerGradient;
    this.ctx.lineWidth = 12;
    this.ctx.shadowColor = this.colors.primary;
    this.ctx.shadowBlur = this.isHovered ? 32 : 16;
    this.ctx.stroke();
    this.ctx.restore();

    // Glassmorphism effect
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.centerX + offsetX, this.centerY + offsetY, this.radius * 1.13, 0, Math.PI * 2);
    this.ctx.fillStyle = this.isDarkMode ? 'rgba(40,50,80,0.18)' : 'rgba(255,255,255,0.10)';
    this.ctx.filter = 'blur(2.5px)';
    this.ctx.fill();
    this.ctx.filter = 'none';
    this.ctx.restore();

    // Inner circle with dynamic color
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.centerX + offsetX, this.centerY + offsetY, this.radius * 0.98, 0, Math.PI * 2);
    this.ctx.fillStyle = this.colors.secondary;
    this.ctx.shadowColor = this.colors.glow;
    this.ctx.shadowBlur = 10;
    this.ctx.fill();
    this.ctx.restore();

    // Boutique pattern/texture
    this.drawTexturePattern();

    // Neumorphism shadow
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.centerX + offsetX, this.centerY + offsetY, this.radius * 0.98, 0, Math.PI * 2);
    this.ctx.shadowColor = this.isDarkMode ? 'rgba(85,154,154,0.10)' : 'rgba(85,154,154,0.18)';
    this.ctx.shadowBlur = 24;
    this.ctx.globalAlpha = 0.7;
    this.ctx.strokeStyle = 'rgba(0,0,0,0)';
    this.ctx.lineWidth = 8;
    this.ctx.stroke();
    this.ctx.restore();

    // Light beam/flare
    this.drawLightBeam();

    // Draw modern mic icon in the center
    this.drawMicIcon(offsetX, offsetY);
  }

  private drawMicIcon(offsetX: number = 0, offsetY: number = 0) {
    let breath = 0.85 + 0.15 * Math.sin(this.pulsePhase * 1.5);
    if (this.isHovered) breath *= 1.08;
    if (this.isActive) breath *= 0.95;
    this.ctx.save();
    this.ctx.translate(this.centerX + offsetX, this.centerY + offsetY);
    this.ctx.scale(breath * 2.5, breath * 2.5); // Scale up the mic icon
    this.ctx.shadowColor = this.isHovered ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)';
    this.ctx.shadowBlur = 40 + 20 * breath + (this.isHovered ? 20 : 0); // Increased shadow blur
    this.ctx.beginPath();
    this.ctx.moveTo(0, 18);
    this.ctx.arc(0, 0, 18, Math.PI * 0.15, Math.PI * 1.85, false);
    this.ctx.lineTo(0, 18);
    this.ctx.closePath();
    this.ctx.fillStyle = 'rgba(255,255,255,0.92)';
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.moveTo(-4, 18);
    this.ctx.lineTo(-4, 28);
    this.ctx.lineTo(4, 28);
    this.ctx.lineTo(4, 18);
    this.ctx.closePath();
    this.ctx.fillStyle = 'rgba(255,255,255,0.92)';
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(0, 28, 6, 0, Math.PI, true);
    this.ctx.fillStyle = 'rgba(255,255,255,0.7)';
    this.ctx.fill();
    this.ctx.restore();
  }

  private drawRipples() {
    // Update and draw ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const ripple = this.ripples[i];
      ripple.radius += ripple.speed;
      ripple.alpha -= 0.01;

      if (ripple.alpha <= 0) {
        this.ripples.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, ripple.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(85,154,154, ${ripple.alpha})`;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }

  private drawPulsingRing() {
    // Draw pulsing ring when listening với màu động
    if (this.isListening) {
      const pulseRadius = this.radius + 10 + Math.sin(this.pulsePhase) * 5;
      const volumeBoost = this.volumeLevel * 20;
      
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, pulseRadius + volumeBoost, 0, Math.PI * 2);
      // Use primary color with transparency
      this.ctx.strokeStyle = this.colors.primary + '80'; // 50% opacity
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = this.colors.glow;
      this.ctx.shadowBlur = 8;
      this.ctx.stroke();
      
      this.pulsePhase += 0.1;
    }
  }

  private drawWaveform() {
    if (!this.isListening) return;
    // Draw concentric waveform rings with dynamic colors
    const rings = 4;
    this.waveformPhase += 0.08 + this.volumeLevel * 0.12;
    for (let i = 1; i <= rings; i++) {
      const baseRadius = this.radius * 0.98 + i * 10 + Math.sin(this.waveformPhase + i) * 3 * (1 + this.volumeLevel);
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, baseRadius, 0, Math.PI * 2);
      // Use secondary color with opacity based on ring position
      const opacity = (0.18 + 0.08 * (rings-i)).toFixed(2);
      this.ctx.strokeStyle = this.colors.secondary + Math.floor(255 * parseFloat(opacity)).toString(16).padStart(2, '0');
      this.ctx.lineWidth = 2 + this.volumeLevel * 2;
      this.ctx.shadowColor = this.colors.glow;
      this.ctx.shadowBlur = 8;
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  private drawParticles() {
    // Add new particles when listening
    if (this.isListening && Math.random() < 0.18) {
      const angle = Math.random() * 2 * Math.PI;
      const dist = this.radius * 1.18 + Math.random() * 16;
      this.particles.push({
        x: this.centerX + Math.cos(angle) * dist,
        y: this.centerY + Math.sin(angle) * dist,
        alpha: 0.7 + Math.random() * 0.3,
        size: 2 + Math.random() * 2,
        speed: 0.5 + Math.random() * 0.7
      });
    }
    // Draw and update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.alpha -= 0.012;
      p.size *= 0.98;
      p.y -= p.speed * 0.5;
      p.x += Math.sin(p.y * 0.1) * 0.2;
      if (p.alpha <= 0.05 || p.size < 0.5) {
        this.particles.splice(i, 1);
        continue;
      }
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      // Use secondary color with particle alpha
      const alphaHex = Math.floor(255 * p.alpha).toString(16).padStart(2, '0');
      this.ctx.fillStyle = this.colors.secondary + alphaHex;
      this.ctx.shadowColor = this.colors.glow;
      this.ctx.shadowBlur = 6;
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  private drawTimeRing() {
    // Draw thin progress ring around the button với màu động
    const percent = Math.min(1, this.elapsedTime / this.timeTarget);
    // Use dynamic colors based on progress
    const color = percent < 0.5 ? this.colors.secondary : percent < 1 ? this.colors.primary : '#e53935';
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius * 1.32, -Math.PI/2, -Math.PI/2 + percent * 2 * Math.PI);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 4;
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = percent > 0.95 ? 16 : 6;
    this.ctx.globalAlpha = 0.85;
    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawTimeText() {
    // Animate displayedTime for smooth counting
    this.displayedTime += (this.elapsedTime - this.displayedTime) * 0.18;
    const shown = Math.round(this.displayedTime);
    const min = Math.floor(shown / 60).toString().padStart(2, '0');
    const sec = (shown % 60).toString().padStart(2, '0');
    const timeStr = `${min}:${sec}`;
    this.ctx.save();
    this.ctx.font = '600 1.25rem Montserrat, Raleway, Arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    this.ctx.shadowColor = 'rgba(85,154,154,0.22)';
    this.ctx.shadowBlur = 8;
    this.ctx.fillStyle = '#fff';
    if (this.isDarkMode) this.ctx.fillStyle = '#e8e8e8';
    this.ctx.globalAlpha = 0.95;
    this.ctx.fillText(timeStr, this.centerX, this.centerY + this.radius * 1.45);
    this.ctx.restore();
  }

  private drawIdleFlash() {
    // Hiệu ứng nhấp nháy nhẹ khi không hoạt động lâu với màu động
    const idleMs = Date.now() - this.lastActiveTime;
    if (idleMs > 6000) {
      this.idleFlash += 0.08;
      const flash = 0.7 + 0.3 * Math.abs(Math.sin(this.idleFlash * 1.2));
      this.ctx.save();
      this.ctx.globalAlpha = 0.18 * flash;
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, this.radius * 1.18, 0, Math.PI * 2);
      this.ctx.fillStyle = this.colors.secondary;
      this.ctx.filter = 'blur(2.5px)';
      this.ctx.fill();
      this.ctx.filter = 'none';
      this.ctx.restore();
    } else {
      this.idleFlash = 0;
    }
  }

  private drawVolumeVisualization() {
    // DISABLED: Internal volume visualization - using external bars instead
    return;
    
    // Visualization sóng âm động quanh nút khi listening với màu động
    if (!this.isListening) return;
    const bars = 16;
    const baseR = this.radius * 1.08;
    for (let i = 0; i < bars; i++) {
      const angle = (2 * Math.PI * i) / bars;
      const amp = 8 + Math.sin(this.waveformPhase + i) * 4 + this.volumeLevel * 18;
      const x1 = this.centerX + Math.cos(angle) * baseR;
      const y1 = this.centerY + Math.sin(angle) * baseR;
      const x2 = this.centerX + Math.cos(angle) * (baseR + amp);
      const y2 = this.centerY + Math.sin(angle) * (baseR + amp);
      this.ctx.save();
      // Use secondary color with volume-based opacity
      const opacity = (0.18 + 0.18 * this.volumeLevel).toFixed(2);
      const alphaHex = Math.floor(255 * parseFloat(opacity)).toString(16).padStart(2, '0');
      this.ctx.strokeStyle = this.colors.secondary + alphaHex;
      this.ctx.lineWidth = 2.2;
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.shadowColor = this.colors.glow;
      this.ctx.shadowBlur = 6;
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  private animate() {
    // 🚨 PHASE 1: EMERGENCY GUARDS - Check for emergency stop
    if (this.emergencyStopRequested) {
      this.debugWarn('Animation stopped due to emergency stop');
      return;
    }

    this.debug('🔍 [SiriButton] ANIMATION START - Mobile Debug');
    
    // 🚨 PHASE 1: CANVAS VALIDATION - Use validation method
    if (!this.validateCanvas()) {
      this.debugWarn('Canvas validation failed, stopping animation');
      return;
    }

    // Update radius based on container size consistently
    this.radius = Math.max(60, Math.min(this.width, this.height) * 0.35); // Consistent proportional radius
    
    // 🚨 PHASE 1: SAFE CANVAS OPERATIONS - Try-catch for all canvas operations
    try {
      this.ctx.clearRect(0, 0, this.width, this.height);
    } catch (error) {
      this.debugError('Error clearing canvas:', error);
      this.emergencyStop();
      return;
    }
    
    // Ensure canvas is visible and has proper styling
    if (this.canvas.style.display !== 'block') {
      this.canvas.style.display = 'block';
    }
    
    // Verify canvas dimensions
    if (this.canvas.width === 0 || this.canvas.height === 0) {
      this.debugWarn('Canvas has zero dimensions, triggering safe resize');
      this.safeResize();
    }
    
    // 🚨 PHASE 1: SAFE DRAWING OPERATIONS - Try-catch for all drawing
    try {
      this.drawBaseCircle();
      this.drawWaveform();
      this.drawParticles();
      this.drawRipples();
      this.drawPulsingRing();
      this.drawTimeRing();
      this.drawTimeText();
      this.drawIdleFlash();
    } catch (error) {
      this.debugError('Error during drawing:', error);
      // 🚨 EMERGENCY: Fallback to simple drawing
      try {
        this.drawFallbackCircle();
      } catch (fallbackError) {
        this.debugError('Even fallback drawing failed:', fallbackError);
        this.emergencyStop();
        return;
      }
    }
    
    // Add new ripples when listening - consistent rate for all devices
    if (this.isListening && Math.random() < 0.1) {
      this.ripples.push({
        radius: this.radius,
        alpha: 0.4,
        speed: 1 + this.volumeLevel * 2
      });
    }
    
    // Update animation phase
    this.pulsePhase += 0.05;
    
    // 🚨 PHASE 1: SAFE ANIMATION LOOP - Check emergency stop before next frame
    if (!this.emergencyStopRequested) {
      this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    }
  }

  // 🚨 PHASE 1: EMERGENCY FALLBACK - Simple drawing when complex drawing fails
  private drawFallbackCircle() {
    try {
      this.debug('Drawing fallback circle');
      
      // Clear canvas
      this.ctx.clearRect(0, 0, this.width, this.height);
      
      // Draw simple animated circle
      this.ctx.save();
      
      // Pulsing effect
      const pulse = 1 + 0.1 * Math.sin(this.pulsePhase);
      const currentRadius = this.radius * pulse;
      
      // Outer glow
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, currentRadius + 10, 0, Math.PI * 2);
      this.ctx.fillStyle = this.colors.glow;
      this.ctx.fill();
      
      // Main circle
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, currentRadius, 0, Math.PI * 2);
      this.ctx.fillStyle = this.colors.primary;
      this.ctx.fill();
      
      // Inner circle
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, currentRadius * 0.7, 0, Math.PI * 2);
      this.ctx.fillStyle = this.colors.secondary;
      this.ctx.fill();
      
      // Draw microphone icon
      this.drawSimpleMicIcon();
      
      this.ctx.restore();
      
      this.debug('Fallback circle drawn successfully');
    } catch (error) {
      this.debugError('Even fallback drawing failed:', error);
      // Last resort - throw to trigger emergency stop
      throw error;
    }
  }

  // Simple microphone icon for fallback
  private drawSimpleMicIcon() {
    try {
      this.ctx.save();
      this.ctx.translate(this.centerX, this.centerY);
      this.ctx.scale(2, 2);
      
      // Microphone body
      this.ctx.beginPath();
      this.ctx.arc(0, -5, 8, Math.PI * 0.2, Math.PI * 1.8, false);
      this.ctx.fillStyle = 'rgba(255,255,255,0.9)';
      this.ctx.fill();
      
      // Microphone stand
      this.ctx.beginPath();
      this.ctx.rect(-2, 5, 4, 8);
      this.ctx.fill();
      
      // Microphone base
      this.ctx.beginPath();
      this.ctx.arc(0, 13, 4, 0, Math.PI, true);
      this.ctx.fill();
      
      this.ctx.restore();
    } catch (error) {
      console.error('[SiriButton] Error drawing simple mic icon:', error);
    }
  }

  // Public methods for external control
  public setListening(listening: boolean) {
    this.isListening = listening;
    console.log('[SiriButton] Listening state changed to:', listening);
  }

  public setVolumeLevel(level: number) {
    this.volumeLevel = Math.max(0, Math.min(100, level));
  }

  public setTime(seconds: number, target: number = 60) {
    this.elapsedTime = seconds;
    this.timeTarget = target;
  }

  public getTime() {
    return this.elapsedTime;
  }

  // ✅ NEW: External visual state control interface
  public setInteractionMode(mode: 'hover' | 'active' | 'idle'): void {
    this.visualState.isHovered = mode === 'hover' || mode === 'active';
    this.visualState.isActive = mode === 'active';
    
    // Update internal state for animations
    this.isHovered = this.visualState.isHovered;
    this.isActive = this.visualState.isActive;
    this.lastActiveTime = Date.now();
    
    console.log(`[SiriButton] Visual mode changed to: ${mode}`);
  }

  public setTouchPosition(x: number, y: number): void {
    this.visualState.mousePosition = { x, y };
    this.mouseX = x;
    this.mouseY = y;
    this.lastActiveTime = Date.now();
  }

  public updateVisualState(newState: {
    isHovered?: boolean;
    isActive?: boolean;
    mousePosition?: { x: number; y: number };
  }): void {
    this.visualState = { ...this.visualState, ...newState };
    
    // Sync with internal state
    if (newState.isHovered !== undefined) this.isHovered = newState.isHovered;
    if (newState.isActive !== undefined) this.isActive = newState.isActive;
    if (newState.mousePosition) {
      this.mouseX = newState.mousePosition.x;
      this.mouseY = newState.mousePosition.y;
    }
    
    this.lastActiveTime = Date.now();
  }

  public cleanup() {
    this.debug('[SiriButton] Cleaning up canvas and animation');
    
    // Stop animation first
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }
    
    // Remove resize listener
    try {
      window.removeEventListener('resize', this.debouncedResize.bind(this));
    } catch (error) {
      console.warn('[SiriButton] Error removing resize listener:', error);
    }
    
    // Safe canvas removal
    if (this.canvas) {
      try {
        // Check if canvas is still in DOM and has a parent
        if (this.canvas.parentElement && document.contains(this.canvas)) {
          this.canvas.parentElement.removeChild(this.canvas);
          console.log('[SiriButton] Canvas removed successfully');
        } else {
          console.log('[SiriButton] Canvas already removed or not in DOM');
        }
      } catch (error) {
        console.warn('[SiriButton] Error removing canvas:', error);
      }
      
      // Clear canvas reference
      this.canvas = null as any;
      this.ctx = null as any;
    }
  }
}

// 🔧 PHASE 2: GLOBAL DEBUG CONTROLS - Available in browser console  
if (typeof window !== 'undefined') {
  (window as any).SiriDebugControls = {
    setLevel: (level: 0 | 1 | 2) => {
      SiriButton.setDebugLevel(level);
      console.log(`🔧 Voice debug level set to: ${level}`);
    },
    getLevel: () => SiriButton.getDebugLevel(),
    silent: () => SiriButton.setDebugLevel(0),
    errorsOnly: () => SiriButton.setDebugLevel(1), 
    verbose: () => SiriButton.setDebugLevel(2),
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
  (window as any).voiceDebugOff = () => SiriButton.setDebugLevel(0);
  (window as any).voiceDebugOn = () => SiriButton.setDebugLevel(2);
} 