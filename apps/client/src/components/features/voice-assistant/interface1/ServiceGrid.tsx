import { useAssistant } from "@/context";
import { designSystem } from "@/styles/designSystem";
import { SERVICE_CATEGORIES, ServiceItem } from "@/types/interface1.types";
import logger from "@shared/utils/logger";
import { forwardRef, useCallback, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/useIsMobile";

interface ServiceGridProps {
  className?: string;
  onServiceSelect?: (service: ServiceItem) => void;
  onVoiceServiceRequest?: (service: ServiceItem) => Promise<void>;
}

export const ServiceGrid = forwardRef<HTMLDivElement, ServiceGridProps>(
  ({ className = "", onServiceSelect, onVoiceServiceRequest }, ref) => {
    const { startCall, language } = useAssistant();
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const isMobile = useIsMobile();

    const prefersReducedMotion = useReducedMotion();

    // Handle service item click
    const handleServiceClick = useCallback(
      async (service: ServiceItem) => {
        logger.debug(
          `🎯 [ServiceGrid] Service clicked: ${service.name}`,
          "Component",
        );

        try {
          setSelectedService(service.name);
          setIsProcessing(service.name);

          // Notify parent component
          onServiceSelect?.(service);

          // Start voice call with service context
          if (onVoiceServiceRequest) {
            await onVoiceServiceRequest(service);
          } else if (startCall) {
            // Fallback to direct voice assistant start
            logger.debug(
              "🎤 [ServiceGrid] Starting voice call for service",
              "Component",
              service.name,
            );
            await startCall();
          }

          logger.debug(
            `✅ [ServiceGrid] Service request processed: ${service.name}`,
            "Component",
          );
        } catch (error) {
          logger.error(
            `❌ [ServiceGrid] Error processing service: ${service.name}`,
            "Component",
            error,
          );

          // Show user-friendly error
          if (typeof window !== "undefined") {
            const errorMessage =
              error instanceof Error
                ? (error as any)?.message || String(error)
                : "Unknown error";
            alert(`Unable to process ${service.name} request: ${errorMessage}`);
          }
        } finally {
          setIsProcessing(null);
          setTimeout(() => setSelectedService(null), 2000); // Clear selection after 2s
        }
      },
      [onServiceSelect, onVoiceServiceRequest, startCall, language],
    );

    // Generate service item component
    const renderServiceItem = useCallback(
      (service: ServiceItem, index: number, isMobile: boolean = false) => {
        const Icon = service.icon;
        const isSelected = selectedService === service.name;
        const isLoading = isProcessing === service.name;

        const baseStyles = {
          background: isSelected
            ? "rgba(93, 182, 185, 0.3)"
            : "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          border: isSelected
            ? "2px solid rgba(93, 182, 185, 0.6)"
            : "1px solid rgba(255, 255, 255, 0.2)",
          transition: prefersReducedMotion
            ? "none"
            : designSystem.transitions.normal,
          cursor: isLoading ? "wait" : "pointer",
          boxShadow: isSelected
            ? "0 8px 25px rgba(93, 182, 185, 0.4)"
            : designSystem.shadows.card,
          transform: isSelected ? "scale(1.05)" : "scale(1)",
        };

        if (isMobile) {
          return (
            <div
              key={index}
              className="flex items-center space-x-4 p-4 rounded-xl active:scale-95"
              data-testid="service-item"
              style={baseStyles}
              onClick={() => handleServiceClick(service)}
            >
              <div className="text-white flex-shrink-0 relative">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                  </div>
                )}
                <Icon
                  size={32}
                  className={isLoading ? "opacity-30" : "opacity-100"}
                />
              </div>
              <div className="text-white">
                <div className="font-medium text-lg">{service.name}</div>
                {service.description && (
                  <div className="text-sm text-gray-300 mt-1">
                    {service.description}
                  </div>
                )}
                {isSelected && (
                  <div className="text-xs text-blue-200 mt-1 font-semibold">
                    🎤 Starting voice request...
                  </div>
                )}
              </div>
            </div>
          );
        }

        // Desktop version
        return (
          <div
            key={index}
            className={`relative group w-full h-32 flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer ${prefersReducedMotion ? "" : "transition-all duration-300 hover:scale-105 active:scale-95"}`}
            data-testid="service-item"
            style={baseStyles}
            onClick={() => handleServiceClick(service)}
          >
            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
              </div>
            )}

            {/* Icon */}
            <div
              className={`text-white mb-2 ${isLoading ? "opacity-30" : "opacity-100"}`}
            >
              <Icon size={28} />
            </div>

            {/* Text */}
            <div
              className={`text-white text-center text-sm font-medium ${isLoading ? "opacity-30" : "opacity-100"}`}
            >
              {service.name}
            </div>

            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
            )}

            {/* Enhanced hover overlay with call-to-action */}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent opacity-0 ${prefersReducedMotion ? "" : "group-hover:opacity-100 transition-opacity"} flex flex-col items-center justify-center p-3 text-white text-center rounded-xl`}
            >
              <div className="text-xs font-medium mb-2">
                {service.description}
              </div>
              <div className="text-xs bg-white/20 px-2 py-1 rounded-full font-semibold">
                🎤 Click to Request
              </div>
            </div>
          </div>
        );
      },
      [selectedService, isProcessing, handleServiceClick],
    );

    return (
      <div ref={ref} className={`w-full max-w-full ${className}`}>
        {/* Mobile View - Force render only on mobile */}
        {isMobile ? (
          <div className="block md:hidden space-y-2 sm:space-y-3 md:space-y-4 px-2 sm:px-4 py-3 sm:py-4 md:py-6">
            {SERVICE_CATEGORIES.map((service, index) =>
              renderServiceItem(service, index, true),
            )}
          </div>
        ) : (
          /* Desktop View - Force render only on desktop */
          <div className="hidden md:block w-full max-w-xl sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
            {/* First row - responsive columns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 mb-4">
              {SERVICE_CATEGORIES.slice(0, 5).map((service, index) =>
                renderServiceItem(service, index, false),
              )}
            </div>

            {/* Second row - remaining items */}
            {SERVICE_CATEGORIES.length > 5 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                {SERVICE_CATEGORIES.slice(5).map((service, index) =>
                  renderServiceItem(service, index + 5, false),
                )}
              </div>
            )}
          </div>
        )}

        {/* Status message */}
        {selectedService && (
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md z-50">
            🎤 Requesting {selectedService}...
          </div>
        )}
      </div>
    );
  },
);

ServiceGrid.displayName = "ServiceGrid";
