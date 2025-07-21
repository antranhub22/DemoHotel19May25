import React, { useEffect, useState, useRef } from 'react';
import { useSiriResponsiveSize } from '@/hooks/useSiriResponsiveSize';
import { isMobileDevice } from '@/utils/deviceDetection';
import { logger } from '@shared/utils/logger';

interface DebugInfo {
  containerSize: { width: number; height: number };
  canvasSize: { width: number; height: number };
  deviceInfo: {
    isMobile: boolean;
    screen: string;
    viewport: string;
    dpr: number;
  };
  responsiveSize: any;
  alignment: {
    containerRect: DOMRect | null;
    canvasRect: DOMRect | null;
    offset: { x: number; y: number } | null;
  };
}

export const MobileDebugComponent: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const responsiveSize = useSiriResponsiveSize();

  useEffect(() => {
    const updateDebugInfo = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const canvas = container.querySelector('canvas');

      const containerRect = container.getBoundingClientRect();
      const canvasRect = canvas?.getBoundingClientRect() || null;

      let offset = null;
      if (containerRect && canvasRect) {
        const containerCenterX = containerRect.x + containerRect.width / 2;
        const containerCenterY = containerRect.y + containerRect.height / 2;
        const canvasCenterX = canvasRect.x + canvasRect.width / 2;
        const canvasCenterY = canvasRect.y + canvasRect.height / 2;

        offset = {
          x: canvasCenterX - containerCenterX,
          y: canvasCenterY - containerCenterY,
        };
      }

      setDebugInfo({
        containerSize: {
          width: containerRect.width,
          height: containerRect.height,
        },
        canvasSize: {
          width: canvasRect?.width || 0,
          height: canvasRect?.height || 0,
        },
        deviceInfo: {
          isMobile: isMobileDevice(),
          screen: `${window.screen.width}x${window.screen.height}`,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          dpr: window.devicePixelRatio || 1,
        },
        responsiveSize,
        alignment: {
          containerRect,
          canvasRect,
          offset,
        },
      });
    };

    // Update immediately
    updateDebugInfo();

    // Update on resize
    window.addEventListener('resize', updateDebugInfo);

    // Update periodically to catch canvas changes
    const interval = setInterval(updateDebugInfo, 1000);

    return () => {
      window.removeEventListener('resize', updateDebugInfo);
      clearInterval(interval);
    };
  }, [responsiveSize]);

  if (!debugInfo) return <div>Loading debug info...</div>;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        fontSize: '12px',
        zIndex: 99999,
        maxWidth: '300px',
        maxHeight: '50vh',
        overflow: 'auto',
      }}
    >
      <h3>🔍 Mobile Siri Debug</h3>

      <div style={{ marginBottom: '10px' }}>
        <strong>Device Info:</strong>
        <br />
        Mobile: {debugInfo.deviceInfo.isMobile ? '✅' : '❌'}
        <br />
        Screen: {debugInfo.deviceInfo.screen}
        <br />
        Viewport: {debugInfo.deviceInfo.viewport}
        <br />
        DPR: {debugInfo.deviceInfo.dpr}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Responsive Size:</strong>
        <br />
        Width: {debugInfo.responsiveSize.width}
        <br />
        Height: {debugInfo.responsiveSize.height}
        <br />
        MinWidth: {debugInfo.responsiveSize.minWidth}
        <br />
        MaxWidth: {debugInfo.responsiveSize.maxWidth}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Actual Container:</strong>
        <br />
        Width: {debugInfo.containerSize.width.toFixed(1)}px
        <br />
        Height: {debugInfo.containerSize.height.toFixed(1)}px
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Canvas:</strong>
        <br />
        Width: {debugInfo.canvasSize.width.toFixed(1)}px
        <br />
        Height: {debugInfo.canvasSize.height.toFixed(1)}px
        <br />
        Exists: {debugInfo.alignment.canvasRect ? '✅' : '❌'}
      </div>

      {debugInfo.alignment.offset && (
        <div style={{ marginBottom: '10px' }}>
          <strong>Alignment:</strong>
          <br />
          Offset X: {debugInfo.alignment.offset.x.toFixed(2)}px
          <br />
          Offset Y: {debugInfo.alignment.offset.y.toFixed(2)}px
          <br />
          Total:{' '}
          {Math.sqrt(
            debugInfo.alignment.offset.x ** 2 +
              debugInfo.alignment.offset.y ** 2
          ).toFixed(2)}
          px
          <br />
          Status:{' '}
          {Math.abs(debugInfo.alignment.offset.x) <= 1 &&
          Math.abs(debugInfo.alignment.offset.y) <= 1
            ? '✅ Aligned'
            : '⚠️ Misaligned'}
        </div>
      )}

      {/* Test container to measure sizing */}
      <div
        ref={containerRef}
        style={{
          width: responsiveSize.width,
          height: responsiveSize.height,
          border: '2px solid red',
          borderRadius: '50%',
          position: 'relative',
          margin: '10px 0',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'blue',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
          }}
        />

        {/* Simulate canvas */}
        <canvas
          width={100}
          height={100}
          style={{
            position: 'absolute',
            inset: '4px',
            borderRadius: '50%',
            background: 'rgba(0,255,0,0.3)',
            border: '1px solid green',
          }}
        />
      </div>
    </div>
  );
};
