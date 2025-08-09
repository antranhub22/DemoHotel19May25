export const ANIMATIONS = {
  // Durations
  durations: {
    instant: "0ms",
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
    verySlow: "1000ms",
  },

  // Easing functions
  easing: {
    // Standard
    linear: "linear",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",

    // Custom
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    smooth: "cubic-bezier(0.645, 0.045, 0.355, 1)",
  },

  // Performance optimizations
  transform: {
    gpu: "translate3d(0,0,0)",
    hardware: "translateZ(0)",
  },

  // Keyframes
  keyframes: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    slideUp: {
      from: { transform: "translateY(10px)", opacity: 0 },
      to: { transform: "translateY(0)", opacity: 1 },
    },
    scale: {
      from: { transform: "scale(0.95)", opacity: 0 },
      to: { transform: "scale(1)", opacity: 1 },
    },
  },
} as const;
