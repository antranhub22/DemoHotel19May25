import { Language } from '@/types/interface1.types';
import {
  useInterface1Layout,
  useInterface1State,
  useInterface1Handlers,
  useInterface1Scroll,
  useInterface1Popups,
  type Interface1Layout,
  type Interface1State,
  type Interface1Handlers,
  type Interface1Scroll,
  type Interface1Popups
} from './interface1';

interface UseInterface1Props {
  isActive: boolean;
}

interface UseInterface1Return {
  // Loading & Error states
  isLoading: boolean;
  error: string | null;
  hotelConfig: any;
  
  // Assistant integration
  micLevel: number;
  
  // Scroll behavior
  showScrollButton: boolean;
  scrollToTop: () => void;
  scrollToSection: (section: 'hero' | 'services' | 'conversation') => void;
  heroSectionRef: React.RefObject<HTMLDivElement>;
  serviceGridRef: React.RefObject<HTMLDivElement>;
  conversationRef: React.RefObject<HTMLDivElement>;
  rightPanelRef: React.RefObject<HTMLDivElement>;
  
  // Conversation state
  isCallStarted: boolean;
  showConversation: boolean;
  handleCallStart: (lang: Language) => Promise<{ success: boolean; error?: string }>;
  handleCallEnd: () => void;
  handleCancel: () => void;
  handleConfirm: () => void;
  
  // Right panel state
  showRightPanel: boolean;
  handleRightPanelToggle: () => void;
  handleRightPanelClose: () => void;
  
  // Popup system demo functions
  handleShowConversationPopup: () => void;
  handleShowNotificationDemo: () => void;
  handleShowSummaryDemo: () => void;
}

/**
 * useInterface1 - Refactored Version
 * 
 * Sử dụng modular hooks architecture để:
 * - Tách concerns thành các hooks nhỏ hơn
 * - Dễ maintain và test
 * - Reusable components
 * - Better code organization
 * 
 * Compatible 100% với API cũ - drop-in replacement
 */
export const useInterface1Refactored = ({ isActive }: UseInterface1Props): UseInterface1Return => {
  // 🏗️ Modular hooks composition
  const layout = useInterface1Layout();
  const state = useInterface1State({ isActive });
  const handlers = useInterface1Handlers(state, layout);
  const scroll = useInterface1Scroll({ isActive });
  const popups = useInterface1Popups();

  console.log('🔄 [useInterface1Refactored] Using modular hooks architecture');
  console.log('📊 [useInterface1Refactored] State loading:', state.isLoading, 'error:', !!state.error);

  return {
    // Loading & Error states
    isLoading: state.isLoading,
    error: state.error,
    hotelConfig: state.hotelConfig,
    
    // Assistant integration
    micLevel: state.micLevel,
    
    // Scroll behavior
    showScrollButton: scroll.showScrollButton,
    scrollToTop: scroll.scrollToTop,
    scrollToSection: scroll.scrollToSection,
    
    // Layout refs
    heroSectionRef: layout.refs.heroSectionRef,
    serviceGridRef: layout.refs.serviceGridRef,
    conversationRef: layout.refs.conversationRef,
    rightPanelRef: layout.refs.rightPanelRef,
    
    // Conversation state
    isCallStarted: handlers.isCallStarted,
    showConversation: handlers.showConversation,
    handleCallStart: handlers.handleCallStart,
    handleCallEnd: handlers.handleCallEnd,
    handleCancel: handlers.handleCancel,
    handleConfirm: handlers.handleConfirm,
    
    // Right panel state
    showRightPanel: state.showRightPanel,
    handleRightPanelToggle: handlers.handleRightPanelToggle,
    handleRightPanelClose: handlers.handleRightPanelClose,
    
    // Popup system demo functions
    handleShowConversationPopup: popups.handleShowConversationPopup,
    handleShowNotificationDemo: popups.handleShowNotificationDemo,
    handleShowSummaryDemo: popups.handleShowSummaryDemo
  };
}; 