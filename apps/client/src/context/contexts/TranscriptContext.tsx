import { Transcript } from '@/types';
import { logger } from '@shared/utils/logger';
import React, { createContext, useCallback, useContext, useState } from 'react';

export interface TranscriptContextType {
  // Transcript state
  transcripts: Transcript[];
  setTranscripts: (transcripts: Transcript[]) => void;
  addTranscript: (transcript: Omit<Transcript, 'id' | 'timestamp'>) => void; // ✅ FIXED: Include callId and tenantId

  // Model output state
  modelOutput: string[];
  setModelOutput: (output: string[]) => void;
  addModelOutput: (output: string) => void;

  // Clear functions
  clearTranscripts: () => void;
  clearModelOutput: () => void;
}

const TranscriptContext = createContext<TranscriptContextType | undefined>(
  undefined
);

export function TranscriptProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  logger.debug('[TranscriptProvider] Initializing...', 'Component');

  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [modelOutput, setModelOutput] = useState<string[]>([]);

  // Add transcript to the list
  const addTranscript = useCallback(
    (transcript: Omit<Transcript, 'id' | 'timestamp'>) => {
      // ✅ FIXED: Include callId and tenantId
      const newTranscript: Transcript = {
        ...transcript,
        id: Date.now(), // ✅ FIXED: Generate numeric ID
        callId: transcript.callId || `call-${Date.now()}`, // ✅ IMPROVED: Use provided callId or fallback
        timestamp: new Date(),
        tenantId: transcript.tenantId || 'default', // ✅ IMPROVED: Use provided tenantId or fallback
      };

      logger.debug('[TranscriptContext] Adding new transcript:', 'Component', {
        id: newTranscript.id,
        callId: newTranscript.callId,
        role: newTranscript.role,
        contentPreview: newTranscript.content.substring(0, 50) + '...',
        tenantId: newTranscript.tenantId,
        timestamp: newTranscript.timestamp.toISOString(),
      });

      // Add to local state immediately
      setTranscripts(prev => {
        const updated = [...prev, newTranscript];
        logger.debug(
          '[TranscriptContext] Transcript state updated:',
          'Component',
          {
            previousCount: prev.length,
            newCount: updated.length,
            callId: newTranscript.callId,
          }
        );
        return updated;
      });

      // Send to server database asynchronously
      const saveToServer = async () => {
        try {
          logger.debug(
            '[TranscriptContext] Saving transcript to server:',
            'Component',
            {
              callId: newTranscript.callId,
              role: newTranscript.role,
              contentLength: newTranscript.content.length,
            }
          );

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
          logger.debug(
            '[TranscriptContext] Transcript saved to database successfully:',
            'Component',
            {
              serverId: data.id,
              callId: newTranscript.callId,
              role: newTranscript.role,
            }
          );
        } catch (error) {
          logger.error(
            '[TranscriptContext] Error saving transcript to server:',
            'Component',
            {
              error: error instanceof Error ? error.message : String(error),
              callId: newTranscript.callId,
              role: newTranscript.role,
              contentLength: newTranscript.content.length,
            }
          );
          // Still keep in local state even if server save fails
        }
      };

      // ✅ IMPROVED: Only save to server in production or when API is available
      if (
        !import.meta.env.DEV ||
        import.meta.env.VITE_SAVE_TRANSCRIPTS === 'true'
      ) {
        saveToServer();
      } else {
        logger.debug(
          '[TranscriptContext] Skipping server save in development mode',
          'Component',
          {
            callId: newTranscript.callId,
            role: newTranscript.role,
          }
        );
      }
    },
    []
  );

  // Add model output
  const addModelOutput = useCallback((output: string) => {
    setModelOutput(prev => {
      const updated = [...prev, output];
      logger.debug('[TranscriptContext] Model output added:', 'Component', {
        output: output.substring(0, 50) + '...',
        previousCount: prev.length,
        newCount: updated.length,
      });
      return updated;
    });
  }, []);

  // Clear functions
  const clearTranscripts = useCallback(() => {
    logger.debug('[TranscriptContext] Clearing all transcripts', 'Component', {
      clearedCount: transcripts.length,
    });
    setTranscripts([]);
  }, [transcripts.length]);

  const clearModelOutput = useCallback(() => {
    logger.debug('[TranscriptContext] Clearing all model output', 'Component', {
      clearedCount: modelOutput.length,
    });
    setModelOutput([]);
  }, [modelOutput.length]);

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
