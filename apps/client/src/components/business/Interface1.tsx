// Interface1 component - Multi-tenant version v2.0.0 - Single Implementation

// React hooks
import { useCallback, useEffect, useState } from 'react';

// Custom Hook
import { useAssistant } from '@/context';

// Context

// Types & Constants
import { usePopupContext } from '@/context/PopupContext';
import { useInterface1 } from '@/hooks/useInterface1';
import type { Language } from '@/types/interface1.types';
import { ServiceItem } from '@/types/interface1.types';
import { logger } from '@shared/utils/logger';
import RealtimeConversationPopup from '../features/popup-system/RealtimeConversationPopup';
import { SummaryPopup } from '../features/popup-system/SummaryPopup';
import { ErrorState } from '../features/voice-assistant/interface1/ErrorState';
import { InterfaceContainer } from '../features/voice-assistant/interface1/InterfaceContainer';
import { InterfaceHeader } from '../features/voice-assistant/interface1/InterfaceHeader';
import { LoadingState } from '../features/voice-assistant/interface1/LoadingState';
import { MobileVoiceControls } from '../features/voice-assistant/interface1/MobileVoiceControls';
import { LANGUAGE_DISPLAY_NAMES } from '../features/voice-assistant/interface1/MultiLanguageNotificationHelper';

// Utils

// UI Components - States

// UI Components - Layout
import { addMultiLanguageNotification } from '../features/voice-assistant/interface1/MultiLanguageNotificationHelper';
// ✅ MIGRATION: NotificationSystem removed - now using unified PopupSystem in VoiceAssistant
// import { NotificationSystem } from '../features/voice-assistant/interface1/NotificationSystem';
import { ServiceGrid } from '../features/voice-assistant/interface1/ServiceGrid';

// UI Components - Popups

// Enhanced UI Components
import { VoiceCommandContext } from '../features/voice-assistant/interface1/VoiceCommandContext';
import { VoiceLanguageSwitcher } from '../features/voice-assistant/interface1/VoiceLanguageSwitcher';
// Siri Components
import { createElement } from 'react';
import { usePopup } from '../features/popup-system/PopupManager';
import { SummaryPopupContent } from '../features/popup-system/SummaryPopupContent';
import { SiriButtonContainer } from '../features/voice-assistant/siri/SiriButtonContainer';

// Mobile Summary Popup Component - Similar to RightPanelSection logic
const MobileSummaryPopup = () => {
  const { popups, removePopup } = usePopupContext();
  const [showSummary, setShowSummary] = useState(false);

  // Listen for summary popups and show them in mobile center modal
  useEffect(() => {
    const summaryPopup = popups.find(popup => popup.type === 'summary');
    const hasSummary = !!summaryPopup;

    // ✅ FIX: Force update state even if same value
    setShowSummary(hasSummary);

    console.log(
      '📱 [DEBUG] MobileSummaryPopup - showSummary:',
      hasSummary,
      'popups count:',
      popups.length,
      'summaryPopup:',
      summaryPopup
    );

    if (hasSummary) {
      console.log(
        '📱 [DEBUG] MobileSummaryPopup - Summary popup found:',
        summaryPopup
      );
    } else {
      console.log('📱 [DEBUG] MobileSummaryPopup - No summary popup found');
    }

    // ✅ NEW: Auto-cleanup old summary popups to prevent accumulation
    if (popups.length > 10) {
      console.log('🧹 [DEBUG] Too many popups, cleaning up old ones');
      const summaryPopups = popups.filter(popup => popup.type === 'summary');
      if (summaryPopups.length > 1) {
        // Keep only the newest summary popup
        summaryPopups.slice(1).forEach(popup => {
          console.log('🗑️ [DEBUG] Removing old summary popup:', popup.id);
          removePopup(popup.id);
        });
      }
    }
  }, [popups, removePopup]);

  const handleClose = () => {
    console.log('📱 [DEBUG] MobileSummaryPopup - handleClose called');
    // Remove all summary popups
    popups
      .filter(popup => popup.type === 'summary')
      .forEach(popup => {
        console.log('🗑️ [DEBUG] Removing summary popup on close:', popup.id);
        removePopup(popup.id);
      });
  };

  // ✅ DEBUG: Log render state
  console.log(
    '📱 [DEBUG] MobileSummaryPopup render - showSummary:',
    showSummary
  );

  if (!showSummary) {
    console.log('📱 [DEBUG] MobileSummaryPopup - Not showing, returning null');
    return null;
  }

  console.log('📱 [DEBUG] MobileSummaryPopup - Rendering modal');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">📋 Call Summary</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <SummaryPopupContent />
      </div>
    </div>
  );
};

interface Interface1Props {
  isActive: boolean;
}

export const Interface1 = ({ isActive }: Interface1Props): JSX.Element => {
  // ✅ HOOKS MUST BE FIRST - NO CONDITIONAL CALLS
  const { language } = useAssistant();
  const {
    isLoading,
    error,
    micLevel,
    showScrollButton: _showScrollButton,
    scrollToTop: _scrollToTop,
    scrollToSection: _scrollToSection,
    heroSectionRef,
    serviceGridRef,
    conversationRef: _conversationRef,
    rightPanelRef: _rightPanelRef,
    isCallStarted,
    showConversation,
    handleCallStart,
    handleCallEnd,
    showingSummary,
    showRightPanel,
    handleRightPanelToggle: _handleRightPanelToggle,
    handleRightPanelClose,
    handleShowConversationPopup: _handleShowConversationPopup,
    handleShowNotificationDemo: _handleShowNotificationDemo,
    handleShowSummaryDemo: _handleShowSummaryDemo,
  } = useInterface1({ isActive });

  // ✅ ENHANCED: Add service selection state for user feedback
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    null
  );

  // ✅ ENHANCEMENT: Enhanced language change handler
  const handleLanguageChange = useCallback((newLanguage: Language) => {
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
  }, []);

  // ✅ ENHANCEMENT: Service interaction handlers with voice context
  const handleServiceSelect = useCallback(
    (service: ServiceItem) => {
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

      // Clear selection after 3 seconds
      setTimeout(() => setSelectedService(null), 3000);
    },
    [language]
  );

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

  // ✅ ENHANCEMENT: Add call end notification with multi-language support
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
  }, [isCallStarted, selectedService, language]);

  // ✅ EARLY RETURNS AFTER HOOKS
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
          {/* Desktop: 4-Position Grid Layout */}
          <div className="hidden md:block">
            {/* Row 1: 3-Column Layout - Chat Popup | Siri | Summary Popup */}
            <div className="grid grid-cols-3 gap-8 items-center justify-items-center min-h-[400px] mb-8">
              {/* Column 1: Real-time Conversation (Left) */}
              <div className="w-full max-w-sm">
                <RealtimeConversationPopup
                  isOpen={showConversation}
                  onClose={() => {}}
                  layout="grid"
                />
                {/* ✅ DEBUG: Add logging - COMMENTED OUT FOR CLEAN CONSOLE */}
                {/*{(() => {
                  console.log(
                    '🔍 [Interface1] RealtimeConversationPopup Desktop render state:',
                    {
                      showConversation,
                      isCallStarted,
                      isOpen: showConversation, // ✅ Real-time conversation display
                      transcriptsCount: micLevel, // Using micLevel as proxy for debug
                    }
                  );
                  return null;
                })()}*/}
              </div>

              {/* Column 2: Siri Button (Center) - Improved sizing and positioning */}
              <div className="flex flex-col items-center justify-center w-full max-w-md">
                <div className="flex items-center justify-center p-4">
                  {/* Siri Button Container */}
                  <SiriButtonContainer
                    isCallStarted={isCallStarted}
                    micLevel={micLevel}
                    onCallStart={async lang => {
                      await handleCallStart(lang);
                    }}
                    onCallEnd={handleCallEnd}
                    // ✅ REMOVED: onCancel and onConfirm are no longer needed
                    // Summary popup will auto-show when call ends via Siri button tap
                    showingSummary={showingSummary}
                  />
                </div>
              </div>

              {/* Column 3: Summary Popup (Right) */}
              <div className="w-full max-w-sm">
                <SummaryPopup
                  isOpen={showRightPanel}
                  onClose={handleRightPanelClose}
                />
              </div>
            </div>

            {/* ✅ NEW: Test Summary Popup Button - Desktop */}
            <div
              className="fixed bottom-4 right-4 z-[9999] hidden md:block"
              style={{
                position: 'fixed',
                bottom: '16px',
                right: '16px',
                zIndex: 9999,
                backgroundColor: '#10b981',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                border: 'none',
                outline: 'none',
              }}
            >
              <button
                onClick={() => {
                  console.log('🧪 Test Summary button clicked! (Desktop)');
                  // Test summary popup without Vapi call
                  const { showSummary } = usePopup();
                  const testSummaryElement = createElement(
                    'div',
                    {
                      style: {
                        padding: '20px',
                        textAlign: 'center',
                        maxWidth: '400px',
                      },
                    },
                    [
                      createElement(
                        'h3',
                        {
                          key: 'title',
                          style: {
                            marginBottom: '16px',
                            color: '#333',
                            fontSize: '18px',
                            fontWeight: '600',
                          },
                        },
                        '🧪 Test Summary'
                      ),
                      createElement(
                        'p',
                        {
                          key: 'message',
                          style: {
                            marginBottom: '16px',
                            lineHeight: '1.5',
                            color: '#333',
                            fontSize: '16px',
                          },
                        },
                        'This is a test summary popup!'
                      ),
                    ]
                  );
                  showSummary(testSummaryElement, {
                    title: 'Test Summary',
                    priority: 'medium' as const, // ✅ FIX: Change from 'high' to 'medium'
                  });
                }}
                style={{
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                🧪 Test Summary
              </button>
            </div>

            {/* ✅ NEW: Emergency Cleanup Button - Desktop */}
            <div
              className="fixed bottom-4 right-32 z-[9999] hidden md:block"
              style={{
                position: 'fixed',
                bottom: '16px',
                right: '128px',
                zIndex: 9999,
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                border: 'none',
                outline: 'none',
              }}
            >
              <button
                onClick={() => {
                  console.log('🚨 Emergency cleanup button clicked!');
                  const { emergencyCleanup, resetSummarySystem } = usePopup();

                  // First reset summary system
                  resetSummarySystem();

                  // Then emergency cleanup if needed
                  setTimeout(() => {
                    emergencyCleanup();
                  }, 100);

                  alert(
                    '🧹 Emergency cleanup completed! Check console for details.'
                  );
                }}
                style={{
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                🚨 Cleanup
              </button>
            </div>

            {/* ✅ NEW: Force Display Summary Button - Desktop */}
            <div
              className="fixed bottom-4 right-48 z-[9999] hidden md:block"
              style={{
                position: 'fixed',
                bottom: '16px',
                right: '192px',
                zIndex: 9999,
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                border: 'none',
                outline: 'none',
              }}
            >
              <button
                onClick={() => {
                  console.log('🚀 Force display summary button clicked!');
                  const { forceShowSummary } = usePopup();

                  // Force display summary popup
                  forceShowSummary();

                  alert(
                    '🚀 Force summary popup triggered! Check console for details.'
                  );
                }}
                style={{
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                🚀 Force Summary
              </button>
            </div>

            {/* Row 2: Notification (Center, below Siri) */}
            <div className="flex justify-center mb-8">
              <div className="w-full max-w-sm">
                {/* Placeholder for future Notification popup */}
                {/* <NotificationSection /> */}
              </div>
            </div>
          </div>

          {/* Mobile: Original center layout with overlay popups */}
          <div className="block md:hidden">
            <div className="w-full flex flex-col items-center justify-center min-h-[400px] relative z-50">
              <div className="flex flex-col items-center justify-center">
                {/* Siri Button Container */}
                <SiriButtonContainer
                  isCallStarted={isCallStarted}
                  micLevel={micLevel}
                  onCallStart={async lang => {
                    await handleCallStart(lang);
                  }}
                  onCallEnd={handleCallEnd}
                  // ✅ REMOVED: onCancel and onConfirm are no longer needed
                  // Summary popup will auto-show when call ends via Siri button tap
                  showingSummary={showingSummary}
                />

                {/* ✅ NEW: Test Summary Popup Button */}
                <div
                  className="fixed bottom-4 right-4 z-[9999]"
                  style={{
                    position: 'fixed',
                    bottom: '16px',
                    right: '16px',
                    zIndex: 9999,
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    border: 'none',
                    outline: 'none',
                  }}
                >
                  <button
                    onClick={() => {
                      console.log('🧪 Test Summary button clicked!');
                      // Test summary popup without Vapi call
                      // Create a temporary confirm handler for testing
                      const { showSummary } = usePopup();
                      const testSummaryElement = createElement(
                        'div',
                        {
                          style: {
                            padding: '20px',
                            textAlign: 'center',
                            maxWidth: '400px',
                          },
                        },
                        [
                          createElement(
                            'h3',
                            {
                              key: 'title',
                              style: {
                                marginBottom: '16px',
                                color: '#333',
                                fontSize: '18px',
                                fontWeight: '600',
                              },
                            },
                            '🧪 Test Summary'
                          ),
                          createElement(
                            'p',
                            {
                              key: 'message',
                              style: {
                                marginBottom: '16px',
                                lineHeight: '1.5',
                                color: '#333',
                                fontSize: '16px',
                              },
                            },
                            'This is a test summary popup!'
                          ),
                        ]
                      );
                      showSummary(testSummaryElement, {
                        title: 'Test Summary',
                        priority: 'medium' as const,
                      });
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      color: 'white',
                      border: 'none',
                      outline: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  >
                    🧪 Test Summary
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile: Real-time conversation (overlay) - ADVANCED COMPONENT */}
            <RealtimeConversationPopup
              isOpen={showConversation}
              onClose={() => {}} // Will be handled by popup context
              layout="overlay" // Mobile: overlay positioning with built-in responsive design
            />
            {/* ✅ DEBUG: Mobile layout logging - COMMENTED OUT FOR CLEAN CONSOLE */}
            {/*{(() => {
              console.log(
                '🔍 [Interface1] RealtimeConversationPopup Mobile render state:',
                {
                  showConversation,
                  isCallStarted,
                  isOpen: showConversation, // ✅ Real-time conversation with advanced features
                  layout: 'overlay',
                }
              );
              return null;
            })()}*/}

            {/* Mobile: Summary popup (center modal) - UNIFIED COMPONENT */}
            <MobileSummaryPopup />
          </div>
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
