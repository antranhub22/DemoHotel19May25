import React, { createContext, useContext, useState, useCallback } from 'react';
import { logger } from '@shared/utils/logger';
import { Transcript } from '@/types';

export interface TranscriptContextType {
  // Transcript state
  transcripts: Transcript[];
  setTranscripts: (transcripts: Transcript[]) => void;
  addTranscript: (transcript: Omit<Transcript, 'id' | 'timestamp'>) => void;
  
  // Model output state
  modelOutput: string[];
  setModelOutput: (output: string[]) => void;
  addModelOutput: (output: string) => void;
  
  // Clear functions
  clearTranscripts: () => void;
  clearModelOutput: () => void;
}

const TranscriptContext = createContext<TranscriptContextType | undefined>(undefined);

export function TranscriptProvider({ children }: { children: React.ReactNode }) {
  logger.debug('[TranscriptProvider] Initializing...', 'Component');
  
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [modelOutput, setModelOutput] = useState<string[]>([]);

  // Add transcript to the list
  const addTranscript = useCallback((transcript: Omit<Transcript, 'id' | 'timestamp' | 'callId'>) => {
    const newTranscript: Transcript = {
      ...transcript,
      callId: `call-${Date.now()}`, // Will be updated with actual callId later
      timestamp: new Date(),
      tenantId: 'default', // Will be updated with actual tenantId later
    };

    // Add to local state immediately
    setTranscripts(prev => [...prev, newTranscript]);

    // Send to server database asynchronously
    const saveToServer = async () => {
      try {
        const response = await fetch('/api/transcripts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            callId: newTranscript.callId,
            role: newTranscript.role,
            content: newTranscript.content,
            tenantId: newTranscript.tenantId,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to save transcript: ${response.status}`);
        }

        const data = await response.json();
        logger.debug('[TranscriptContext] Transcript saved to database:', 'Component', data);
      } catch (error) {
        logger.error('[TranscriptContext] Error saving transcript to server:', 'Component', error);
        // Still keep in local state even if server save fails
      }
    };

    saveToServer();
  }, []);

  // Add model output
  const addModelOutput = useCallback((output: string) => {
    setModelOutput(prev => [...prev, output]);
    logger.debug('[TranscriptContext] Model output added:', 'Component', output);
  }, []);

  // Clear functions
  const clearTranscripts = useCallback(() => {
    setTranscripts([]);
    logger.debug('[TranscriptContext] Transcripts cleared', 'Component');
  }, []);

  const clearModelOutput = useCallback(() => {
    setModelOutput([]);
    logger.debug('[TranscriptContext] Model output cleared', 'Component');
  }, []);

  const value: TranscriptContextType = {
    transcripts,
    setTranscripts,
    addTranscript,
    modelOutput,
    setModelOutput,
    addModelOutput,
    clearTranscripts,
    clearModelOutput,
  };

  return (
    <TranscriptContext.Provider value={value}>
      {children}
    </TranscriptContext.Provider>
  );
}

export function useTranscript() {
  const context = useContext(TranscriptContext);
  if (context === undefined) {
    throw new Error('useTranscript must be used within a TranscriptProvider');
  }
  return context;
} 