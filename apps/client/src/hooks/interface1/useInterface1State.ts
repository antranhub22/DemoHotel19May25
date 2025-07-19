import { useState } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { useHotelConfiguration } from '@/hooks/useHotelConfiguration';
import { Language } from '@/types/interface1.types';

/**
 * Hook quản lý states cho Interface1
 * Bao gồm: loading, error, assistant data, UI states
 */
export interface Interface1State {
  // Loading & Error states
  isLoading: boolean;
  error: string | null;
  hotelConfig: any;
  
  // Assistant data
  micLevel: number;
  transcripts: any[];
  callSummary: any;
  serviceRequests: any[];
  language: Language;
  
  // UI states
  showRightPanel: boolean;
  setShowRightPanel: (show: boolean) => void;
  conversationPopupId: string | null;
  setConversationPopupId: (id: string | null) => void;
}

export const useInterface1State = ({ isActive }: { isActive: boolean }): Interface1State => {
  // Core dependencies
  const { micLevel, transcripts, callSummary, serviceRequests, language } = useAssistant();
  const { config: hotelConfig, isLoading: configLoading, error: configError } = useHotelConfiguration();
  
  // Local UI states
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [conversationPopupId, setConversationPopupId] = useState<string | null>(null);

  return {
    // Loading & Error states
    isLoading: configLoading || !hotelConfig,
    error: configError,
    hotelConfig,
    
    // Assistant data
    micLevel,
    transcripts,
    callSummary,
    serviceRequests,
    language,
    
    // UI states
    showRightPanel,
    setShowRightPanel,
    conversationPopupId,
    setConversationPopupId
  };
}; 