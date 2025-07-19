import React from 'react';
import { ResponsiveContainer } from '../layouts/ResponsiveContainer';
import { DesktopLayout } from '../layouts/DesktopLayout';
import { MobileLayout } from '../layouts/MobileLayout';
import { ConversationSection } from '../ConversationSection';
import { RightPanelSection } from '../RightPanelSection';
import { SiriButtonContainer } from '../../siri/SiriButtonContainer';
import { Language } from '@/types/interface1.types';

/**
 * CallSection - Main Call Interface Component
 * 
 * Orchestrates all call-related UI components:
 * - Responsive layout management (Desktop vs Mobile)
 * - Voice call interface (SiriButtonContainer)
 * - Real-time conversation display
 * - Right panel for summaries
 * 
 * This component encapsulates the complex responsive logic
 * that was previously mixed in Interface1 component.
 */
interface CallSectionProps {
  state: {
    isCallStarted: boolean;
    showConversation: boolean;
    showRightPanel: boolean;
    micLevel: number;
  };
  handlers: {
    handleCallStart: (lang: Language) => Promise<{ success: boolean; error?: string }>;
    handleCallEnd: () => void;
    handleCancel: () => void;
    handleConfirm: () => void;
    handleRightPanelClose: () => void;
  };
  refs: {
    conversationRef: React.RefObject<HTMLDivElement>;
    rightPanelRef: React.RefObject<HTMLDivElement>;
  };
  className?: string;
}

export const CallSection: React.FC<CallSectionProps> = ({ 
  state, 
  handlers, 
  refs,
  className = "" 
}) => {
  // 🎤 Siri Button Component - Common for both layouts
  const siriButtonComponent = (
    <SiriButtonContainer
      isCallStarted={state.isCallStarted}
      micLevel={state.micLevel}
      onCallStart={async (lang: Language) => {
        // Wrapper to match SiriButtonContainer expected interface
        await handlers.handleCallStart(lang);
      }}
      onCallEnd={handlers.handleCallEnd}
      onCancel={handlers.handleCancel}
      onConfirm={handlers.handleConfirm}
    />
  );

  // 💬 Conversation Component - Layout-specific configurations
  const createConversationComponent = (isOverlay: boolean, mobileClassName?: string) => (
    <ConversationSection
      ref={refs.conversationRef}
      showConversation={state.showConversation}
      onClose={() => {}} // Handled by popup context
      className={mobileClassName || "relative z-40"}
      isOverlay={isOverlay}
    />
  );

  // 📋 Right Panel Component - Layout-specific configurations
  const createRightPanelComponent = (mobileClassName?: string) => (
    <RightPanelSection
      ref={refs.rightPanelRef}
      showPanel={state.showRightPanel}
      onClose={handlers.handleRightPanelClose}
      className={mobileClassName || "relative z-30"}
    />
  );

  return (
    <div className={className}>
      <ResponsiveContainer>
        {{
          // 🖥️ Desktop Layout: Grid-based positioning
          desktop: (
            <DesktopLayout
              conversation={createConversationComponent(false)} // Desktop: relative positioning
              siriButton={siriButtonComponent}
              rightPanel={createRightPanelComponent()}
            />
          ),
          
          // 📱 Mobile Layout: Overlay-based positioning
          mobile: (
            <MobileLayout
              siriButton={siriButtonComponent}
              conversation={createConversationComponent(
                true, // Mobile: overlay positioning
                "fixed bottom-0 left-0 right-0 z-40"
              )}
              rightPanel={createRightPanelComponent("w-full max-w-sm z-20")}
            />
          )
        }}
      </ResponsiveContainer>
    </div>
  );
}; 