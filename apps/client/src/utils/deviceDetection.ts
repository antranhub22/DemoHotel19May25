import { logger } from '@shared/utils/logger';

/**
 * Device Detection Utilities
 * Centralized mobile/desktop detection to avoid code duplication
 */

export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const isTabletDevice = (): boolean => {
  return /iPad|Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) && window.innerWidth >= 768;
};

export const getScreenSize = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
  };
};

export const logDeviceInfo = (context: string) => {
  const deviceInfo = {
    isMobile: isMobileDevice(),
    isTablet: isTabletDevice(),
    screen: getScreenSize(),
    userAgent: navigator.userAgent,
  };
  
  logger.debug(`📱 [${context}] Device Info:`, 'Component', deviceInfo);
};
