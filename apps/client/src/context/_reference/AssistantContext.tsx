// ====================================================================
// 📚 LEGACY REFERENCE CODE - NOT ACTIVE
// ====================================================================
// AssistantContext - Moved to reference folder for future code patterns
// This context is DISABLED and for reference only
// DO NOT IMPORT OR USE IN ACTIVE DEVELOPMENT
// Use RefactoredAssistantContext for all active development
// ====================================================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
  useCallback,
} from 'react';
// DISABLED: import { initVapi, getVapiInstance } from '@/lib';
import {
  Transcript,
  OrderSummary,
  CallDetails,
  Order,
  InterfaceLayer,
  CallSummary,
  ServiceRequest,
  ActiveOrder,
} from '@/types';
import ReactDOM from 'react-dom';
import {
  HotelConfiguration,
  getVapiPublicKeyByLanguage,
  getVapiAssistantIdByLanguage,
} from '@/hooks/useHotelConfiguration';
// Dynamic import for code splitting - resetVapi loaded when needed
import { logger } from '@shared/utils/logger';

export type Language = 'en' | 'fr' | 'zh' | 'ru' | 'ko' | 'vi';

/**
 * @deprecated This context is disabled and moved to reference folder
 * Use RefactoredAssistantContext for all active development
 */
export interface AssistantContextType {
  // ✅ REMOVED: Interface switching logic (focus Interface1 only)
  // currentInterface: InterfaceLayer;
  // setCurrentInterface: (layer: InterfaceLayer) => void;
  transcripts: Transcript[];
  setTranscripts: (transcripts: Transcript[]) => void;
  addTranscript: (transcript: Omit<Transcript, 'id' | 'timestamp'>) => void;
  orderSummary: OrderSummary | null;
  setOrderSummary: (summary: OrderSummary) => void;
  callDetails: CallDetails | null;
  setCallDetails: (details: CallDetails) => void;
  order: Order | null;
  setOrder: (order: Order | null) => void;
  callDuration: number;
  setCallDuration: (duration: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
  startCall: () => Promise<void>;
  endCall: () => void;
  callSummary: CallSummary | null;
  setCallSummary: (summary: CallSummary) => void;
  serviceRequests: ServiceRequest[];
  setServiceRequests: (requests: ServiceRequest[]) => void;
  vietnameseSummary: string | null;
  setVietnameseSummary: (summary: string) => void;
  translateToVietnamese: (text: string) => Promise<string>;
  emailSentForCurrentSession: boolean;
  setEmailSentForCurrentSession: (sent: boolean) => void;
  requestReceivedAt: Date | null;
  setRequestReceivedAt: (date: Date | null) => void;
  activeOrders: ActiveOrder[];
  addActiveOrder: (order: ActiveOrder) => void;
  setActiveOrders: React.Dispatch<React.SetStateAction<ActiveOrder[]>>;
  micLevel: number;
  modelOutput: string[];
  setModelOutput: (output: string[]) => void;
  addModelOutput: (output: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  hotelConfig: HotelConfiguration | null;
  setHotelConfig: (config: HotelConfiguration | null) => void;
  // Multi-tenant support
  tenantId: string | null;
  setTenantId: (tenantId: string | null) => void;
  tenantConfig: any | null;
  setTenantConfig: (config: any | null) => void;
  // Call end listeners
  addCallEndListener: (listener: () => void) => () => void;
}

const initialOrderSummary: OrderSummary = {
  orderType: 'Room Service',
  deliveryTime: 'asap',
  roomNumber: '',
  guestName: '',
  guestEmail: '',
  guestPhone: '',
  specialInstructions: '',
  items: [
    {
      id: '1',
      name: 'Club Sandwich',
      description: 'Served with french fries and side salad',
      quantity: 1,
      price: 15.0,
    },
    {
      id: '2',
      name: 'Fresh Orange Juice',
      description: 'Large size',
      quantity: 1,
      price: 8.0,
    },
  ],
  totalAmount: 23.0,
};

// Context definition
const AssistantContext = createContext<AssistantContextType | undefined>(
  undefined
);

/**
 * @deprecated This provider is disabled and moved to reference folder
 * Use RefactoredAssistantProvider for all active development
 */
export function AssistantProvider({ children }: { children: ReactNode }) {
  // ⚠️ WARNING: This provider is for reference only
  console.warn(
    'AssistantProvider is disabled - use RefactoredAssistantProvider instead'
  );

  // Return error message instead of actual provider
  return (
    <div className="fixed inset-0 z-50 bg-red-500/20 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          🚫 AssistantProvider Disabled
        </h2>
        <p className="text-gray-600 mb-4">
          This provider is disabled for reference only.
        </p>
        <p className="text-gray-600">
          Use RefactoredAssistantProvider for all development.
        </p>
      </div>
    </div>
  );

  // ========== ORIGINAL CODE BELOW (REFERENCE ONLY) ==========
  // [Original AssistantProvider implementation would go here]
  // This section is truncated for brevity in the reference file
}

/**
 * @deprecated This hook is disabled and moved to reference folder
 * Use useRefactoredAssistant for all active development
 */
export function useAssistant() {
  console.warn('useAssistant is disabled - use useRefactoredAssistant instead');

  // Return safe defaults for reference components
  return {
    transcripts: [],
    setTranscripts: () => {},
    addTranscript: () => {},
    orderSummary: null,
    setOrderSummary: () => {},
    callDetails: null,
    setCallDetails: () => {},
    order: null,
    setOrder: () => {},
    callDuration: 0,
    setCallDuration: () => {},
    isMuted: false,
    toggleMute: () => {},
    startCall: async () => {},
    endCall: () => {},
    callSummary: null,
    setCallSummary: () => {},
    serviceRequests: [],
    setServiceRequests: () => {},
    vietnameseSummary: null,
    setVietnameseSummary: () => {},
    translateToVietnamese: async () => '',
    emailSentForCurrentSession: false,
    setEmailSentForCurrentSession: () => {},
    requestReceivedAt: null,
    setRequestReceivedAt: () => {},
    activeOrders: [],
    addActiveOrder: () => {},
    setActiveOrders: () => {},
    micLevel: 0,
    modelOutput: [],
    setModelOutput: () => {},
    addModelOutput: () => {},
    language: 'en' as Language,
    setLanguage: () => {},
    hotelConfig: null,
    setHotelConfig: () => {},
    tenantId: null,
    setTenantId: () => {},
    tenantConfig: null,
    setTenantConfig: () => {},
    addCallEndListener: () => () => {},
  } as AssistantContextType;
}
