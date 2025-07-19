import { useScrollBehavior } from '@/hooks/useScrollBehavior';

/**
 * Hook quản lý scroll behavior cho Interface1
 * Wraps useScrollBehavior với Interface1-specific logic
 */
export interface Interface1Scroll {
  showScrollButton: boolean;
  scrollToTop: () => void;
  scrollToSection: (section: 'hero' | 'services' | 'conversation') => void;
}

export const useInterface1Scroll = ({ isActive }: { isActive: boolean }): Interface1Scroll => {
  const scrollBehavior = useScrollBehavior({ isActive });
  
  return {
    showScrollButton: scrollBehavior.showScrollButton,
    scrollToTop: scrollBehavior.scrollToTop,
    scrollToSection: scrollBehavior.scrollToSection
  };
}; 