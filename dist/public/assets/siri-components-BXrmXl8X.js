import { r as p, j as b } from './react-core-C6DwaHZM.js';
import { l as a, a6 as Y } from './components-LYkGJCyk.js';
import { a as W, j as G } from './hooks-context-BUKIDDkP.js';
const q = {};
class f {
  static DEBUG_LEVEL = q?.NODE_ENV === 'development' ? 1 : 0;
  static setDebugLevel(e) {
    ((f.DEBUG_LEVEL = e),
      a.debug(
        '[DebugManager] Debug level set to: ${level} (0: off, 1: errors only, 2: all)',
        'Component'
      ));
  }
  static getDebugLevel() {
    return f.DEBUG_LEVEL;
  }
  log(e, ...t) {
    f.DEBUG_LEVEL >= 2 && a.debug('[SiriButton] ${message}', 'Component', ...t);
  }
  debug(e, ...t) {
    f.DEBUG_LEVEL >= 2 && a.debug('[SiriButton] ${message}', 'Component', ...t);
  }
  warn(e, ...t) {
    f.DEBUG_LEVEL >= 1 && a.warn('[SiriButton] ${message}', 'Component', ...t);
  }
  debugWarn(e, ...t) {
    f.DEBUG_LEVEL >= 1 && a.warn('[SiriButton] ${message}', 'Component', ...t);
  }
  error(e, ...t) {
    a.error('[SiriButton] ${message}', 'Component', ...t);
  }
  debugError(e, ...t) {
    a.error('[SiriButton] ${message}', 'Component', ...t);
  }
  silent() {
    f.setDebugLevel(0);
  }
  errorsOnly() {
    f.setDebugLevel(1);
  }
  verbose() {
    f.setDebugLevel(2);
  }
}
typeof window < 'u' &&
  ((window.SiriDebugControls = {
    setLevel: u => {
      (f.setDebugLevel(u),
        a.debug('🔧 Voice debug level set to: ${level}', 'Component'));
    },
    getLevel: () => f.getDebugLevel(),
    silent: () => f.setDebugLevel(0),
    errorsOnly: () => f.setDebugLevel(1),
    verbose: () => f.setDebugLevel(2),
    help: () => {
      a.debug(
        [
          '🔧 SiriDebugControls Help:',
          '- SiriDebugControls.silent()     -> Turn off all debug logs',
          '- SiriDebugControls.errorsOnly() -> Show errors + warnings only',
          '- SiriDebugControls.verbose()    -> Show all debug logs',
          '- SiriDebugControls.setLevel(n)  -> Set level manually (0-2)',
          '- SiriDebugControls.getLevel()   -> Check current level',
        ].join(`
`),
        'Component'
      );
    },
  }),
  (window.voiceDebugOff = () => f.setDebugLevel(0)),
  (window.voiceDebugOn = () => f.setDebugLevel(2)));
class U {
  state;
  debug;
  canvas;
  ctx;
  constructor(e) {
    ((this.debug = e),
      (this.canvas = null),
      (this.ctx = null),
      (this.state = {
        emergencyStopRequested: !1,
        resizeInProgress: !1,
        lastResizeTime: 0,
        maxResizeAttempts: 5,
        resizeAttemptCount: 0,
        canvasValid: !0,
      }));
  }
  setCanvasReferences(e, t) {
    ((this.canvas = e), (this.ctx = t), (this.state.canvasValid = !0));
  }
  isEmergencyStopRequested() {
    return this.state.emergencyStopRequested;
  }
  triggerEmergencyStop() {
    (this.debug.warn('🚨 EMERGENCY STOP TRIGGERED'),
      (this.state.emergencyStopRequested = !0),
      (this.state.canvasValid = !1));
  }
  clearEmergencyStop() {
    (this.debug.log('✅ Emergency stop cleared'),
      (this.state.emergencyStopRequested = !1),
      this.validateCanvas());
  }
  validateCanvas() {
    return !this.canvas || !this.ctx
      ? (this.debug.error('Canvas or context invalid'),
        (this.state.canvasValid = !1),
        !1)
      : !this.canvas.parentElement || !document.contains(this.canvas)
        ? (this.debug.error('Canvas not in DOM'),
          (this.state.canvasValid = !1),
          !1)
        : this.canvas.width === 0 || this.canvas.height === 0
          ? (this.debug.warn('Canvas has zero dimensions'),
            (this.state.canvasValid = !1),
            !1)
          : ((this.state.canvasValid = !0), !0);
  }
  isCanvasValid() {
    return this.state.canvasValid;
  }
  canSafeResize() {
    const e = Date.now();
    return this.state.resizeInProgress
      ? (this.debug.warn('Resize already in progress, skipping'), !1)
      : e - this.state.lastResizeTime < 100
        ? (this.debug.warn('Resize attempted too recently, skipping'), !1)
        : this.state.resizeAttemptCount >= this.state.maxResizeAttempts
          ? (this.debug.error('Maximum resize attempts reached, stopping'),
            this.triggerEmergencyStop(),
            !1)
          : !0;
  }
  startResize() {
    return this.canSafeResize()
      ? ((this.state.resizeInProgress = !0),
        (this.state.lastResizeTime = Date.now()),
        this.state.resizeAttemptCount++,
        this.debug.log(
          `Starting resize attempt ${this.state.resizeAttemptCount}/${this.state.maxResizeAttempts}`
        ),
        !0)
      : !1;
  }
  finishResize(e) {
    ((this.state.resizeInProgress = !1),
      e
        ? (this.debug.log('Resize completed successfully'),
          (this.state.resizeAttemptCount = 0))
        : (this.debug.warn('Resize failed'),
          this.state.resizeAttemptCount >= this.state.maxResizeAttempts &&
            (this.debug.error(
              'Max resize attempts reached, triggering emergency stop'
            ),
            this.triggerEmergencyStop())));
  }
  resetResizeAttempts() {
    ((this.state.resizeAttemptCount = 0),
      this.debug.log('Resize attempt counter reset'));
  }
  safeExecute(e, t, i) {
    try {
      return this.state.emergencyStopRequested
        ? (this.debug.warn(`Operation ${i} skipped due to emergency stop`), t())
        : e();
    } catch (n) {
      this.debug.error(`Operation ${i} failed:`, n);
      try {
        return t();
      } catch (r) {
        throw (
          this.debug.error(`Fallback for ${i} also failed:`, r),
          this.triggerEmergencyStop(),
          r
        );
      }
    }
  }
  safeCanvasOperation(e, t, i) {
    return this.validateCanvas()
      ? this.safeExecute(e, t, i)
      : (this.debug.warn(`Canvas operation ${i} skipped - canvas invalid`),
        t());
  }
  setFallbackDimensions() {
    try {
      const e = {
        width: 300,
        height: 300,
        centerX: 150,
        centerY: 150,
        radius: 100,
      };
      return (
        this.canvas &&
          ((this.canvas.width = e.width),
          (this.canvas.height = e.height),
          (this.canvas.style.width = `${e.width}px`),
          (this.canvas.style.height = `${e.height}px`)),
        this.debug.warn('Using fallback dimensions due to resize failure'),
        e
      );
    } catch (e) {
      throw (
        this.debug.error('Failed to set fallback dimensions:', e),
        this.triggerEmergencyStop(),
        e
      );
    }
  }
  getState() {
    return { ...this.state };
  }
  shouldSkipAnimation() {
    return this.state.emergencyStopRequested || !this.state.canvasValid;
  }
  forceReset() {
    (this.debug.warn('🔧 Force resetting emergency state'),
      (this.state = {
        emergencyStopRequested: !1,
        resizeInProgress: !1,
        lastResizeTime: 0,
        maxResizeAttempts: 5,
        resizeAttemptCount: 0,
        canvasValid: !0,
      }));
  }
}
class K {
  ctx;
  debug;
  constructor(e, t) {
    ((this.ctx = e), (this.debug = t));
  }
  clear(e) {
    try {
      this.ctx.clearRect(0, 0, e.width, e.height);
    } catch (t) {
      throw (this.debug.error('Error clearing canvas:', t), t);
    }
  }
  renderAll(e) {
    try {
      (this.clear(e),
        this.drawBaseCircle(e),
        this.drawWaveform(e),
        this.drawParticles(e),
        this.drawRipples(e),
        this.drawPulsingRing(e),
        this.drawTimeRing(e),
        this.drawTimeText(e),
        this.drawIdleFlash(e));
    } catch (t) {
      (this.debug.error('Error during complete rendering:', t),
        this.drawFallbackCircle(e));
    }
  }
  drawBaseCircle(e) {
    const {
      centerX: t,
      centerY: i,
      radius: n,
      isActive: r,
      isHovered: o,
      colors: s,
    } = e;
    this.ctx.save();
    const d = n * (r ? 1.08 : o ? 1.04 : 1),
      h = this.ctx.createRadialGradient(t, i, 0, t, i, d);
    (h.addColorStop(0, `${s.primary}95`),
      h.addColorStop(0.7, `${s.secondary}60`),
      h.addColorStop(1, `${s.glow}20`),
      this.ctx.beginPath(),
      this.ctx.arc(t, i, d + 15, 0, Math.PI * 2),
      (this.ctx.fillStyle = `${s.glow}30`),
      (this.ctx.filter = 'blur(8px)'),
      this.ctx.fill(),
      (this.ctx.filter = 'none'),
      this.ctx.beginPath(),
      this.ctx.arc(t, i, d, 0, Math.PI * 2),
      (this.ctx.fillStyle = h),
      this.ctx.fill());
    const l = this.ctx.createRadialGradient(
      t - n * 0.3,
      i - n * 0.3,
      0,
      t,
      i,
      n * 0.8
    );
    (l.addColorStop(0, 'rgba(255, 255, 255, 0.4)'),
      l.addColorStop(1, 'rgba(255, 255, 255, 0)'),
      this.ctx.beginPath(),
      this.ctx.arc(t, i, d * 0.8, 0, Math.PI * 2),
      (this.ctx.fillStyle = l),
      this.ctx.fill(),
      this.ctx.restore());
  }
  drawWaveform(e) {
    if (!e.isListening) return;
    const {
      centerX: t,
      centerY: i,
      radius: n,
      waveformPhase: r,
      volumeLevel: o,
      colors: s,
    } = e;
    this.ctx.save();
    for (let c = 0; c < 3; c++) {
      const d = n * (1.15 + c * 0.1),
        h = 32;
      this.ctx.beginPath();
      for (let l = 0; l <= h; l++) {
        const x = (l / h) * Math.PI * 2,
          y = Math.sin(r + l * 0.3 + c * 1.5) * (8 + o * 12),
          C = d + y,
          S = t + Math.cos(x) * C,
          v = i + Math.sin(x) * C;
        l === 0 ? this.ctx.moveTo(S, v) : this.ctx.lineTo(S, v);
      }
      (this.ctx.closePath(),
        (this.ctx.strokeStyle = s.secondary + (90 - c * 20).toString(16)),
        (this.ctx.lineWidth = 2),
        (this.ctx.shadowColor = s.glow),
        (this.ctx.shadowBlur = 6),
        this.ctx.stroke());
    }
    this.ctx.restore();
  }
  drawParticles(e) {
    const { particles: t, colors: i } = e;
    for (let n = t.length - 1; n >= 0; n--) {
      const r = t[n];
      if (
        ((r.alpha -= 0.008),
        (r.size -= 0.05),
        (r.x += (Math.random() - 0.5) * r.speed),
        (r.y += (Math.random() - 0.5) * r.speed),
        r.alpha <= 0.05 || r.size < 0.5)
      ) {
        t.splice(n, 1);
        continue;
      }
      (this.ctx.save(),
        this.ctx.beginPath(),
        this.ctx.arc(r.x, r.y, r.size, 0, Math.PI * 2));
      const o = Math.floor(255 * r.alpha)
        .toString(16)
        .padStart(2, '0');
      ((this.ctx.fillStyle = i.secondary + o),
        (this.ctx.shadowColor = i.glow),
        (this.ctx.shadowBlur = 6),
        this.ctx.fill(),
        this.ctx.restore());
    }
  }
  drawRipples(e) {
    const { ripples: t, centerX: i, centerY: n, colors: r } = e;
    for (let o = t.length - 1; o >= 0; o--) {
      const s = t[o];
      if (((s.radius += s.speed * 3), (s.alpha -= 0.02), s.alpha <= 0)) {
        t.splice(o, 1);
        continue;
      }
      (this.ctx.save(),
        this.ctx.beginPath(),
        this.ctx.arc(i, n, s.radius, 0, Math.PI * 2));
      const c = Math.floor(255 * s.alpha)
        .toString(16)
        .padStart(2, '0');
      ((this.ctx.strokeStyle = r.primary + c),
        (this.ctx.lineWidth = 2),
        (this.ctx.shadowColor = r.glow),
        (this.ctx.shadowBlur = 8),
        this.ctx.stroke(),
        this.ctx.restore());
    }
  }
  drawPulsingRing(e) {
    const {
      centerX: t,
      centerY: i,
      radius: n,
      pulsePhase: r,
      isListening: o,
      colors: s,
    } = e;
    if (!o) return;
    this.ctx.save();
    const c = 0.9 + 0.2 * Math.sin(r * 1.5),
      d = n * (1.25 + c * 0.1);
    (this.ctx.beginPath(),
      this.ctx.arc(t, i, d, 0, Math.PI * 2),
      (this.ctx.strokeStyle = `${s.glow}60`),
      (this.ctx.lineWidth = 3),
      (this.ctx.shadowColor = s.glow),
      (this.ctx.shadowBlur = 15),
      this.ctx.stroke(),
      this.ctx.restore());
  }
  drawTimeRing(e) {
    const {
        centerX: t,
        centerY: i,
        radius: n,
        elapsedTime: r,
        timeTarget: o,
        colors: s,
      } = e,
      c = Math.min(1, r / o),
      d = c < 0.5 ? s.secondary : c < 1 ? s.primary : '#e53935';
    (this.ctx.save(),
      this.ctx.beginPath(),
      this.ctx.arc(
        t,
        i,
        n * 1.32,
        -Math.PI / 2,
        -Math.PI / 2 + c * 2 * Math.PI
      ),
      (this.ctx.strokeStyle = d),
      (this.ctx.lineWidth = 4),
      (this.ctx.shadowColor = d),
      (this.ctx.shadowBlur = c > 0.95 ? 16 : 6),
      (this.ctx.globalAlpha = 0.85),
      this.ctx.stroke(),
      this.ctx.restore());
  }
  drawTimeText(e) {
    const {
        centerX: t,
        centerY: i,
        radius: n,
        displayedTime: r,
        isDarkMode: o,
      } = e,
      s = Math.round(r),
      c = Math.floor(s / 60)
        .toString()
        .padStart(2, '0'),
      d = (s % 60).toString().padStart(2, '0'),
      h = `${c}:${d}`;
    (this.ctx.save(),
      (this.ctx.font = '600 1.25rem Montserrat, Raleway, Arial, sans-serif'),
      (this.ctx.textAlign = 'center'),
      (this.ctx.textBaseline = 'top'),
      (this.ctx.shadowColor = 'rgba(85,154,154,0.22)'),
      (this.ctx.shadowBlur = 8),
      (this.ctx.fillStyle = o ? '#e8e8e8' : '#fff'),
      (this.ctx.globalAlpha = 0.95),
      this.ctx.fillText(h, t, i + n * 1.45),
      this.ctx.restore());
  }
  drawIdleFlash(e) {
    const {
      centerX: t,
      centerY: i,
      radius: n,
      lastActiveTime: r,
      idleFlash: o,
      colors: s,
    } = e;
    if (Date.now() - r <= 6e3) return;
    const d = 0.7 + 0.3 * Math.abs(Math.sin(o * 1.2));
    (this.ctx.save(),
      (this.ctx.globalAlpha = 0.18 * d),
      this.ctx.beginPath(),
      this.ctx.arc(t, i, n * 1.18, 0, Math.PI * 2),
      (this.ctx.fillStyle = s.secondary),
      (this.ctx.filter = 'blur(2.5px)'),
      this.ctx.fill(),
      (this.ctx.filter = 'none'),
      this.ctx.restore());
  }
  drawFallbackCircle(e) {
    try {
      this.debug.warn('Drawing fallback circle');
      const { centerX: t, centerY: i, radius: n, pulsePhase: r, colors: o } = e;
      (this.ctx.clearRect(0, 0, e.width, e.height), this.ctx.save());
      const s = 1 + 0.1 * Math.sin(r),
        c = n * s;
      (this.ctx.beginPath(),
        this.ctx.arc(t, i, c + 10, 0, Math.PI * 2),
        (this.ctx.fillStyle = `${o.glow}40`),
        (this.ctx.filter = 'blur(6px)'),
        this.ctx.fill(),
        (this.ctx.filter = 'none'),
        this.ctx.beginPath(),
        this.ctx.arc(t, i, c, 0, Math.PI * 2),
        (this.ctx.fillStyle = o.primary),
        this.ctx.fill(),
        this.ctx.restore(),
        this.debug.log('Fallback circle drawn successfully'));
    } catch (t) {
      throw (this.debug.error('Even fallback drawing failed:', t), t);
    }
  }
}
class _ {
  state;
  debug;
  emergency;
  renderer;
  isRunning = !1;
  constructor(e, t, i) {
    ((this.debug = e),
      (this.emergency = t),
      (this.renderer = i),
      (this.state = {
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
      }));
  }
  start() {
    if (this.isRunning) {
      this.debug.warn('Animation already running');
      return;
    }
    (this.debug.log('Starting animation loop'),
      (this.isRunning = !0),
      this.emergency.clearEmergencyStop(),
      this.animate());
  }
  stop() {
    if (!this.isRunning) {
      this.debug.warn('Animation already stopped');
      return;
    }
    (this.debug.log('Stopping animation loop'),
      (this.isRunning = !1),
      this.state.animationFrameId &&
        (cancelAnimationFrame(this.state.animationFrameId),
        (this.state.animationFrameId = 0)));
  }
  animate = () => {
    if (this.emergency.shouldSkipAnimation()) {
      (this.debug.warn('Animation stopped due to emergency stop'), this.stop());
      return;
    }
    if (!this.isRunning) {
      this.debug.log('Animation stopped by external request');
      return;
    }
    (this.debug.debug('🔍 [AnimationController] Animation frame start'),
      this.updateAnimationPhases(),
      this.isRunning &&
        !this.emergency.isEmergencyStopRequested() &&
        (this.state.animationFrameId = requestAnimationFrame(this.animate)));
  };
  updateAnimationPhases() {
    ((this.state.pulsePhase += 0.05),
      (this.state.waveformPhase += 0.08),
      (this.state.gradientRotation += 0.02),
      this.state.gradientRotation > Math.PI * 2 &&
        (this.state.gradientRotation -= Math.PI * 2),
      (this.state.idleFlash += 0.08),
      this.state.idleFrame++,
      this.updateTimeDisplay());
  }
  updateTimeDisplay() {
    this.state.displayedTime +=
      (this.state.elapsedTime - this.state.displayedTime) * 0.18;
  }
  render(e) {
    if (this.emergency.shouldSkipAnimation()) return;
    const t = { ...e, ...this.state };
    this.emergency.safeCanvasOperation(
      () => (this.renderer.renderAll(t), !0),
      () => (this.renderer.drawFallbackCircle(t), !1),
      'render'
    );
  }
  addRipple(e, t, i) {
    Math.random() < 0.1 && e.push({ radius: t, alpha: 0.4, speed: 1 + i * 2 });
  }
  addParticle(e, t, i, n) {
    if (Math.random() < 0.05) {
      const r = Math.random() * Math.PI * 2,
        o = n + Math.random() * 20;
      e.push({
        x: t + Math.cos(r) * o,
        y: i + Math.sin(r) * o,
        alpha: 0.8,
        size: 2 + Math.random() * 3,
        speed: 0.5 + Math.random() * 1,
      });
    }
  }
  setVolumeLevel(e) {}
  markActivity() {
    ((this.state.lastActiveTime = Date.now()),
      this.debug.debug('User activity marked'));
  }
  setListening(e) {
    (e && this.markActivity(),
      this.debug.debug('Animation listening state:', e));
  }
  resetTime() {
    ((this.state.elapsedTime = 0),
      (this.state.displayedTime = 0),
      this.debug.log('Animation time reset'));
  }
  updateElapsedTime(e) {
    this.state.elapsedTime = e;
  }
  setTimeTarget(e) {
    ((this.state.timeTarget = e),
      this.debug.log('Animation time target set to:', e));
  }
  getState() {
    return { ...this.state };
  }
  isAnimating() {
    return this.isRunning;
  }
  forceRestart() {
    (this.debug.warn('🔧 Force restarting animation'),
      this.stop(),
      setTimeout(() => {
        this.start();
      }, 50));
  }
  cleanup() {
    (this.debug.log('Cleaning up animation controller'),
      this.stop(),
      (this.state = {
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
      }));
  }
}
class J {
  debug;
  emergency;
  canvas = null;
  resizeTimeout = null;
  debouncedResize;
  constructor(e, t) {
    ((this.debug = e),
      (this.emergency = t),
      (this.debouncedResize = this.debounce(() => {
        this.safeResize();
      }, 150)));
  }
  setCanvas(e) {
    ((this.canvas = e),
      this.debug.log('Canvas reference set for dimensions manager'));
  }
  initialize() {
    const e = {
      width: 400,
      height: 400,
      centerX: 200,
      centerY: 200,
      radius: 180,
    };
    return (this.debug.log('Dimensions initialized:', e), e);
  }
  calculateDimensions() {
    if (!this.canvas || !this.canvas.parentElement)
      return (
        this.debug.warn(
          'Canvas or container not available, using fallback dimensions'
        ),
        this.emergency.setFallbackDimensions()
      );
    try {
      const t = this.canvas.parentElement.getBoundingClientRect();
      this.debug.debug('Container dimensions:', {
        width: t.width,
        height: t.height,
      });
      const i = Math.max(200, t.width || 400),
        n = Math.max(200, t.height || 400),
        r = i / 2,
        o = n / 2,
        s = Math.max(60, Math.min(i, n) * 0.35),
        c = { width: i, height: n, centerX: r, centerY: o, radius: s };
      return (this.debug.log('Calculated dimensions:', c), c);
    } catch (e) {
      return (
        this.debug.error('Error calculating dimensions:', e),
        this.emergency.setFallbackDimensions()
      );
    }
  }
  applyDimensions(e) {
    if (!this.canvas)
      return (
        this.debug.error('Cannot apply dimensions - no canvas reference'),
        !1
      );
    try {
      return (
        (this.canvas.width = e.width),
        (this.canvas.height = e.height),
        (this.canvas.style.width = `${e.width}px`),
        (this.canvas.style.height = `${e.height}px`),
        this.debug.log('Dimensions applied successfully:', e),
        !0
      );
    } catch (t) {
      return (this.debug.error('Error applying dimensions:', t), !1);
    }
  }
  safeResize() {
    if (
      (this.debug.log('🔍 [DimensionsManager] Starting safe resize'),
      !this.emergency.startResize())
    )
      return (
        this.debug.warn('Resize operation blocked by emergency manager'),
        this.emergency.setFallbackDimensions()
      );
    try {
      const e = this.calculateDimensions(),
        t = this.applyDimensions(e);
      return (
        this.emergency.finishResize(t),
        t
          ? (this.debug.log('Resize completed successfully'), e)
          : (this.debug.warn('Resize failed, using fallback'),
            this.emergency.setFallbackDimensions())
      );
    } catch (e) {
      return (
        this.debug.error('Resize operation failed:', e),
        this.emergency.finishResize(!1),
        this.emergency.setFallbackDimensions()
      );
    }
  }
  setupResizeListener() {
    typeof window < 'u' &&
      (window.addEventListener('resize', this.debouncedResize),
      this.debug.log('Resize listener attached'));
  }
  removeResizeListener() {
    typeof window < 'u' &&
      (window.removeEventListener('resize', this.debouncedResize),
      this.debug.log('Resize listener removed'));
  }
  forceResize() {
    return (
      this.debug.warn('🔧 Force resize triggered'),
      this.resizeTimeout &&
        (clearTimeout(this.resizeTimeout), (this.resizeTimeout = null)),
      this.safeResize()
    );
  }
  debounce(e, t) {
    return () => {
      (this.resizeTimeout && clearTimeout(this.resizeTimeout),
        (this.resizeTimeout = window.setTimeout(() => {
          ((this.resizeTimeout = null), e());
        }, t)));
    };
  }
  validateDimensions(e) {
    const { width: t, height: i, radius: n } = e;
    return t <= 0 || i <= 0
      ? (this.debug.error(
          'Invalid dimensions: width or height is zero or negative'
        ),
        !1)
      : n <= 0 || n > Math.min(t, i) / 2
        ? (this.debug.error(
            'Invalid radius: must be positive and fit within dimensions'
          ),
          !1)
        : !0;
  }
  getOptimalRadius(e, t) {
    return Math.max(60, Math.min(e, t) * 0.35);
  }
  updateDimensions(e, t) {
    const i = { ...t, ...e };
    return (
      (e.width !== void 0 || e.height !== void 0) &&
        ((i.centerX = i.width / 2), (i.centerY = i.height / 2)),
      e.radius === void 0 &&
        (e.width !== void 0 || e.height !== void 0) &&
        (i.radius = this.getOptimalRadius(i.width, i.height)),
      this.validateDimensions(i)
        ? (this.debug.log('Dimensions updated:', i), i)
        : (this.debug.warn(
            'Invalid dimensions provided, keeping current state'
          ),
          t)
    );
  }
  cleanup() {
    (this.debug.log('Cleaning up dimensions manager'),
      this.removeResizeListener(),
      this.resizeTimeout &&
        (clearTimeout(this.resizeTimeout), (this.resizeTimeout = null)),
      (this.canvas = null));
  }
}
class Q {
  state;
  debug;
  constructor(e) {
    ((this.debug = e),
      (this.state = {
        isListening: !1,
        isHovered: !1,
        isActive: !1,
        volumeLevel: 0,
        mouseX: 0,
        mouseY: 0,
        isDarkMode: !1,
        colors: {
          primary: '#60a5fa',
          secondary: '#34d399',
          glow: '#10b981',
          name: 'blue-green',
        },
        ripples: [],
        particles: [],
      }),
      this.initializeDarkMode());
  }
  initializeDarkMode() {
    typeof window < 'u' &&
      window.matchMedia &&
      ((this.state.isDarkMode = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches),
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', e => {
          ((this.state.isDarkMode = e.matches),
            this.debug.log('Dark mode changed:', e.matches));
        }));
  }
  getState() {
    return { ...this.state };
  }
  updateExternalState(e) {
    let t = !1;
    (e.isHovered !== void 0 &&
      e.isHovered !== this.state.isHovered &&
      ((this.state.isHovered = e.isHovered), (t = !0)),
      e.isActive !== void 0 &&
        e.isActive !== this.state.isActive &&
        ((this.state.isActive = e.isActive), (t = !0)),
      e.mousePosition &&
        ((this.state.mouseX = e.mousePosition.x),
        (this.state.mouseY = e.mousePosition.y),
        (t = !0)),
      t && this.debug.debug('External state updated:', e));
  }
  setListening(e) {
    this.state.isListening !== e &&
      ((this.state.isListening = e),
      this.debug.log('Listening state changed:', e));
  }
  setVolumeLevel(e) {
    const t = Math.max(0, Math.min(1, e));
    this.state.volumeLevel !== t &&
      ((this.state.volumeLevel = t),
      this.debug.debug('Volume level updated:', t));
  }
  setMousePosition(e, t) {
    ((this.state.mouseX = e), (this.state.mouseY = t));
  }
  updateColors(e) {
    ((this.state.colors = { ...this.state.colors, ...e }),
      this.debug.log('Colors updated:', this.state.colors));
  }
  setColorScheme(e) {
    ((this.state.colors = { ...e }), this.debug.log('Color scheme set:', e));
  }
  addRipple(e, t = 0.4, i = 1) {
    (this.state.ripples.push({ radius: e, alpha: t, speed: i }),
      this.debug.debug('Ripple added:', { radius: e, alpha: t, speed: i }));
  }
  addParticle(e, t, i = 0.8, n = 2, r = 1) {
    (this.state.particles.push({ x: e, y: t, alpha: i, size: n, speed: r }),
      this.debug.debug('Particle added:', {
        x: e,
        y: t,
        alpha: i,
        size: n,
        speed: r,
      }));
  }
  clearRipples() {
    ((this.state.ripples = []), this.debug.debug('All ripples cleared'));
  }
  clearParticles() {
    ((this.state.particles = []), this.debug.debug('All particles cleared'));
  }
  clearAllEffects() {
    (this.clearRipples(),
      this.clearParticles(),
      this.debug.log('All visual effects cleared'));
  }
  isHovered() {
    return this.state.isHovered;
  }
  isActive() {
    return this.state.isActive;
  }
  isListening() {
    return this.state.isListening;
  }
  getVolumeLevel() {
    return this.state.volumeLevel;
  }
  getMousePosition() {
    return { x: this.state.mouseX, y: this.state.mouseY };
  }
  isDarkMode() {
    return this.state.isDarkMode;
  }
  getColors() {
    return { ...this.state.colors };
  }
  getRipples() {
    return this.state.ripples;
  }
  getParticles() {
    return this.state.particles;
  }
  reset() {
    this.debug.log('Resetting visual state');
    const e = this.state.colors,
      t = this.state.isDarkMode;
    this.state = {
      isListening: !1,
      isHovered: !1,
      isActive: !1,
      volumeLevel: 0,
      mouseX: 0,
      mouseY: 0,
      isDarkMode: t,
      colors: e,
      ripples: [],
      particles: [],
    };
  }
  getRenderState() {
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
  forceUpdateDarkMode() {
    if (typeof window < 'u' && window.matchMedia) {
      const e = this.state.isDarkMode;
      ((this.state.isDarkMode = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches),
        e !== this.state.isDarkMode &&
          this.debug.log('Dark mode force updated:', this.state.isDarkMode));
    }
  }
}
class B {
  debug;
  emergency;
  renderer;
  animation;
  dimensions;
  state;
  canvas;
  ctx;
  currentDimensions;
  isInitialized = !1;
  constructor(e, t) {
    ((this.debug = new f()),
      (this.emergency = new U(this.debug)),
      (this.renderer = new K(null, this.debug)),
      (this.animation = new _(this.debug, this.emergency, this.renderer)),
      (this.dimensions = new J(this.debug, this.emergency)),
      (this.state = new Q(this.debug)),
      this.debug.log('🚀 [SiriButton] Modular architecture initializing...'),
      this.debug.log('  📦 Container ID:', e),
      t
        ? (this.state.setColorScheme(t),
          this.debug.log('  🎨 Custom colors applied:', t))
        : this.state.setColorScheme({
            primary: '#5DB6B9',
            secondary: '#E8B554',
            glow: 'rgba(93, 182, 185, 0.4)',
            name: 'English',
          }));
    const i = {
      userAgent: navigator.userAgent,
      isMobile:
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ),
      isTouch: 'ontouchstart' in window,
      screen: {
        width: window.screen?.width || 375,
        height: window.screen?.height || 667,
        devicePixelRatio: window.devicePixelRatio,
      },
    };
    (this.debug.log('🔍 [SiriButton] DEVICE INFO:', i),
      this.initializeCanvas(e),
      this.setupModules(),
      this.startSystems(),
      this.debug.log('✅ [SiriButton] Modular initialization completed'));
  }
  initializeCanvas(e) {
    this.debug.log('🎨 [SiriButton] Initializing canvas for container:', e);
    const t = document.getElementById(e);
    if (!t)
      throw (
        this.debug.error('❌ [SiriButton] Container element not found:', e),
        new Error(`Container element not found: ${e}`)
      );
    ((this.canvas = document.createElement('canvas')),
      (this.canvas.style.position = 'absolute'),
      (this.canvas.style.inset = '2px'),
      (this.canvas.style.borderRadius = '50%'),
      (this.canvas.style.display = 'block'),
      (this.canvas.style.background = 'transparent'),
      (this.canvas.style.zIndex = '1'),
      (this.canvas.style.pointerEvents = 'none'),
      this.canvas.setAttribute('data-siri-canvas', 'true'),
      this.canvas.setAttribute(
        'data-mobile-debug',
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
          ? 'mobile'
          : 'desktop'
      ),
      (this.canvas.id = `${e}-canvas`),
      t.appendChild(this.canvas));
    const i = this.canvas.getContext('2d');
    if (!i)
      throw (
        this.debug.error('❌ [SiriButton] Could not get canvas context'),
        new Error('Could not get canvas context')
      );
    ((this.ctx = i),
      this.debug.log('✅ [SiriButton] Canvas created and context obtained'),
      setTimeout(() => {
        (this.debug.debug('🔍 [SiriButton] CANVAS VERIFICATION:'),
          this.debug.debug(
            '  🎨 Canvas in DOM:',
            document.contains(this.canvas)
          ),
          this.debug.debug(
            '  🎨 Canvas rect:',
            this.canvas.getBoundingClientRect()
          ));
      }, 200));
  }
  setupModules() {
    (this.debug.log('🔧 [SiriButton] Setting up module configuration...'),
      this.emergency.setCanvasReferences(this.canvas, this.ctx),
      this.dimensions.setCanvas(this.canvas),
      (this.renderer.ctx = this.ctx),
      this.dimensions.setupResizeListener(),
      this.debug.log('✅ [SiriButton] Module configuration completed'));
  }
  startSystems() {
    (this.debug.log('🚀 [SiriButton] Starting systems...'),
      (this.currentDimensions = this.dimensions.initialize()),
      setTimeout(() => {
        ((this.currentDimensions = this.dimensions.safeResize()),
          this.debug.log(
            '📐 Initial resize completed:',
            this.currentDimensions
          ),
          this.animation.start(),
          this.renderFrame(),
          (this.isInitialized = !0),
          this.debug.log('✅ [SiriButton] All systems started'));
      }, 100),
      setTimeout(() => {
        ((this.currentDimensions = this.dimensions.safeResize()),
          this.renderFrame(),
          this.debug.log(
            '📱 [SiriButton] Mobile compatibility resize completed'
          ));
      }, 300));
  }
  renderFrame() {
    if (!this.isInitialized || this.emergency.shouldSkipAnimation()) return;
    const e = this.state.getRenderState(),
      t = { ...this.currentDimensions, ...e, ...this.animation.getState() };
    this.animation.render(t);
  }
  updateColors(e) {
    (this.state.setColorScheme(e),
      this.debug.log('🎨 [SiriButton] Colors updated:', e));
  }
  static setDebugLevel(e) {
    f.setDebugLevel(e);
  }
  static getDebugLevel() {
    return f.getDebugLevel();
  }
  emergencyStopPublic() {
    (this.emergency.triggerEmergencyStop(),
      this.animation.stop(),
      this.debug.warn('[SiriButton] Emergency stop triggered via public API'));
  }
  setListening(e) {
    (this.state.setListening(e),
      this.animation.setListening(e),
      this.debug.log('🎤 [SiriButton] Listening state:', e));
  }
  setVolumeLevel(e) {
    (this.state.setVolumeLevel(e), this.animation.setVolumeLevel(e));
  }
  setTime(e, t = 60) {
    (this.animation.updateElapsedTime(e), this.animation.setTimeTarget(t));
  }
  getTime() {
    const e = this.animation.getState();
    return { elapsed: e.elapsedTime, target: e.timeTarget };
  }
  setInteractionMode(e) {
    const t = { isHovered: e === 'hover', isActive: e === 'active' };
    (this.state.updateExternalState(t),
      this.animation.markActivity(),
      this.debug.debug('👆 [SiriButton] Interaction mode:', e));
  }
  setTouchPosition(e, t) {
    (this.state.setMousePosition(e, t),
      this.state.updateExternalState({ mousePosition: { x: e, y: t } }));
  }
  updateVisualState(e) {
    (this.state.updateExternalState(e), this.animation.markActivity());
  }
  cleanup() {
    if (
      (this.debug.log('🧹 [SiriButton] Cleaning up modular components...'),
      this.animation.stop(),
      this.animation.cleanup(),
      this.dimensions.cleanup(),
      this.state.reset(),
      this.canvas &&
        this.canvas.parentElement &&
        document.contains(this.canvas))
    )
      try {
        (this.canvas.parentElement.removeChild(this.canvas),
          this.debug.log('✅ [SiriButton] Canvas removed successfully'));
      } catch (e) {
        this.debug.warn('[SiriButton] Error removing canvas:', e);
      }
    ((this.canvas = null),
      (this.ctx = null),
      (this.isInitialized = !1),
      this.debug.log('✅ [SiriButton] Cleanup completed'));
  }
}
typeof window < 'u' &&
  ((window.SiriDebugControls = {
    setLevel: u => {
      (B.setDebugLevel(u),
        a.debug('🔧 Voice debug level set to: ${level}', 'Component'));
    },
    getLevel: () => B.getDebugLevel(),
    silent: () => B.setDebugLevel(0),
    errorsOnly: () => B.setDebugLevel(1),
    verbose: () => B.setDebugLevel(2),
    help: () => {
      a.debug(
        [
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
          '- Enhanced mobile debugging support',
        ].join(`
`),
        'Component'
      );
    },
  }),
  (window.voiceDebugOff = () => B.setDebugLevel(0)),
  (window.voiceDebugOn = () => B.setDebugLevel(2)));
const Z = ({ isListening: u, volumeLevel: e, colors: t, size: i = 280 }) => {
    const [n, r] = p.useState(0),
      [o, s] = p.useState([]);
    (p.useEffect(() => {
      let l,
        x = 0;
      const y = C => {
        (C - x >= 16 &&
          (r(v => v + 0.05),
          s(v =>
            v
              .map(E => ({
                ...E,
                scale: E.scale + 0.02,
                opacity: E.opacity - 0.01,
              }))
              .filter(E => E.opacity > 0)
          ),
          (x = C)),
          (l = requestAnimationFrame(y)));
      };
      return (
        (l = requestAnimationFrame(y)),
        () => {
          l && cancelAnimationFrame(l);
        }
      );
    }, []),
      p.useEffect(() => {
        if (u) {
          const l = setInterval(() => {
            s(x => [...x, { id: Date.now(), scale: 1, opacity: 0.4 }]);
          }, 300);
          return () => clearInterval(l);
        }
      }, [u]));
    const c = 1 + 0.1 * Math.sin(n),
      d = u ? e * 0.3 : 0,
      h = c + d;
    return b.jsxs('div', {
      style: {
        position: 'relative',
        width: i,
        height: i,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      children: [
        o.map(l =>
          b.jsx(
            'div',
            {
              style: {
                position: 'absolute',
                width: i,
                height: i,
                borderRadius: '50%',
                border: `2px solid ${t.primary}`,
                transform: `scale(${l.scale})`,
                opacity: l.opacity,
                pointerEvents: 'none',
              },
            },
            l.id
          )
        ),
        b.jsx('div', {
          style: {
            position: 'absolute',
            width: i + 40,
            height: i + 40,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${t.glow} 0%, transparent 70%)`,
            transform: `scale(${h})`,
            opacity: u ? 0.8 : 0.4,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
          },
        }),
        b.jsx('div', {
          style: {
            position: 'absolute',
            width: i,
            height: i,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})`,
            transform: `scale(${h})`,
            boxShadow: `0 0 ${u ? 40 : 20}px ${t.glow}`,
            transition: 'box-shadow 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          },
          children: b.jsx('div', {
            style: {
              color: 'white',
              fontSize: i * 0.25,
              textShadow: '0 0 20px rgba(255,255,255,0.8)',
              transform: `scale(${1 + e * 0.2})`,
              transition: 'transform 0.1s ease',
            },
            children: '🎤',
          }),
        }),
        u &&
          b.jsx('div', {
            style: {
              position: 'absolute',
              bottom: -40,
              left: '50%',
              transform: 'translateX(-50%)',
              color: t.primary,
              fontSize: 14,
              fontWeight: 'bold',
              textAlign: 'center',
              animation: 'pulse 1.5s infinite',
            },
            children: 'Listening...',
          }),
        b.jsx('style', {
          children: `
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `,
        }),
      ],
    });
  },
  A = () =>
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0,
  ee = () => ({
    isMobile: A(),
    hasTouch: 'ontouchstart' in window,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    devicePixelRatio: window.devicePixelRatio || 1,
  }),
  te = u => {
    const e = ee();
    logger.debug('📱 [${context}] Device Info:', 'Component', {
      isMobile: e.isMobile,
      hasTouch: e.hasTouch,
      maxTouchPoints: e.maxTouchPoints,
      screen: `${e.screenWidth}x${e.screenHeight}`,
      dpr: e.devicePixelRatio,
    });
  },
  ie = ({
    isListening: u,
    volumeLevel: e,
    containerId: t,
    onCallStart: i,
    onCallEnd: n,
    language: r = 'en',
    colors: o,
  }) => {
    const s = (m, ...g) => {},
      c = (m, ...g) => {},
      d = (m, ...g) => {
        a.error('[SiriCallButton] ${message}', 'Component', ...g);
      },
      h = p.useRef(null),
      l = p.useRef(!1),
      [x, y] = p.useState('idle'),
      [C, S] = p.useState(!1),
      v = p.useRef(!1),
      E = p.useRef(0),
      z = 3,
      M = p.useRef(!1),
      D = p.useCallback(() => {
        if (!l.current) {
          l.current = !0;
          try {
            if (h.current) {
              try {
                h.current.cleanup();
              } catch (g) {
                c('Cleanup error:', g);
              }
              h.current = null;
            }
            const m = document.getElementById(t);
            if (m)
              try {
                m.querySelectorAll('canvas').forEach(T => {
                  T.parentElement &&
                    document.contains(T) &&
                    T.parentElement.removeChild(T);
                });
              } catch (g) {
                d('Failed to remove canvases:', g);
              }
            S(!1);
          } catch (m) {
            d('Safe cleanup failed:', m);
          }
        }
      }, [t]),
      L = p.useCallback(() => {
        (c(), (M.current = !0));
        try {
          if (h.current)
            try {
              typeof h.current.emergencyStopPublic == 'function' &&
                h.current.emergencyStopPublic();
            } catch (m) {
              d('Failed to emergency stop SiriButton:', m);
            }
          (D(), c('🚨 EMERGENCY STOP COMPLETED'));
        } catch (m) {
          d('Emergency stop failed:', m);
        }
      }, [D]),
      $ = p.useCallback((m, g) => {
        (h.current &&
          (h.current.setInteractionMode('active'),
          g && h.current.setTouchPosition(g.x, g.y)),
          s('🎯 [SiriCallButton] Interaction start:', { position: g }));
      }, []),
      F = p.useCallback(
        async m => {
          if (
            (s(),
            s('  🎯 Event type:', m.type),
            s('  🎯 Event target:', m.target),
            h.current && (h.current.setInteractionMode('idle'), s()),
            v.current)
          ) {
            s();
            return;
          }
          ((v.current = !0),
            s(),
            s('  🎧 isListening:', u),
            s('  ✅ onCallStart available:', !!i),
            s('  ✅ onCallEnd available:', !!n));
          try {
            if (!u && i) {
              (y('listening'),
                s(
                  '🎤 [SiriCallButton] 🟢 STARTING CALL - Calling onCallStart()...'
                ));
              try {
                (await i(),
                  s(
                    '🎤 [SiriCallButton] ✅ onCallStart() completed successfully'
                  ));
              } catch (g) {
                (d('🎤 [SiriCallButton] ❌ onCallStart() error:', g),
                  y('idle'));
              }
            } else
              u && n
                ? (y('processing'),
                  s(
                    '🛑 [SiriCallButton] 🔴 ENDING CALL - Calling onCallEnd()...'
                  ),
                  n(),
                  s('🛑 [SiriCallButton] ✅ onCallEnd() completed'),
                  setTimeout(() => y('idle'), 500))
                : (s('🔔 [SiriCallButton] ⚠️ NO ACTION TAKEN:'),
                  s('  🎧 isListening:', u),
                  s('  🎤 onCallStart available:', !!i),
                  s('  🛑 onCallEnd available:', !!n));
          } finally {
            setTimeout(() => {
              ((v.current = !1), s());
            }, 100);
          }
          s();
        },
        [u, i, n]
      ),
      P = p.useCallback(m => {
        h.current && h.current.setInteractionMode(m ? 'hover' : 'idle');
      }, []);
    (p.useEffect(() => {
      if (A())
        return (
          s(),
          S(!0),
          () => {
            ((v.current = !1), s());
          }
        );
      if (M.current) {
        c();
        return;
      }
      if ((E.current++, E.current > z)) {
        (d(), L());
        return;
      }
      ((l.current = !1), (M.current = !1), s());
      const g = document.getElementById(t);
      if (!g) {
        c('Container element not found:', t);
        return;
      }
      g.querySelectorAll('canvas').forEach(R => {
        R.parentElement &&
          document.contains(R) &&
          R.parentElement.removeChild(R);
      });
      try {
        ((h.current = new B(t, o)),
          S(!0),
          setTimeout(() => {
            h.current &&
              !l.current &&
              !M.current &&
              (s('🔧 [SiriCallButton] Single resize for mobile compatibility'),
              window.dispatchEvent(new Event('resize')));
          }, 200));
      } catch (R) {
        (d('Init error:', R),
          E.current < z
            ? setTimeout(() => {
                if (!l.current && !M.current)
                  try {
                    ((h.current = new B(t, o)),
                      S(!0),
                      s(
                        '🔧 [SiriCallButton] Retry successful - no additional resize needed'
                      ));
                  } catch (k) {
                    (d('Retry failed:', k), E.current >= z && L());
                  }
              }, 200)
            : (d(), L()));
      }
      const O = A();
      if (
        (te(),
        a.debug(
          '📱 [SiriCallButton] Device detection - isMobile:',
          'Component',
          O
        ),
        O)
      )
        return () => {
          D();
        };
      {
        const R = () => {
            (P(!0),
              a.debug(
                '🖱️ [SiriCallButton] 🟢 DESKTOP Mouse enter',
                'Component'
              ));
          },
          k = () => {
            (P(!1),
              a.debug(
                '🖱️ [SiriCallButton] 🔴 DESKTOP Mouse leave',
                'Component'
              ));
          },
          V = w => {
            (a.debug(
              '🖱️ [SiriCallButton] 🔽 DESKTOP Mouse down - event target:',
              'Component',
              w.target
            ),
              a.debug('🖱️ [SiriCallButton] 🔽 Element ID:', 'Component', g.id),
              a.debug(
                '🖱️ [SiriCallButton] 🔽 isHandlingClick before:',
                'Component',
                v.current
              ));
            const H = g.getBoundingClientRect();
            ($(w, { x: w.clientX - H.left, y: w.clientY - H.top }),
              a.debug(
                '🖱️ [SiriCallButton] 🔽 Mouse down completed',
                'Component'
              ));
          },
          j = w => {
            (a.debug(
              '🖱️ [SiriCallButton] 🔼 DESKTOP Mouse up - event target:',
              'Component',
              w.target
            ),
              a.debug(
                '🖱️ [SiriCallButton] 🔼 onCallStart available:',
                'Component',
                !!i
              ),
              a.debug(
                '🖱️ [SiriCallButton] 🔼 isListening state:',
                'Component',
                u
              ),
              a.debug(
                '🖱️ [SiriCallButton] 🔼 isHandlingClick before:',
                'Component',
                v.current
              ),
              F(w),
              a.debug(
                '🖱️ [SiriCallButton] 🔼 Mouse up - triggering action completed',
                'Component'
              ));
          };
        (a.debug('🖱️ [SiriCallButton] 🎯 DESKTOP EVENT SETUP:', 'Component'),
          a.debug('  📦 Element ID:', 'Component', g.id),
          a.debug('  📦 Element tagName:', 'Component', g.tagName),
          a.debug('  🎛️ onCallStart available:', 'Component', !!i),
          a.debug('  🎛️ onCallEnd available:', 'Component', !!n),
          a.debug(
            '  🎨 Element computed style:',
            'Component',
            window.getComputedStyle(g).pointerEvents
          ));
        const N = w => {
          (a.debug(
            '🎯 [SiriCallButton] 🔥 MANUAL TEST CLICK DETECTED!',
            'Component'
          ),
            a.debug('  🎯 Click target:', 'Component', w.target),
            a.debug(
              '  🎯 Click coordinates:',
              'Component',
              w.clientX,
              w.clientY
            ),
            a.debug(
              '  🎯 Element rect:',
              'Component',
              g.getBoundingClientRect()
            ),
            a.debug('  🎯 onCallStart available:', 'Component', !!i));
        };
        return (
          g.addEventListener('click', N),
          g.addEventListener('mouseenter', R),
          g.addEventListener('mouseleave', k),
          g.addEventListener('mousedown', V),
          g.addEventListener('mouseup', j),
          a.debug(
            '🖱️ [SiriCallButton] ✅ Desktop mouse events added successfully',
            'Component'
          ),
          () => {
            (a.debug(
              '🖱️ [SiriCallButton] 🧹 Cleaning up desktop mouse events',
              'Component'
            ),
              (v.current = !1),
              s(),
              g.removeEventListener('click', N),
              g.removeEventListener('mouseenter', R),
              g.removeEventListener('mouseleave', k),
              g.removeEventListener('mousedown', V),
              g.removeEventListener('mouseup', j),
              D());
          }
        );
      }
    }, [t, o, $, F, P, D, i, u]),
      p.useEffect(() => {
        h.current &&
          !l.current &&
          (h.current.setListening(u),
          a.debug(
            '🔧 [SiriCallButton] Listening state updated without resize trigger',
            'Component'
          ));
      }, [u, t]),
      p.useEffect(() => {
        h.current && !l.current && h.current.setVolumeLevel(e);
      }, [e]),
      p.useEffect(() => {
        h.current && o && !l.current && h.current.updateColors(o);
      }, [o]));
    const I = async m => {
      if (m.type === 'touchend' || m.type === 'click') {
        if (
          (s(),
          s('  📱 Event type:', m.type),
          s('  📱 Event target:', m.target),
          v.current)
        ) {
          s();
          return;
        }
        ((v.current = !0),
          s(),
          s('  🎧 isListening:', u),
          s('  ✅ onCallStart available:', !!i),
          s('  ✅ onCallEnd available:', !!n));
        try {
          if (!u && i) {
            (y('listening'),
              s('📱 [SiriCallButton] 🟢 MOBILE - STARTING CALL'));
            try {
              (await i(),
                s(
                  '📱 [SiriCallButton] ✅ Mobile onCallStart() completed successfully'
                ));
            } catch (g) {
              (d('📱 [SiriCallButton] ❌ Mobile onCallStart() error:', g),
                y('idle'));
            }
          } else
            u && n
              ? (y('processing'),
                s('📱 [SiriCallButton] 🔴 MOBILE - ENDING CALL'),
                n(),
                s('📱 [SiriCallButton] ✅ Mobile onCallEnd() completed'),
                setTimeout(() => y('idle'), 500))
              : (s('📱 [SiriCallButton] ⚠️ MOBILE NO ACTION TAKEN:'),
                s('  📱 isListening:', u),
                s('  📱 onCallStart available:', !!i),
                s('  📱 onCallEnd available:', !!n));
        } finally {
          setTimeout(() => {
            ((v.current = !1), s());
          }, 100);
        }
        s();
      }
    };
    return b.jsxs('div', {
      id: t,
      className: 'voice-button',
      onTouchStart: I,
      onTouchEnd: I,
      onClick: I,
      style: {
        width: '100%',
        height: '100%',
        position: 'relative',
        cursor: 'pointer',
        zIndex: 10,
        borderRadius: '50%',
        pointerEvents: 'auto',
        overflow: 'visible',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
      },
      children: [
        !1,
        A() &&
          C &&
          b.jsx('div', {
            style: {
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            },
            children: b.jsx(Z, {
              isListening: u,
              volumeLevel: e,
              colors: o || {
                primary: '#5DB6B9',
                secondary: '#E8B554',
                glow: 'rgba(93, 182, 185, 0.4)',
                name: 'English',
              },
              size: Math.min(
                300,
                Math.min(
                  parseInt(
                    getComputedStyle(
                      document.getElementById(t) || document.body
                    ).width
                  ) - 20,
                  parseInt(
                    getComputedStyle(
                      document.getElementById(t) || document.body
                    ).height
                  ) - 20
                )
              ),
            }),
          }),
        !C &&
          !A() &&
          b.jsx('div', {
            className:
              'absolute inset-0 rounded-full flex items-center justify-center',
            style: {
              background: `linear-gradient(135deg, ${o?.primary || '#5DB6B9'}, ${o?.secondary || '#E8B554'})`,
              color: 'white',
              fontSize: '36px',
              boxShadow: `0 0 30px ${o?.glow || 'rgba(93, 182, 185, 0.4)'}`,
              border: '2px solid rgba(255,255,255,0.1)',
              pointerEvents: 'none',
            },
            children: '🎤',
          }),
        x !== 'idle' &&
          x !== 'listening' &&
          b.jsx('div', {
            className: `status-indicator ${x}`,
            style: {
              position: 'absolute',
              top: '-48px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: o?.primary || '#5DB6B9',
              textShadow: `0 0 10px ${o?.glow || 'rgba(93, 182, 185, 0.4)'}`,
              pointerEvents: 'none',
            },
            children: x === 'processing' ? 'Processing...' : 'Speaking...',
          }),
      ],
    });
  },
  X = {
    en: {
      primary: '#5DB6B9',
      secondary: '#E8B554',
      glow: 'rgba(93, 182, 185, 0.4)',
      name: 'English',
    },
    fr: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      glow: 'rgba(139, 92, 246, 0.4)',
      name: 'Français',
    },
    zh: {
      primary: '#EF4444',
      secondary: '#FCA5A5',
      glow: 'rgba(239, 68, 68, 0.4)',
      name: '中文',
    },
    ru: {
      primary: '#10B981',
      secondary: '#6EE7B7',
      glow: 'rgba(16, 185, 129, 0.4)',
      name: 'Русский',
    },
    ko: {
      primary: '#F59E0B',
      secondary: '#FDE68A',
      glow: 'rgba(245, 158, 11, 0.4)',
      name: '한국어',
    },
    vi: {
      primary: '#EC4899',
      secondary: '#F9A8D4',
      glow: 'rgba(236, 72, 153, 0.4)',
      name: 'Tiếng Việt',
    },
  },
  ae = ({
    isCallStarted: u,
    micLevel: e,
    onCallStart: t,
    onCallEnd: i,
    onCancel: n,
    onConfirm: r,
    showingSummary: o = !1,
  }) => {
    const { language: s } = W(),
      c = G(),
      [d, h] = p.useState(!1),
      l = X[s] || X.en;
    (a.debug(
      '🎨 [SiriButtonContainer] Language:',
      'Component',
      s,
      'Colors:',
      l.name,
      'Primary:',
      l.primary
    ),
      a.debug('📏 [SiriButtonContainer] Responsive size:', 'Component', c),
      p.useEffect(() => {
        u || h(!1);
      }, [u]));
    const x = async C => {
        if (d) {
          a.debug(
            '🛡️ [SiriButtonContainer] Call start blocked - confirming in progress',
            'Component'
          );
          return;
        }
        (a.debug(
          '🎤 [SiriButtonContainer] Starting call normally...',
          'Component'
        ),
          await t(C));
      },
      y = () => {
        a.debug('✅ [SiriButtonContainer] Confirming call', 'Component');
        try {
          (r(),
            a.debug(
              '✅ [SiriButtonContainer] Call confirmed successfully',
              'Component'
            ));
        } catch (C) {
          if (
            (a.error(
              '❌ [SiriButtonContainer] Error confirming call:',
              'Component',
              C
            ),
            typeof window < 'u')
          ) {
            const S = C instanceof Error ? C.message : 'Lỗi không xác định';
            alert(`Lỗi khi xác nhận cuộc gọi: ${S}`);
          }
        }
      };
    return b.jsxs('div', {
      className: 'flex flex-col items-center justify-center w-full relative',
      style: {
        marginBottom: Y.spacing.xl,
        zIndex: 9999,
        pointerEvents: 'auto',
        height: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      },
      children: [
        b.jsxs('div', {
          className:
            'flex items-center justify-center gap-4 w-full max-w-sm px-4',
          style: {
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            height: '40px',
            opacity: 0,
            visibility: 'hidden',
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease-in-out',
            zIndex: 1,
          },
          children: [
            b.jsx('button', {
              onClick: n,
              disabled: !0,
              className:
                'px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-semibold transition-all duration-200 active:scale-95',
              style: { minWidth: '80px' },
              children: 'Cancel',
            }),
            b.jsx('button', {
              onClick: y,
              disabled: !0,
              className:
                'px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm font-semibold transition-all duration-200 active:scale-95',
              style: { minWidth: '80px' },
              children: 'Confirm',
            }),
          ],
        }),
        b.jsx('div', {
          className: `relative transition-all duration-500 ease-in-out voice-button ${u ? 'listening' : ''} ${d ? 'confirming' : ''}`,
          'data-language': s,
          style: {
            width: c.width,
            height: c.height,
            minWidth: c.minWidth,
            minHeight: c.minHeight,
            maxWidth: c.maxWidth,
            maxHeight: c.maxHeight,
            borderRadius: '50%',
            boxShadow: d
              ? '0 10px 20px rgba(128, 128, 128, 0.3), 0 0 30px rgba(128, 128, 128, 0.2)'
              : `0 20px 40px ${l.glow}, 0 0 60px ${l.glow}`,
            background: d
              ? 'linear-gradient(135deg, #80808020, #80808010)'
              : `linear-gradient(135deg, ${l.primary}15, ${l.secondary}10)`,
            backdropFilter: 'blur(10px)',
            border: d ? '2px solid #80808040' : `2px solid ${l.primary}40`,
            cursor: d ? 'not-allowed' : 'pointer',
            touchAction: 'manipulation',
            opacity: d ? 0.6 : 1,
            position: 'relative',
            flexShrink: 0,
            alignSelf: 'center',
            aspectRatio: '1',
            margin: '0 auto',
            contain: 'layout style',
          },
          children: b.jsx(ie, {
            containerId: 'main-siri-button',
            isListening: u,
            volumeLevel: e,
            onCallStart: () => x(s),
            onCallEnd: i,
            language: s,
            colors: l,
          }),
        }),
        b.jsx('div', {
          className: 'block mt-4 text-center transition-all duration-300',
          style: { fontSize: '1rem', fontWeight: '600' },
          children: d
            ? b.jsx('div', {
                style: {
                  color: '#808080',
                  textShadow: '0 2px 8px rgba(128, 128, 128, 0.3)',
                },
                children: '📋 Processing call summary...',
              })
            : u
              ? b.jsx('div', {
                  style: {
                    color: l.primary,
                    textShadow: `0 2px 8px ${l.glow}`,
                  },
                  children: '🎤 Listening... Tap to end call',
                })
              : b.jsx('div', {
                  style: {
                    color: l.primary,
                    textShadow: `0 2px 8px ${l.glow}`,
                  },
                  children: 'Tap To Speak',
                }),
        }),
        !1,
      ],
    });
  };
export { ae as S };
