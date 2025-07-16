import { useAssistant } from '@/context/AssistantContext';
import { useHotelConfiguration } from '@/hooks/useHotelConfiguration';
import { useScrollBehavior } from '@/hooks/useScrollBehavior';
import { useConversationState } from '@/hooks/useConversationState';

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
  
  // Conversation state
  isCallStarted: boolean;
  showConversation: boolean;
  handleCallStart: (lang: any) => Promise<{ success: boolean; error?: string }>;
  handleCallEnd: () => void;
}

export const useInterface1 = ({ isActive }: UseInterface1Props): UseInterface1Return => {
  // Core dependencies
  const { micLevel } = useAssistant();
  const { config: hotelConfig, isLoading: configLoading, error: configError } = useHotelConfiguration();
  
  // Behavior hooks
  const scrollBehavior = useScrollBehavior({ isActive });
  const conversationState = useConversationState({ 
    conversationRef: scrollBehavior.conversationRef 
  });

  return {
    // Loading & Error states
    isLoading: configLoading || !hotelConfig,
    error: configError,
    hotelConfig,
    
    // Assistant integration
    micLevel,
    
    // Scroll behavior (spread)
    ...scrollBehavior,
    
    // Conversation state (spread)
    ...conversationState
  };
}; 