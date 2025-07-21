import { useState, useEffect } from 'react';
import { logger } from '@shared/utils/logger';

interface SiriSizeConfig {
  width: string;
  height: string;
  minWidth: string;
  minHeight: string;
  maxWidth: string;
  maxHeight: string;
}

/**
 * Hook for responsive Siri button sizing
 * Desktop: Fixed stable sizing for perfect alignment
 * Mobile: Optimized responsive sizing for better UX
 */
export const useSiriResponsiveSize = (): SiriSizeConfig => {
  const [isDesktop, setIsDesktop] = useState(() => {
    // Safe initial state - default to mobile on SSR
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 768;
  });

  useEffect(() => {
    const handleResize = () => {
      const newIsDesktop = window.innerWidth >= 768;
      if (newIsDesktop !== isDesktop) {
        setIsDesktop(newIsDesktop);
        logger.debug('🔄 [useSiriResponsiveSize] Platform changed:', 'Component', newIsDesktop ? 'Desktop' : 'Mobile');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDesktop]);

  if (isDesktop) {
    // Desktop: Fixed sizing for stable positioning
    return {
      width: '320px',
      height: '320px',
      minWidth: '320px',
      minHeight: '320px',
      maxWidth: '320px',
      maxHeight: '320px',
    };
  } else {
    // 🔧 FIX 1: Mobile responsive sizing optimization
    return {
      width: 'min(300px, 80vw)', // ✅ Increased from 75vw to 80vw for better size
      height: 'min(300px, 80vw)', // ✅ Increased max from 280px to 300px
      minWidth: '240px', // ✅ Reduced from 260px to 240px for small devices
      minHeight: '240px', // ✅ Better fit for very small screens
      maxWidth: '300px', // ✅ Increased from 280px to 300px for larger touch target
      maxHeight: '300px', // ✅ Consistent larger max size for mobile
    };
  }
};

/**
 * Hook to detect if device is mobile
 * Simplified version for Siri button usage
 */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return true; // SSR default to mobile
    return window.innerWidth < 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};
