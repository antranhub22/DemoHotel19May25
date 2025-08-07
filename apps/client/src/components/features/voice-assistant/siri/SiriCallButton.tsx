import * as React from 'react';
/// <reference types="vite/client" />

import { Language } from "@/types/interface1.types";
import logger from '@shared/utils/logger';
import { useEffect } from 'react';
import "../../../../styles/voice-interface.css";
import { SiriButtonVisual } from './components/SiriButtonVisual';
import { useSiriButtonEvents } from './hooks/useSiriButtonEvents';
import { useSiriButtonState } from './hooks/useSiriButtonState';
import { useSiriButtonVisual } from './hooks/useSiriButtonVisual';

interface SiriCallButtonProps {
  isListening: boolean;
  volumeLevel: number;
  containerId: string;
  onCallStart?: () => Promise<void>;
  onCallEnd?: () => Promise<void>;
  language?: Language;
  colors?: {
    primary: string;
    secondary: string;
    glow: string;
    name: string;
  };
}

const SiriCallButton: React.FC<SiriCallButton> = ({ isListening, volumeLevel, containerId, onCallStart, onCallEnd, colors }) => {
  // Component render debug - Development only
  if (import.meta.env.DEV) {
    logger.debug(
      `[SiriCallButton] Component render - Container: ${containerId}, isListening: ${isListening}, Mobile: ${/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)}`,
      "Component",
    );
  }

  // Custom hooks for state management
  const { status, isHandlingClick, handleCallAction } = useSiriButtonState({
    isListening,
    onCallStart,
    onCallEnd,
  });

  // Custom hooks for event handling
  const { handleDirectTouch } = useSiriButtonEvents({
    containerId,
    handleCallAction,
    isHandlingClick,
  });

  // Custom hooks for visual management
  const { canvasReady, cleanupCanvas } = useSiriButtonVisual({
    containerId,
    isListening,
    volumeLevel,
    colors,
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupCanvas();
    };
  }, [cleanupCanvas]);

  return (
    <div
      id={containerId}
      className="voice-button"
      // Unified event handlers for both mobile and desktop
      onTouchStart={handleDirectTouch}
      onTouchEnd={handleDirectTouch}
      onClick={handleDirectTouch}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        cursor: "pointer",
        zIndex: 10,
        borderRadius: "50%",
        pointerEvents: "auto",
        overflow: "visible",
        // Mobile touch optimizations
        touchAction: "manipulation", // Improve touch responsiveness
        WebkitTapHighlightColor: "transparent", // Remove mobile tap highlight
        WebkitUserSelect: "none", // Prevent text selection
        userSelect: "none", // Prevent text selection
        WebkitTouchCallout: "none", // Disable context menu on long press
      }}
    >
      {/* Visual component */}
      <SiriButtonVisual
        containerId={containerId}
        isListening={isListening}
        volumeLevel={volumeLevel}
        canvasReady={canvasReady}
        colors={colors}
      />

      {/* Status indicator */}
      {status !== "idle" && status !== "listening" && (
        <div
          className={`status-indicator ${status}`}
          style={{
            position: "absolute",
            top: "-48px",
            left: "50%",
            transform: "translateX(-50%)",
            color: colors?.primary || "#5DB6B9",
            textShadow: `0 0 10px ${colors?.glow || "rgba(93, 182, 185, 0.4)"}`,
            pointerEvents: "none", // Don't block container events
          }}
        >
          {status === "processing" ? "Processing..." : "Speaking..."}
        </div>
      )}
    </div>
  );
};

export default SiriCallButton;
