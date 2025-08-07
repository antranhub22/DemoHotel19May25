// React hooks
import { useCallback, useEffect, useState } from 'react';

// Custom Hook
import { useAssistant } from '@/context';

// Types & Constants
import { useInterface1 } from '@/hooks/useInterface1';
import type { Language } from '@/types/interface1.types';
import { ServiceItem } from '@/types/interface1.types';
import logger from '@shared/utils/logger';

// UI Components
import { ErrorState } from '../features/voice-assistant/interface1/ErrorState';
import { InterfaceContainer } from '../features/voice-assistant/interface1/InterfaceContainer';
import { InterfaceHeader } from '../features/voice-assistant/interface1/InterfaceHeader';
import { LoadingState } from '../features/voice-assistant/interface1/LoadingState';
import { MobileVoiceControls } from '../features/voice-assistant/interface1/MobileVoiceControls';
import {
  addMultiLanguageNotification,
  LANGUAGE_DISPLAY_NAMES,
} from '../features/voice-assistant/interface1/MultiLanguageNotificationHelper';
import { RecentRequestCard } from '../features/voice-assistant/interface1/RecentRequestCard';
import { ServiceGrid } from '../features/voice-assistant/interface1/ServiceGrid';
import { VoiceCommandContext } from '../features/voice-assistant/interface1/VoiceCommandContext';
import { VoiceLanguageSwitcher } from '../features/voice-assistant/interface1/VoiceLanguageSwitcher';

// Import extracted components
import { Interface1Desktop } from './Interface1Desktop.tsx';
import { Interface1Mobile } from './Interface1Mobile.tsx';

interface Interface1Props {
  isActive: boolean;
}

export const Interface1 = ({ isActive }: Interface1Props): JSX.Element => {
  // Hooks must be first - no conditional calls
  const { language, recentRequest, setRecentRequest } = useAssistant();
  const {
    isLoading,
    error,
    micLevel,
    heroSectionRef,
    serviceGridRef,
    isCallStarted,
    showConversation,
    handleCallStart,
    handleCallEnd,
    showingSummary,
    showRightPanel,
    handleRightPanelClose,
    handleShowConversationPopup: _handleShowConversationPopup,
  } = useInterface1({ isActive });

  // Add service selection state for user feedback
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    null
  );

  // Enhanced language change handler
  const handleLanguageChange = (newLanguage: Language) => {
    logger.debug(
      `🗣️ [Interface1] Language changed to: ${newLanguage}`,
      'Component'
    );

    // Add multi-language notification using helper
    addMultiLanguageNotification(
      'languageChanged',
      newLanguage,
      { language: LANGUAGE_DISPLAY_NAMES[newLanguage][newLanguage] },
      { type: 'success', duration: 4000 }
    );
  };

  // Service interaction handlers with voice context
  const handleServiceSelect = (service: ServiceItem) => {
    logger.debug(
      `🎯 [Interface1] Service selected: ${service.name}`,
      'Component'
    );

    // Show selected service feedback
    setSelectedService(service);

    // Add multi-language notification using helper
    addMultiLanguageNotification(
      'serviceSelected',
      language,
      { service: service.name },
      {
        type: 'info',
        duration: 4000,
        metadata: {
          serviceName: service.name,
          serviceDescription: service.description,
        },
      }
    );
  };

  const handleVoiceServiceRequest = useCallback(
    async (service: ServiceItem) => {
      logger.debug(
        `🎤 [Interface1] Voice service request: ${service.name}`,
        'Component'
      );

      try {
        // Set service selection for immediate feedback
        setSelectedService(service);

        // Add multi-language notification using helper
        addMultiLanguageNotification(
          'voiceRequestStarted',
          language,
          { service: service.name },
          {
            type: 'call',
            duration: 3000,
            metadata: {
              serviceName: service.name,
              language,
            },
          }
        );

        // Start call with service context
        await handleCallStart(language); // Use existing handleCallStart

        logger.debug(
          `✅ [Interface1] Voice request started for: ${service.name}`,
          'Component'
        );
      } catch (error) {
        logger.error(
          `❌ [Interface1] Error starting voice request for: ${service.name}`,
          'Component',
          error
        );
        setSelectedService(null); // Clear on error

        // Add multi-language error notification using helper
        addMultiLanguageNotification(
          'voiceRequestFailed',
          language,
          { service: service.name },
          {
            type: 'error',
            duration: 5000,
            metadata: {
              serviceName: service.name,
              language,
              error:
                error instanceof Error
                  ? (error as any)?.message || String(error)
                  : 'Unknown error',
            },
          }
        );

        throw error; // Let ServiceGrid handle the error display
      }
    },
    [language, handleCallStart]
  );

  // Add call end notification with multi-language support
  useEffect(() => {
    if (!isCallStarted && selectedService) {
      // Call ended while a service was selected
      addMultiLanguageNotification(
        'voiceCallCompleted',
        language,
        {},
        {
          type: 'success',
          duration: 4000,
          metadata: {
            language,
            serviceName: selectedService.name,
            callDuration: '2 minutes', // Would come from call context
          },
        }
      );
    }
  }, [isCallStarted, selectedService?.name, language]);

  // Auto-clear selected service after timeout
  useEffect(() => {
    if (selectedService) {
      const timeoutId = setTimeout(() => {
        setSelectedService(null);
      }, 3000);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [selectedService]);

  // Early returns after hooks
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <InterfaceContainer>
      {/* Enhanced Voice Language Switcher */}
      <div className="fixed top-4 left-4 z-[9998]">
        <VoiceLanguageSwitcher
          position="floating"
          showVoicePreview={false}
          onLanguageChange={handleLanguageChange}
        />
      </div>

      {/* 🎭 DEBUG: Mock Conversation Button (Development Only) */}
      {import.meta.env.DEV && (
        <div className="fixed top-4 right-4 z-[9998]">
          <button
            onClick={_handleShowConversationPopup}
            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg transition-colors"
            title="Start Mock Conversation (DEV)"
          >
            🎭 Demo Chat
          </button>
        </div>
      )}

      {/* Voice Command Context (invisible but provides context) */}
      <VoiceCommandContext
        selectedService={selectedService}
        isCallActive={isCallStarted}
        onVoicePromptReady={prompt => {
          logger.debug(
            '🎤 [Interface1] Voice prompt ready:',
            'Component',
            prompt
          );
        }}
      />

      {/* Mobile Voice Controls */}
      <MobileVoiceControls
        selectedService={selectedService}
        isCallActive={isCallStarted}
        onLanguageChange={handleLanguageChange}
      />

      {/* Hero Section with 4-Position Layout */}
      <div
        ref={heroSectionRef}
        className="relative"
        data-testid="interface1-container"
      >
        <InterfaceHeader />

        {/* 4-Position Layout: Desktop = 3-column + center bottom, Mobile = overlay */}
        <div className="relative min-h-[400px] px-4">
          {/* Desktop Layout */}
          <Interface1Desktop
            isCallStarted={isCallStarted}
            micLevel={micLevel}
            showConversation={showConversation}
            showRightPanel={showRightPanel}
            showingSummary={showingSummary}
            handleCallStart={handleCallStart}
            handleCallEnd={handleCallEnd}
            handleRightPanelClose={handleRightPanelClose}
          />

          {/* Mobile Layout */}
          <Interface1Mobile
            isCallStarted={isCallStarted}
            micLevel={micLevel}
            showConversation={showConversation}
            showingSummary={showingSummary}
            handleCallStart={handleCallStart}
            handleCallEnd={handleCallEnd}
          />
        </div>
      </div>

      {/* ✅ ENHANCEMENT: Real-time Notification System */}
      {/* ✅ MIGRATION: NotificationSystem removed - now using unified PopupSystem in VoiceAssistant */}
      {/* <NotificationSystem
        position="top-right"
        maxNotifications={5}
        className="z-[9999]"
      /> */}

      {/* ✅ ENHANCEMENT: Service selection notification */}
      {selectedService && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md z-50">
          🎤 {selectedService.name}...
        </div>
      )}

      {/* ✅ NEW: Recent Request Card - Shows submitted request after UI reset */}
      {recentRequest && (
        <div
          className="w-full max-w-md mx-auto mb-8 relative z-20"
          data-testid="recent-request-card"
        >
          <RecentRequestCard
            request={recentRequest}
            onViewDetails={() => {
              logger.debug(
                '👁️ [Interface1] View request details clicked',
                'Component',
                { reference: recentRequest.reference }
              );
              // TODO: Implement view details modal or navigation
            }}
            onDismiss={() => {
              logger.debug(
                '🗑️ [Interface1] Recent request dismissed',
                'Component',
                { reference: recentRequest.reference }
              );
              setRecentRequest(null);
            }}
          />
        </div>
      )}

      {/* Service Categories Section - Add margin to prevent overlap */}
      <div className="mt-16 relative z-10" data-testid="service-grid">
        <ServiceGrid
          ref={serviceGridRef}
          onServiceSelect={handleServiceSelect}
          onVoiceServiceRequest={handleVoiceServiceRequest}
        />
      </div>

      {/* Scroll Controls */}
      {/* ScrollToTopButton - temporarily disabled
        <ScrollToTopButton
          show={showScrollButton}
          onScrollToTop={scrollToTop}
          onScrollToServices={() => scrollToSection('services')}
        />
        */}
    </InterfaceContainer>
  );
};
