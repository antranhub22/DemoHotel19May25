import * as React from "react";
import { useMemo } from "react";
import { useSiriAnimation } from "./hooks/useSiriAnimation";

interface SimpleMobileSiriVisualProps {
  isListening: boolean;
  volumeLevel: number;
  colors: {
    primary: string;
    secondary: string;
    glow: string;
    name: string;
  };
  size?: number;
}

export const SimpleMobileSiriVisual: React.FC<SimpleMobileSiriVisualProps> = ({
  isListening,
  volumeLevel,
  colors,
  size = 80,
}) => {
  const { ripples, finalScale } = useSiriAnimation({
    isListening,
    volumeLevel,
  });

  // Memoize style calculations
  const styles = useMemo(
    () => ({
      container: {
        position: "relative" as const,
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      outerGlow: {
        position: "absolute" as const,
        width: Number(size) + 40,
        height: Number(size) + 40,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
        transform: `scale(${finalScale})`,
        opacity: isListening ? 0.8 : 0.4,
        transition: "opacity 0.3s ease",
        pointerEvents: "none" as const,
      },
      mainCircle: {
        position: "absolute" as const,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
        transform: `scale(${finalScale})`,
        boxShadow: `0 0 ${isListening ? 40 : 20}px ${colors.glow}`,
        transition: "box-shadow 0.3s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none" as const,
      },
      microphoneIcon: {
        color: "white",
        fontSize: size * 0.25,
        textShadow: "0 0 20px rgba(255,255,255,0.8)",
        transform: `scale(${1 + volumeLevel * 0.2})`,
        transition: "transform 0.1s ease",
      },
      listeningIndicator: {
        position: "absolute" as const,
        bottom: -40,
        left: "50%",
        transform: "translateX(-50%)",
        color: colors.primary,
        fontSize: 14,
        fontWeight: "bold" as const,
        textAlign: "center" as const,
        animation: "pulse 1.5s infinite",
      },
    }),
    [size, colors, finalScale, isListening, volumeLevel],
  );

  return (
    <div style={styles.container}>
      {/* Ripples */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: "50%",
            border: `2px solid ${colors.primary}`,
            transform: `scale(${ripple.scale})`,
            opacity: ripple.opacity,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Outer glow */}
      <div style={styles.outerGlow} />

      {/* Main circle */}
      <div style={styles.mainCircle}>
        {/* Microphone Icon */}
        <div style={styles.microphoneIcon}>🎤</div>
      </div>

      {/* Listening indicator */}
      {isListening && <div style={styles.listeningIndicator}>Listening...</div>}

      {/* CSS Animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
};
