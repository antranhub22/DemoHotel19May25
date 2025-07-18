import { useState, useEffect } from 'react';

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
        console.log('🔄 [useSiriResponsiveSize] Platform changed:', newIsDesktop ? 'Desktop' : 'Mobile');
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
      maxHeight: '320px'
    };
  } else {
    // Mobile: Optimized responsive sizing
    return {
      width: 'min(280px, 75vw)',   // Reduced from 80vw to 75vw for better fit
      height: 'min(280px, 75vw)',  // Smaller size for mobile screens
      minWidth: '260px',           // Reduced from 280px for small devices
      minHeight: '260px',          // Better fit for very small screens
      maxWidth: '280px',           // Consistent max size for mobile
      maxHeight: '280px'           // Prevent too large on mobile
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