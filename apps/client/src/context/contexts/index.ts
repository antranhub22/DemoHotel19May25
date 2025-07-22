// Export all context providers and hooks
export * from './CallContext';
export * from './TranscriptContext';
export * from './LanguageContext';
export * from './OrderContext';
export * from './ConfigurationContext';
export * from './VapiContext';

// Combined provider component for convenience
import React from 'react';
import { CallProvider } from './CallContext';
import { TranscriptProvider } from './TranscriptContext';
import { LanguageProvider } from './LanguageContext';
import { OrderProvider } from './OrderContext';
import { ConfigurationProvider } from './ConfigurationContext';
import { VapiProvider } from './VapiContext';

interface CombinedProviderProps {
  children: React.ReactNode;
}

export function CombinedContextProvider({ children }: CombinedProviderProps) {
  return (
    <ConfigurationProvider>
      <LanguageProvider>
        <VapiProvider>
          <CallProvider>
            <TranscriptProvider>
              <OrderProvider>
                {children}
              </OrderProvider>
            </TranscriptProvider>
          </CallProvider>
        </VapiProvider>
      </LanguageProvider>
    </ConfigurationProvider>
  );
} 