/**
 * Device Detection Utilities
 * Centralized mobile/desktop detection to avoid code duplication
 */

export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         ('ontouchstart' in window) ||
         (navigator.maxTouchPoints > 0);
};

export const getDeviceInfo = () => ({
  isMobile: isMobileDevice(),
  hasTouch: 'ontouchstart' in window,
  maxTouchPoints: navigator.maxTouchPoints || 0,
  userAgent: navigator.userAgent,
  screenWidth: window.screen.width,
  screenHeight: window.screen.height,
  devicePixelRatio: window.devicePixelRatio || 1
});

export const logDeviceInfo = (context: string) => {
  const info = getDeviceInfo();
  console.log(`📱 [${context}] Device Info:`, {
    isMobile: info.isMobile,
    hasTouch: info.hasTouch,
    maxTouchPoints: info.maxTouchPoints,
    screen: `${info.screenWidth}x${info.screenHeight}`,
    dpr: info.devicePixelRatio
  });
}; 