export const designSystem = {
  colors: {
    primary: '#1B4E8B',      // Original blue-purple
    secondary: '#3B82F6',    // Original complementary blue
    accent: '#8B5CF6',       // Original purple accent
    surface: 'rgba(255, 255, 255, 0.1)',
    surfaceHover: 'rgba(255, 255, 255, 0.2)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.9)',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B'
  },
  fonts: {
    primary: "'Inter', 'Poppins', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  spacing: {
    xs: '8px',    // 8px grid base
    sm: '16px',   // 2 * 8px
    md: '24px',   // 3 * 8px
    lg: '32px',   // 4 * 8px
    xl: '40px',   // 5 * 8px
    '2xl': '48px' // 6 * 8px
  },
  shadows: {
    subtle: '0 2px 8px rgba(0, 0, 0, 0.1)',
    card: '0 4px 16px rgba(0, 0, 0, 0.15)',
    button: '0 2px 12px rgba(27, 78, 139, 0.3)',
    large: '0 8px 32px rgba(0, 0, 0, 0.2)'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px'
  },
  transitions: {
    fast: '0.15s ease-in-out',
    normal: '0.3s ease-in-out',
    slow: '0.5s ease-in-out'
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  zIndex: {
    base: 0,
    above: 1,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modal: 1300,
    popover: 1400,
    tooltip: 1500
  }
} as const;

// Utility type for type-safe access to design system values
export type DesignSystemColors = keyof typeof designSystem.colors;
export type DesignSystemSpacing = keyof typeof designSystem.spacing;
export type DesignSystemShadows = keyof typeof designSystem.shadows;
export type DesignSystemBorderRadius = keyof typeof designSystem.borderRadius;
export type DesignSystemTransitions = keyof typeof designSystem.transitions;
export type DesignSystemBreakpoints = keyof typeof designSystem.breakpoints;
export type DesignSystemZIndex = keyof typeof designSystem.zIndex; 