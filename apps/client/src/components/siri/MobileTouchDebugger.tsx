import React, { useEffect, useState, useRef } from 'react';
import { isMobileDevice } from '@/utils/deviceDetection';

interface TouchDebugInfo {
  deviceInfo: {
    isMobile: boolean;
    userAgent: string;
    hasTouch: boolean;
    maxTouchPoints: number;
    screen: string;
    viewport: string;
    dpr: number;
  };
  containerInfo: {
    found: boolean;
    rect: DOMRect | null;
    style: any;
    computedStyle: any;
    eventListeners: string[];
  };
  touchEvents: Array<{
    timestamp: number;
    type: string;
    target: string;
    position: { x: number; y: number };
    touches: number;
    prevented: boolean;
  }>;
  callbackStatus: {
    onCallStartAvailable: boolean;
    onCallEndAvailable: boolean;
    isListening: boolean;
    lastCallAttempt: number | null;
    callAttempts: number;
  };
}

interface MobileTouchDebuggerProps {
  containerId: string;
  onCallStart?: () => Promise<void>;
  onCallEnd?: () => void;
  isListening: boolean;
  enabled?: boolean;
}

export const MobileTouchDebugger: React.FC<MobileTouchDebuggerProps> = ({
  containerId,
  onCallStart,
  onCallEnd,
  isListening,
  enabled = true
}) => {
  const [debugInfo, setDebugInfo] = useState<TouchDebugInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const touchEventsRef = useRef<TouchDebugInfo['touchEvents']>([]);
  const callAttemptsRef = useRef(0);
  const lastCallAttemptRef = useRef<number | null>(null);

  const updateDebugInfo = () => {
    const container = document.getElementById(containerId);
    
    const deviceInfo = {
      isMobile: isMobileDevice(),
      userAgent: navigator.userAgent,
      hasTouch: 'ontouchstart' in window,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      screen: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      dpr: window.devicePixelRatio || 1
    };

    const containerInfo = {
      found: !!container,
      rect: container?.getBoundingClientRect() || null,
      style: container ? {
        position: container.style.position,
        zIndex: container.style.zIndex,
        pointerEvents: container.style.pointerEvents,
        display: container.style.display,
        width: container.style.width,
        height: container.style.height,
        cursor: container.style.cursor,
        touchAction: container.style.touchAction
      } : null,
      computedStyle: container ? {
        position: getComputedStyle(container).position,
        zIndex: getComputedStyle(container).zIndex,
        pointerEvents: getComputedStyle(container).pointerEvents,
        display: getComputedStyle(container).display,
        width: getComputedStyle(container).width,
        height: getComputedStyle(container).height,
        cursor: getComputedStyle(container).cursor,
        touchAction: getComputedStyle(container).touchAction
      } : null,
      eventListeners: container ? getEventListeners(container) : []
    };

    const callbackStatus = {
      onCallStartAvailable: !!onCallStart,
      onCallEndAvailable: !!onCallEnd,
      isListening,
      lastCallAttempt: lastCallAttemptRef.current,
      callAttempts: callAttemptsRef.current
    };

    setDebugInfo({
      deviceInfo,
      containerInfo,
      touchEvents: [...touchEventsRef.current].slice(-10), // Keep last 10 events
      callbackStatus
    });
  };

  const getEventListeners = (element: HTMLElement): string[] => {
    // This is a simplified version - in real browser dev tools, you can see actual listeners
    const events = [];
    
    // Check for common event attributes
    const eventTypes = ['onclick', 'ontouchstart', 'ontouchend', 'ontouchmove', 'ontouchcancel', 'onmousedown', 'onmouseup'];
    eventTypes.forEach(eventType => {
      if ((element as any)[eventType]) {
        events.push(eventType);
      }
    });
    
    return events;
  };

  const logTouchEvent = (e: TouchEvent) => {
    const now = Date.now();
    const target = e.target as HTMLElement;
    
    const eventInfo = {
      timestamp: now,
      type: e.type,
      target: `${target.tagName}#${target.id}.${target.className}`,
      position: e.touches.length > 0 ? {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      } : { x: 0, y: 0 },
      touches: e.touches.length,
      prevented: e.defaultPrevented
    };

    touchEventsRef.current.push(eventInfo);
    
    // Keep only last 20 events
    if (touchEventsRef.current.length > 20) {
      touchEventsRef.current = touchEventsRef.current.slice(-20);
    }

    updateDebugInfo();
  };

  const testCallStart = async () => {
    console.log('🧪 [MobileTouchDebugger] Manual test call start');
    callAttemptsRef.current++;
    lastCallAttemptRef.current = Date.now();
    
    try {
      if (onCallStart) {
        await onCallStart();
        console.log('✅ [MobileTouchDebugger] Manual call start successful');
      } else {
        console.warn('⚠️ [MobileTouchDebugger] onCallStart not available');
      }
    } catch (error) {
      console.error('❌ [MobileTouchDebugger] Manual call start failed:', error);
    }
    
    updateDebugInfo();
  };

  useEffect(() => {
    if (!enabled || !isMobileDevice()) return;

    updateDebugInfo();
    
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`[MobileTouchDebugger] Container ${containerId} not found`);
      return;
    }

    // Add comprehensive touch event logging
    const touchEvents = ['touchstart', 'touchend', 'touchmove', 'touchcancel'];
    
    touchEvents.forEach(eventType => {
      container.addEventListener(eventType, logTouchEvent, { passive: false });
      document.addEventListener(eventType, logTouchEvent, { passive: false });
    });

    // Periodic updates
    const interval = setInterval(updateDebugInfo, 2000);

    return () => {
      touchEvents.forEach(eventType => {
        container.removeEventListener(eventType, logTouchEvent);
        document.removeEventListener(eventType, logTouchEvent);
      });
      clearInterval(interval);
    };
  }, [containerId, enabled, onCallStart, onCallEnd, isListening]);

  if (!enabled || !isMobileDevice() || !debugInfo) return null;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 99999,
          background: '#FF6B6B',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          fontSize: '20px',
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}
      >
        🔍
      </button>

      {/* Debug Panel */}
      {isVisible && (
        <div style={{
          position: 'fixed',
          top: '70px',
          right: '10px',
          width: '350px',
          maxHeight: '80vh',
          background: 'rgba(0,0,0,0.95)',
          color: 'white',
          padding: '15px',
          borderRadius: '10px',
          fontSize: '12px',
          zIndex: 99998,
          overflow: 'auto',
          boxShadow: '0 5px 20px rgba(0,0,0,0.5)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#FF6B6B' }}>🔍 Mobile Touch Debugger</h3>
          
          {/* Test Buttons */}
          <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
            <button
              onClick={testCallStart}
              style={{
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '5px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Test Call Start
            </button>
            <button
              onClick={() => setIsVisible(false)}
              style={{
                background: '#f44336',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '5px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>

          {/* Device Info */}
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#4CAF50' }}>📱 Device Info</h4>
            <div>Mobile: {debugInfo.deviceInfo.isMobile ? '✅' : '❌'}</div>
            <div>Touch: {debugInfo.deviceInfo.hasTouch ? '✅' : '❌'}</div>
            <div>Touch Points: {debugInfo.deviceInfo.maxTouchPoints}</div>
            <div>Screen: {debugInfo.deviceInfo.screen}</div>
            <div>Viewport: {debugInfo.deviceInfo.viewport}</div>
            <div>DPR: {debugInfo.deviceInfo.dpr}</div>
          </div>

          {/* Container Info */}
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#2196F3' }}>📦 Container Info</h4>
            <div>Found: {debugInfo.containerInfo.found ? '✅' : '❌'}</div>
            {debugInfo.containerInfo.rect && (
              <>
                <div>Size: {Math.round(debugInfo.containerInfo.rect.width)} x {Math.round(debugInfo.containerInfo.rect.height)}</div>
                <div>Position: {Math.round(debugInfo.containerInfo.rect.x)}, {Math.round(debugInfo.containerInfo.rect.y)}</div>
              </>
            )}
            {debugInfo.containerInfo.computedStyle && (
              <>
                <div>Pointer Events: {debugInfo.containerInfo.computedStyle.pointerEvents}</div>
                <div>Z-Index: {debugInfo.containerInfo.computedStyle.zIndex}</div>
                <div>Touch Action: {debugInfo.containerInfo.computedStyle.touchAction}</div>
              </>
            )}
          </div>

          {/* Callback Status */}
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#FF9800' }}>🎯 Callback Status</h4>
            <div>onCallStart: {debugInfo.callbackStatus.onCallStartAvailable ? '✅' : '❌'}</div>
            <div>onCallEnd: {debugInfo.callbackStatus.onCallEndAvailable ? '✅' : '❌'}</div>
            <div>isListening: {debugInfo.callbackStatus.isListening ? '🎤' : '🔇'}</div>
            <div>Call Attempts: {debugInfo.callbackStatus.callAttempts}</div>
            {debugInfo.callbackStatus.lastCallAttempt && (
              <div>Last Attempt: {new Date(debugInfo.callbackStatus.lastCallAttempt).toLocaleTimeString()}</div>
            )}
          </div>

          {/* Recent Touch Events */}
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#9C27B0' }}>👆 Recent Touch Events</h4>
            <div style={{ maxHeight: '200px', overflow: 'auto' }}>
              {debugInfo.touchEvents.length === 0 ? (
                <div style={{ color: '#999' }}>No touch events detected</div>
              ) : (
                debugInfo.touchEvents.slice(-5).reverse().map((event, index) => (
                  <div key={index} style={{ 
                    marginBottom: '5px', 
                    padding: '3px', 
                    background: 'rgba(255,255,255,0.1)', 
                    borderRadius: '3px',
                    fontSize: '10px'
                  }}>
                    <div>{event.type} - {new Date(event.timestamp).toLocaleTimeString()}</div>
                    <div>Target: {event.target}</div>
                    <div>Position: {Math.round(event.position.x)}, {Math.round(event.position.y)}</div>
                    <div>Touches: {event.touches} | Prevented: {event.prevented ? '✅' : '❌'}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Instructions */}
          <div style={{ fontSize: '10px', color: '#999', fontStyle: 'italic' }}>
            Try tapping the Siri button and watch the events above. Use "Test Call Start" to verify the callback works.
          </div>
        </div>
      )}
    </>
  );
}; 