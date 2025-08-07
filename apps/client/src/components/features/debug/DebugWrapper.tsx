import React from 'react';

interface DebugWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * DebugWrapper - Wraps debug components to only show in development
 *
 * Usage:
 * <DebugWrapper fallback={<div>Production safe content</div>}>
 *   <DebugButtons />
 * </DebugWrapper>
 */
export const DebugWrapper: React.FC<DebugWrapper> = ({ children, fallback = null }) => {
  const isDevelopment = import.meta.env.DEV;

  if (!isDevelopment) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * useDebugMode - Hook to check if debug mode is enabled
 */
export const useDebugMode = () => {
  return import.meta.env.DEV;
};

/**
 * DebugLog - Component for development-only logging
 */
export const DebugLog: React.FC<{ message: string; data?: any }> = ({
  message,
  data,
}) => {
  const isDevelopment = import.meta.env.DEV;

  React.useEffect(() => {
    if (isDevelopment) {
      console.log(`🔍 [DEBUG] ${message}`, data);
    }
  }, [message, data, isDevelopment]);

  return null;
};
