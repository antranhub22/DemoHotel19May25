import React from 'react';

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

interface DebugPanelProps {
  debugInfo: TouchDebugInfo;
  testCallStart: () => Promise<void>;
  testCallEnd: () => void;
}

export const DebugPanel: React.FC<DebugPanel> = ({ debugInfo, testCallStart, testCallEnd }) => {
  return (
    <div
      style={{
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
        boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
      }}
    >
      <h3 style={{ margin: '0 0 10px 0', color: '#FF6B6B' }}>
        🔍 Mobile Touch Debugger
      </h3>

      {/* Test Buttons */}
      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
        <button
          onClick={testCallStart}
          style={{
            padding: '8px 12px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          Test Start
        </button>
        <button
          onClick={testCallEnd}
          style={{
            padding: '8px 12px',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          Test End
        </button>
      </div>

      {/* Device Info */}
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 5px 0', color: '#4CAF50' }}>
          📱 Device Info
        </h4>
        <div>Mobile: {debugInfo.deviceInfo.isMobile ? '✅' : '❌'}</div>
        <div>Touch: {debugInfo.deviceInfo.hasTouch ? '✅' : '❌'}</div>
        <div>Max Touch Points: {debugInfo.deviceInfo.maxTouchPoints}</div>
        <div>Screen: {debugInfo.deviceInfo.screen}</div>
        <div>Viewport: {debugInfo.deviceInfo.viewport}</div>
        <div>DPR: {debugInfo.deviceInfo.dpr}</div>
      </div>

      {/* Container Info */}
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 5px 0', color: '#2196F3' }}>
          📦 Container Info
        </h4>
        <div>Found: {debugInfo.containerInfo.found ? '✅' : '❌'}</div>
        {debugInfo.containerInfo.rect && (
          <div>
            Position: {Math.round(debugInfo.containerInfo.rect.x)},{' '}
            {Math.round(debugInfo.containerInfo.rect.y)}
          </div>
        )}
        {debugInfo.containerInfo.rect && (
          <div>
            Size: {Math.round(debugInfo.containerInfo.rect.width)}x
            {Math.round(debugInfo.containerInfo.rect.height)}
          </div>
        )}
      </div>

      {/* Callback Status */}
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 5px 0', color: '#FF9800' }}>
          🔗 Callback Status
        </h4>
        <div>
          Start Available:{' '}
          {debugInfo.callbackStatus.onCallStartAvailable ? '✅' : '❌'}
        </div>
        <div>
          End Available:{' '}
          {debugInfo.callbackStatus.onCallEndAvailable ? '✅' : '❌'}
        </div>
        <div>
          Is Listening: {debugInfo.callbackStatus.isListening ? '✅' : '❌'}
        </div>
        <div>Call Attempts: {debugInfo.callbackStatus.callAttempts}</div>
        {debugInfo.callbackStatus.lastCallAttempt && (
          <div>
            Last Attempt:{' '}
            {new Date(
              debugInfo.callbackStatus.lastCallAttempt
            ).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Recent Touch Events */}
      <div>
        <h4 style={{ margin: '0 0 5px 0', color: '#9C27B0' }}>
          👆 Recent Touch Events
        </h4>
        <div style={{ maxHeight: '200px', overflow: 'auto' }}>
          {debugInfo.touchEvents.length === 0 ? (
            <div style={{ color: '#666' }}>No touch events recorded</div>
          ) : (
            debugInfo.touchEvents.map((event, index) => (
              <div
                key={index}
                style={{
                  padding: '5px',
                  margin: '2px 0',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '3px',
                  borderLeft: `3px solid ${
                    event.type === 'touchstart'
                      ? '#4CAF50'
                      : event.type === 'touchend'
                        ? '#f44336'
                        : '#2196F3'
                  }`,
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{event.type}</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>
                  {new Date(event.timestamp).toLocaleTimeString()} • Target:{' '}
                  {event.target} • Touches: {event.touches} • Position:{' '}
                  {Math.round(event.position.x)}, {Math.round(event.position.y)}
                  {event.prevented && ' • PREVENTED'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
