import { isMobileDevice } from "@/utils/deviceDetection";
import logger from "@shared/utils/logger";
import * as React from "react";
import { useCallback, useEffect, useRef } from "react";

interface UseSiriButtonEventsProps {
  containerId: string;
  handleCallAction: () => Promise<void>;
  isHandlingClick: React.MutableRefObject<boolean>;
}

interface UseSiriButtonEventsReturn {
  handleDirectTouch: (e: any) => Promise<void>;
  handleMouseDown: (e: MouseEvent) => void;
  handleMouseUp: (e: MouseEvent) => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
}

export const useSiriButtonEvents = ({
  containerId,
  handleCallAction,
  isHandlingClick,
}: UseSiriButtonEventsProps): UseSiriButtonEventsReturn => {
  const elementRef = useRef<HTMLElement | null>(null);

  // Unified touch/click handler for both mobile and desktop
  const handleDirectTouch = useCallback(
    async (e: any) => {
      // Only handle touch end or click events
      if (e.type !== "touchend" && e.type !== "click") {
        return;
      }

      logger.debug(
        "[useSiriButtonEvents] Direct touch/click event:",
        "Component",
        {
          eventType: e.type,
          target: e.target,
          isHandlingClick: isHandlingClick.current,
        },
      );

      // Prevent if already handling
      if (isHandlingClick.current) {
        logger.debug(
          "[useSiriButtonEvents] Already handling click, ignoring...",
          "Component",
        );
        return;
      }

      await handleCallAction();
    },
    [handleCallAction, isHandlingClick],
  );

  // Mouse event handlers for desktop hover effects
  const handleMouseDown = useCallback((e: MouseEvent) => {
    logger.debug("[useSiriButtonEvents] Mouse down event:", "Component", {
      target: e.target,
      coordinates: { x: e.clientX, y: e.clientY },
    });

    // no-op
  }, []);

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      logger.debug("[useSiriButtonEvents] Mouse up event:", "Component", {
        target: e.target,
      });

      // For desktop, we'll use the unified handler
      handleDirectTouch(e);
    },
    [handleDirectTouch],
  );

  const handleMouseEnter = useCallback(() => {
    logger.debug("[useSiriButtonEvents] Mouse enter", "Component");
    // Could add hover visual effects here
  }, []);

  const handleMouseLeave = useCallback(() => {
    logger.debug("[useSiriButtonEvents] Mouse leave", "Component");
    // Could remove hover visual effects here
  }, []);

  // Setup event listeners
  useEffect(() => {
    const element = document.getElementById(containerId);
    if (!element) {
      logger.warn(
        "[useSiriButtonEvents] Container element not found:",
        "Component",
        containerId,
      );
      return;
    }

    elementRef.current = element;

    // For mobile, we use JSX event handlers (handleDirectTouch)
    // For desktop, we add mouse event listeners for hover effects
    if (!isMobileDevice()) {
      logger.debug(
        "[useSiriButtonEvents] Setting up desktop mouse events",
        "Component",
      );

      element.addEventListener("mousedown", handleMouseDown);
      element.addEventListener("mouseup", handleMouseUp);
      element.addEventListener("mouseenter", handleMouseEnter);
      element.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        logger.debug(
          "[useSiriButtonEvents] Cleaning up desktop mouse events",
          "Component",
        );
        element.removeEventListener("mousedown", handleMouseDown);
        element.removeEventListener("mouseup", handleMouseUp);
        element.removeEventListener("mouseenter", handleMouseEnter);
        element.removeEventListener("mouseleave", handleMouseLeave);
      };
    } else {
      logger.debug(
        "[useSiriButtonEvents] Mobile device - using JSX event handlers",
        "Component",
      );
    }
  }, [
    containerId,
    handleMouseDown,
    handleMouseUp,
    handleMouseEnter,
    handleMouseLeave,
  ]);

  return {
    handleDirectTouch,
    handleMouseDown,
    handleMouseUp,
    handleMouseEnter,
    handleMouseLeave,
  };
};
