import { useState, useEffect, useRef, RefObject } from 'react';
import { INTERFACE_CONSTANTS } from '@/constants/interfaceConstants';

interface UseScrollBehaviorProps {
  isActive: boolean;
}

interface UseScrollBehaviorReturn {
  showScrollButton: boolean;
  scrollToTop: () => void;
  scrollToSection: (section: 'hero' | 'services' | 'conversation') => void;
  heroSectionRef: RefObject<HTMLDivElement>;
  serviceGridRef: RefObject<HTMLDivElement>;
  conversationRef: RefObject<HTMLDivElement>;
}

export const useScrollBehavior = ({ isActive }: UseScrollBehaviorProps): UseScrollBehaviorReturn => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // Refs for scroll targets
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const serviceGridRef = useRef<HTMLDivElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);

  // Throttle function for performance
  const throttle = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    let lastExecTime = 0;
    return (...args: any[]) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  };

  // Enhanced scroll handling
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowScrollButton(scrollY > INTERFACE_CONSTANTS.SCROLL_THRESHOLD);
      
      // Auto-highlight sections based on scroll position
      const heroSection = heroSectionRef.current;
      const serviceSection = serviceGridRef.current;
      
      if (heroSection && serviceSection) {
        const heroRect = heroSection.getBoundingClientRect();
        const serviceRect = serviceSection.getBoundingClientRect();
        
        // If service grid is partially visible, ensure it's fully visible
        if (serviceRect.top < window.innerHeight && serviceRect.bottom > 0) {
          if (serviceRect.top < 0 || serviceRect.bottom > window.innerHeight) {
            // Auto-adjust scroll to show service grid better
            const shouldScrollToService = serviceRect.top < INTERFACE_CONSTANTS.SCROLL_OFFSETS.NEGATIVE_TOP_THRESHOLD;
            if (shouldScrollToService) {
              serviceSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
              });
            }
          }
        }
      }
    };

    const throttledScroll = throttle(handleScroll, INTERFACE_CONSTANTS.THROTTLE_DELAY);
    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);

  // Reset scroll position when interface becomes inactive
  useEffect(() => {
    if (!isActive) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isActive]);

  // Scroll functions
  const scrollToSection = (section: 'hero' | 'services' | 'conversation') => {
    const refs = {
      hero: heroSectionRef,
      services: serviceGridRef,
      conversation: conversationRef
    };
    
    const targetRef = refs[section];
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: section === 'hero' ? 'start' : 'center',
        inline: 'nearest'
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    showScrollButton,
    scrollToTop,
    scrollToSection,
    heroSectionRef,
    serviceGridRef,
    conversationRef
  };
}; 