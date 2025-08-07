import * as React from 'react';
import { useEffect, useRef } from 'react';
import { useDebugMode } from './DebugWrapper';

interface PerformanceMonitorProps {
  componentName: string;
  children: React.ReactNode;
}

/**
 * PerformanceMonitor - Monitors component performance in development
 */
export const PerformanceMonitor: React.FC<PerformanceMonitor> = ({ componentName, children }) => {
  const isDevelopment = useDebugMode();
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    if (isDevelopment) {
      renderCount.current += 1;
      const currentTime = performance.now();
      const timeSinceLastRender = currentTime - lastRenderTime.current;

      console.log(`📊 [Performance] ${componentName}:`, {
        renderCount: renderCount.current,
        timeSinceLastRender: `${timeSinceLastRender.toFixed(2)}ms`,
        timestamp: new Date().toISOString(),
      });

      lastRenderTime.current = currentTime;
    }
  });

  return <>{children}</>;
};

/**
 * usePerformanceMonitor - Hook for performance monitoring
 */
export const usePerformanceMonitor = (componentName: string) => {
  const isDevelopment = useDebugMode();
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    if (isDevelopment) {
      renderCount.current += 1;
      const currentTime = performance.now();
      const timeSinceLastRender = currentTime - lastRenderTime.current;

      console.log(`📊 [Performance] ${componentName}:`, {
        renderCount: renderCount.current,
        timeSinceLastRender: `${timeSinceLastRender.toFixed(2)}ms`,
        timestamp: new Date().toISOString(),
      });

      lastRenderTime.current = currentTime;
    }
  });

  return {
    renderCount: renderCount.current,
    isDevelopment,
  };
};
