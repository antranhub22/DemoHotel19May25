// ✅ FIXED: Import missing types
import type { DebugManager } from './DebugManager';

export interface CanvasRenderState {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  radius: number;
  isListening: boolean;
  isHovered: boolean;
  isActive: boolean;
  pulsePhase: number;
  volumeLevel: number;
  elapsedTime: number;
  displayedTime: number;
  timeTarget: number;
  idleFrame: number;
  lastActiveTime: number;
  idleFlash: number;
  gradientRotation: number;
  waveformPhase: number;
  mouseX: number;
  mouseY: number;
  isDarkMode: boolean;
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
  colors: {
    primary: string;
    secondary: string;
    glow: string;
    name: string;
  };
}

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private debug: DebugManager;

  constructor(ctx: CanvasRenderingContext2D, debug: DebugManager) {
    this.ctx = ctx;
    this.debug = debug;
  }

  /**
   * Clear the entire canvas
   */
  public clear(state: CanvasRenderState): void {
    try {
      this.ctx.clearRect(0, 0, state.width, state.height);
    } catch (error) {
      this.debug.error('Error clearing canvas:', error);
      throw error;
    }
  }

  /**
   * Render all visual elements
   */
  public renderAll(state: CanvasRenderState): void {
    try {
      this.clear(state);
      this.drawBaseCircle(state);
      this.drawWaveform(state);
      this.drawParticles(state);
      this.drawRipples(state);
      this.drawPulsingRing(state);
      this.drawTimeRing(state);
      this.drawTimeText(state);
      this.drawIdleFlash(state);
    } catch (error) {
      this.debug.error('Error during complete rendering:', error);
      // Fallback to simple drawing
      this.drawFallbackCircle(state);
    }
  }

  /**
   * Draw the main base circle with gradient and glow effects
   */
  public drawBaseCircle(state: CanvasRenderState): void {
    const { centerX, centerY, radius, isActive, isHovered, colors } = state;

    this.ctx.save();

    // Dynamic scaling based on interaction
    const scale = isActive ? 1.08 : isHovered ? 1.04 : 1;
    const currentRadius = radius * scale;

    // Create radial gradient with dynamic colors
    const gradient = this.ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      currentRadius
    );
    gradient.addColorStop(0, `${colors.primary}95`); // Primary with opacity
    gradient.addColorStop(0.7, `${colors.secondary}60`);
    gradient.addColorStop(1, `${colors.glow}20`);

    // Outer glow effect
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, currentRadius + 15, 0, Math.PI * 2);
    this.ctx.fillStyle = `${colors.glow}30`;
    this.ctx.filter = 'blur(8px)';
    this.ctx.fill();
    this.ctx.filter = 'none';

    // Main circle
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    // Inner highlight
    const innerGradient = this.ctx.createRadialGradient(
      centerX - radius * 0.3,
      centerY - radius * 0.3,
      0,
      centerX,
      centerY,
      radius * 0.8
    );
    innerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    innerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, currentRadius * 0.8, 0, Math.PI * 2);
    this.ctx.fillStyle = innerGradient;
    this.ctx.fill();

    this.ctx.restore();
  }

  /**
   * Draw animated waveform around the button
   */
  public drawWaveform(state: CanvasRenderState): void {
    if (!state.isListening) {
      return;
    }

    const { centerX, centerY, radius, waveformPhase, volumeLevel, colors } =
      state;

    this.ctx.save();

    // Draw multiple concentric waveforms
    for (let ring = 0; ring < 3; ring++) {
      const baseRadius = radius * (1.15 + ring * 0.1);
      const points = 32;

      this.ctx.beginPath();

      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const wave =
          Math.sin(waveformPhase + i * 0.3 + ring * 1.5) *
          (8 + volumeLevel * 12);
        const r = baseRadius + wave;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }

      this.ctx.closePath();
      this.ctx.strokeStyle = colors.secondary + (90 - ring * 20).toString(16);
      this.ctx.lineWidth = 2;
      this.ctx.shadowColor = colors.glow;
      this.ctx.shadowBlur = 6;
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  /**
   * Draw floating particles around the button
   */
  public drawParticles(state: CanvasRenderState): void {
    const { particles, colors } = state;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      // Update particle
      p.alpha -= 0.008;
      p.size -= 0.05;
      p.x += (Math.random() - 0.5) * p.speed;
      p.y += (Math.random() - 0.5) * p.speed;

      // Remove dead particles
      if (p.alpha <= 0.05 || p.size < 0.5) {
        particles.splice(i, 1);
        continue;
      }

      // Draw particle
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

      const alphaHex = Math.floor(255 * p.alpha)
        .toString(16)
        .padStart(2, '0');
      this.ctx.fillStyle = colors.secondary + alphaHex;
      this.ctx.shadowColor = colors.glow;
      this.ctx.shadowBlur = 6;
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  /**
   * Draw expanding ripple effects
   */
  public drawRipples(state: CanvasRenderState): void {
    const { ripples, centerX, centerY, colors } = state;

    for (let i = ripples.length - 1; i >= 0; i--) {
      const ripple = ripples[i];

      // Update ripple
      ripple.radius += ripple.speed * 3;
      ripple.alpha -= 0.02;

      // Remove faded ripples
      if (ripple.alpha <= 0) {
        ripples.splice(i, 1);
        continue;
      }

      // Draw ripple
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, ripple.radius, 0, Math.PI * 2);

      const alphaHex = Math.floor(255 * ripple.alpha)
        .toString(16)
        .padStart(2, '0');
      this.ctx.strokeStyle = colors.primary + alphaHex;
      this.ctx.lineWidth = 2;
      this.ctx.shadowColor = colors.glow;
      this.ctx.shadowBlur = 8;
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  /**
   * Draw pulsing ring effect
   */
  public drawPulsingRing(state: CanvasRenderState): void {
    const { centerX, centerY, radius, pulsePhase, isListening, colors } = state;

    if (!isListening) {
      return;
    }

    this.ctx.save();

    const pulse = 0.9 + 0.2 * Math.sin(pulsePhase * 1.5);
    const ringRadius = radius * (1.25 + pulse * 0.1);

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
    this.ctx.strokeStyle = `${colors.glow}60`;
    this.ctx.lineWidth = 3;
    this.ctx.shadowColor = colors.glow;
    this.ctx.shadowBlur = 15;
    this.ctx.stroke();

    this.ctx.restore();
  }

  /**
   * Draw time progress ring
   */
  public drawTimeRing(state: CanvasRenderState): void {
    const { centerX, centerY, radius, elapsedTime, timeTarget, colors } = state;

    const percent = Math.min(1, elapsedTime / timeTarget);
    const color =
      percent < 0.5
        ? colors.secondary
        : percent < 1
          ? colors.primary
          : '#e53935';

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(
      centerX,
      centerY,
      radius * 1.32,
      -Math.PI / 2,
      -Math.PI / 2 + percent * 2 * Math.PI
    );
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 4;
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = percent > 0.95 ? 16 : 6;
    this.ctx.globalAlpha = 0.85;
    this.ctx.stroke();
    this.ctx.restore();
  }

  /**
   * Draw time text display
   */
  public drawTimeText(state: CanvasRenderState): void {
    const { centerX, centerY, radius, displayedTime, isDarkMode } = state;

    const shown = Math.round(displayedTime);
    const min = Math.floor(shown / 60)
      .toString()
      .padStart(2, '0');
    const sec = (shown % 60).toString().padStart(2, '0');
    const timeStr = `${min}:${sec}`;

    this.ctx.save();
    this.ctx.font = '600 1.25rem Montserrat, Raleway, Arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    this.ctx.shadowColor = 'rgba(85,154,154,0.22)';
    this.ctx.shadowBlur = 8;
    this.ctx.fillStyle = isDarkMode ? '#e8e8e8' : '#fff';
    this.ctx.globalAlpha = 0.95;
    this.ctx.fillText(timeStr, centerX, centerY + radius * 1.45);
    this.ctx.restore();
  }

  /**
   * Draw idle flash effect
   */
  public drawIdleFlash(state: CanvasRenderState): void {
    const { centerX, centerY, radius, lastActiveTime, idleFlash, colors } =
      state;

    const idleMs = Date.now() - lastActiveTime;
    if (idleMs <= 6000) {
      return;
    }

    const flash = 0.7 + 0.3 * Math.abs(Math.sin(idleFlash * 1.2));

    this.ctx.save();
    this.ctx.globalAlpha = 0.18 * flash;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius * 1.18, 0, Math.PI * 2);
    this.ctx.fillStyle = colors.secondary;
    this.ctx.filter = 'blur(2.5px)';
    this.ctx.fill();
    this.ctx.filter = 'none';
    this.ctx.restore();
  }

  /**
   * Emergency fallback - simple circle when complex drawing fails
   */
  public drawFallbackCircle(state: CanvasRenderState): void {
    try {
      this.debug.warn('Drawing fallback circle');

      const { centerX, centerY, radius, pulsePhase, colors } = state;

      // Clear canvas
      this.ctx.clearRect(0, 0, state.width, state.height);

      this.ctx.save();

      // Pulsing effect
      const pulse = 1 + 0.1 * Math.sin(pulsePhase);
      const currentRadius = radius * pulse;

      // Outer glow
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, currentRadius + 10, 0, Math.PI * 2);
      this.ctx.fillStyle = `${colors.glow}40`;
      this.ctx.filter = 'blur(6px)';
      this.ctx.fill();
      this.ctx.filter = 'none';

      // Main circle
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
      this.ctx.fillStyle = colors.primary;
      this.ctx.fill();

      this.ctx.restore();

      this.debug.log('Fallback circle drawn successfully');
    } catch (error) {
      this.debug.error('Even fallback drawing failed:', error);
      throw error;
    }
  }
}
