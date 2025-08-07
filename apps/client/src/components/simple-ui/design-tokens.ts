/**
 * Design Tokens for Simple UI System
 * Minimal, focused design system for Hotel Voice Assistant
 */

export const designTokens = {
    colors: {
        // Primary palette - focused on hotel experience
        primary: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb', // Main primary
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
        },

        // Semantic colors
        success: '#16a34a',
        warning: '#ea580c',
        danger: '#dc2626',

        // Neutral colors
        gray: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b', // Main gray
            600: '#475569',
            700: '#334155',
            800: '#1e293b', // Main dark
            900: '#0f172a',
        },

        // Special colors for voice assistant
        voice: {
            listening: '#3b82f6',
            speaking: '#16a34a',
            processing: '#ea580c',
            idle: '#64748b',
        },

        // Hotel branding (can be customized per hotel)
        brand: {
            primary: '#2563eb',
            secondary: '#64748b',
            accent: '#16a34a',
        }
    },

    typography: {
        fontFamily: {
            primary: 'Inter, system-ui, sans-serif',
            secondary: 'Poppins, system-ui, sans-serif',
        },

        fontSize: {
            xs: '0.75rem',     // 12px
            sm: '0.875rem',    // 14px  
            base: '1rem',      // 16px
            lg: '1.125rem',    // 18px
            xl: '1.25rem',     // 20px
            '2xl': '1.5rem',   // 24px
            '3xl': '1.875rem', // 30px
            '4xl': '2.25rem',  // 36px
        },

        fontWeight: {
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
        },

        lineHeight: {
            tight: '1.25',
            normal: '1.5',
            relaxed: '1.75',
        }
    },

    spacing: {
        0: '0',
        1: '0.25rem',  // 4px
        2: '0.5rem',   // 8px
        3: '0.75rem',  // 12px
        4: '1rem',     // 16px
        5: '1.25rem',  // 20px
        6: '1.5rem',   // 24px
        8: '2rem',     // 32px
        10: '2.5rem',  // 40px
        12: '3rem',    // 48px
        16: '4rem',    // 64px
        20: '5rem',    // 80px
        24: '6rem',    // 96px
    },

    borderRadius: {
        sm: '0.375rem',  // 6px
        md: '0.5rem',    // 8px
        lg: '0.75rem',   // 12px
        xl: '1rem',      // 16px
        full: '9999px',
    },

    boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    },

    // Mobile-first breakpoints
    breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
    },

    // Touch-friendly sizes
    touchTarget: {
        min: '44px', // Minimum touch target size
        comfortable: '48px',
        large: '56px',
    },

    // Animation durations
    animation: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
    },

    // Z-index scale
    zIndex: {
        dropdown: 1000,
        sticky: 1020,
        fixed: 1030,
        modal: 1040,
        popover: 1050,
        tooltip: 1060,
        toast: 1070,
    }
} as const;

export type DesignTokens = typeof designTokens;

// Helper functions for accessing tokens
export const getColor = (path: string) => {
    const keys = path.split('.');
    let value: any = designTokens.colors;

    for (const key of keys) {
        value = value?.[key];
    }

    return value || path;
};

export const getSpacing = (size: keyof typeof designTokens.spacing) => {
    return designTokens.spacing[size];
};

export const getFontSize = (size: keyof typeof designTokens.typography.fontSize) => {
    return designTokens.typography.fontSize[size];
};
