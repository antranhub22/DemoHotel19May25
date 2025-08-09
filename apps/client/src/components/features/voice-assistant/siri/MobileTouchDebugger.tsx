import * as React from 'react';
import { useState } from 'react';
import { DebugPanel } from './components/DebugPanel';
import { useTouchDebugger } from './hooks/useTouchDebugger';

interface MobileTouchDebuggerProps {
  containerId: string;
  onCallStart?: () => Promise<void>;
  onCallEnd?: () => void;
  isListening: boolean;
  enabled?: boolean;
}

export const MobileTouchDebugger: React.FC<MobileTouchDebuggerProps> = ({ containerId, onCallStart, onCallEnd, isListening, enabled = true }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { debugInfo, testCallStart, testCallEnd, isEnabled } = useTouchDebugger(
    {
      containerId,
      onCallStart,
      onCallEnd,
      isListening,
      enabled,
    }
  );

  if (!isEnabled || !debugInfo) {
    return null;
  }

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
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        }}
      >
        🔍
      </button>

      {/* Debug Panel */}
      {isVisible && debugInfo && (
        <DebugPanel
          debugInfo={debugInfo}
          testCallStart={testCallStart}
          testCallEnd={testCallEnd}
        />
      )}
    </>
  );
};

interface MobileTouchDebuggerProps {
  enabled?: boolean;
  className?: string;
}
