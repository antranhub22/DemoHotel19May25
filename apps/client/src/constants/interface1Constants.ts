/**
 * Interface1 Constants
 * 
 * Centralized configuration for Interface1 component
 * Replaces magic numbers and hardcoded values for better maintainability
 */

export const INTERFACE1_LAYOUT = {
  // Hero Section
  HERO_MIN_HEIGHT: '400px',
  HERO_PADDING_X: 'px-4',
  
  // Desktop Grid
  DESKTOP_GRID_COLS: 3,
  DESKTOP_GAP: 8, // gap-8
  DESKTOP_MARGIN_BOTTOM: 'mb-8',
  
  // Mobile Layout
  MOBILE_OVERLAY_BOTTOM: '40px',
  MOBILE_RIGHT_PANEL_TOP: 'top-8',
  MOBILE_RIGHT_PANEL_RIGHT: 'right-4',
  MOBILE_RIGHT_PANEL_WIDTH: 'w-80',
  
  // Z-Index Management (Critical for layering)
  Z_INDICES: {
    SIRI_BUTTON_MOBILE: 50,      // Highest - main interaction
    CONVERSATION_DESKTOP: 40,     // Desktop conversation
    CONVERSATION_MOBILE: 40,      // Mobile conversation overlay
    RIGHT_PANEL_DESKTOP: 30,      // Desktop right panel
    RIGHT_PANEL_MOBILE: 20,       // Mobile right panel
    SERVICE_GRID: 10,             // Service categories
    SCROLL_BUTTON: 20             // Scroll to top button
  },
  
  // Responsive Breakpoints
  BREAKPOINTS: {
    MOBILE_HIDDEN: 'block md:hidden',
    DESKTOP_HIDDEN: 'hidden md:block',
    MOBILE_SHOW: 'block',
    DESKTOP_SHOW: 'md:block'
  },
  
  // Container Sizing
  CONTAINERS: {
    MAX_WIDTH_SM: 'max-w-sm',     // Small containers
    MAX_WIDTH_MD: 'max-w-md',     // Medium containers
    MAX_WIDTH_FULL: 'max-w-full', // Full width
    WIDTH_FULL: 'w-full'
  },
  
  // Spacing & Margins
  SPACING: {
    SECTION_MARGIN_TOP: 'mt-16',  // Service grid margin
    GRID_MARGIN_BOTTOM: 'mb-8',   // Grid spacing
    PADDING_4: 'p-4',             // Standard padding
    PADDING_X_4: 'px-4'           // Horizontal padding
  }
} as const;

export const INTERFACE1_ANIMATIONS = {
  // Scroll Animations
  SCROLL: {
    BEHAVIOR: 'smooth' as const,
    DURATION: 300,
    AUTO_SCROLL_DELAY: 200 // Delay before auto-scroll to conversation
  },
  
  // Popup Timing
  POPUP: {
    SUMMARY_DELAY: 1500,          // Delay before showing summary
    NOTIFICATION_DELAY: 500,      // Delay for notification demo
    DEMO_DELAY: 500               // General demo delay
  },
  
  // CSS Transitions
  TRANSITIONS: {
    OPACITY: 'transition-opacity duration-500',
    TRANSFORM: 'transition-transform duration-300',
    COLORS: 'transition-colors duration-200',
    ALL: 'transition-all duration-200'
  },
  
  // Layout Transitions
  LAYOUT: {
    APPEAR: 'opacity-100',
    DISAPPEAR: 'opacity-0 pointer-events-none'
  }
} as const;

export const INTERFACE1_STYLING = {
  // Glassmorphism Effects
  GLASS: {
    BACKGROUND: 'rgba(255, 255, 255, 0.1)',
    BACKDROP_FILTER: 'blur(10px)',
    BORDER: '1px solid rgba(255, 255, 255, 0.2)'
  },
  
  // Shadow Effects
  SHADOWS: {
    CARD: '0 20px 40px rgba(0, 0, 0, 0.1)',
    BUTTON: '0 4px 12px rgba(0, 0, 0, 0.15)',
    OVERLAY: '0 0 60px rgba(0, 0, 0, 0.4)'
  },
  
  // Interactive States
  HOVER: {
    SCALE: 'hover:scale-105',
    BRIGHTNESS: 'hover:brightness-110',
    OPACITY: 'hover:opacity-90'
  },
  
  // Active States
  ACTIVE: {
    SCALE: 'active:scale-95',
    BRIGHTNESS: 'active:brightness-95'
  }
} as const;

export const INTERFACE1_ACCESSIBILITY = {
  // Touch Targets (Mobile)
  TOUCH: {
    MIN_SIZE: '44px',            // Minimum touch target size
    TOUCH_ACTION: 'manipulation', // Improve touch responsiveness
    TAP_HIGHLIGHT: 'transparent'  // Remove default tap highlight
  },
  
  // Focus States
  FOCUS: {
    RING: 'focus:ring-2 focus:ring-blue-500',
    OUTLINE: 'focus:outline-none'
  },
  
  // Screen Reader
  SR_ONLY: 'sr-only'
} as const; 