import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { logger } from '@shared/utils/logger';

interface UseTranscriptSocketProps {
  socketUrl: string;
}

interface TranscriptState {
  text: string;
  isAssistantSpeaking: boolean;
}

export const useTranscriptSocket = ({
  socketUrl,
}: UseTranscriptSocketProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<TranscriptState>({
    text: '',
    isAssistantSpeaking: false,
  });

  // Khởi tạo WebSocket connection
  useEffect(() => {
    logger.debug('[useTranscriptSocket] Connecting to:', 'Component', socketUrl);
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      logger.debug('[useTranscriptSocket] Socket.IO connected', 'Component');
    });

    newSocket.on('disconnect', () => {
      logger.debug('[useTranscriptSocket] Socket.IO disconnected', 'Component');
    });

    newSocket.on('error', error => {
      logger.error('[useTranscriptSocket] Socket.IO error:', 'Component', error);
    });

    return () => {
      logger.debug('[useTranscriptSocket] Cleaning up socket connection', 'Component');
      newSocket.close();
    };
  }, [socketUrl]);

  // Xử lý các events
  useEffect(() => {
    if (!socket) {return;}

    const handleUserTranscript = (data: { text: string }) => {
      logger.debug('[useTranscriptSocket] User transcript received:', 'Component', data);
      if (!state.isAssistantSpeaking) {
        setState(prev => ({ ...prev, text: data.text }));
      }
    };

    const handleAssistantResponse = (data: {
      assistant_reply_text: string;
    }) => {
      logger.debug('[useTranscriptSocket] Assistant response received:', 'Component', data);
      if (state.isAssistantSpeaking) {
        setState(prev => ({ ...prev, text: data.assistant_reply_text }));
      }
    };

    const handleAssistantStartSpeaking = () => {
      logger.debug('[useTranscriptSocket] Assistant started speaking', 'Component');
      setState(prev => ({ ...prev, isAssistantSpeaking: true }));
    };

    const handleAssistantEndSpeaking = () => {
      logger.debug('[useTranscriptSocket] Assistant stopped speaking', 'Component');
      setState(prev => ({ ...prev, isAssistantSpeaking: false }));
    };

    // Handle generic transcript messages from WebSocket bridge
    const handleTranscript = (data: {
      role: string;
      content: string;
      call_id?: string;
    }) => {
      logger.debug('[useTranscriptSocket] Generic transcript received:', 'Component', data);
      if (data.role === 'user') {
        setState(prev => ({
          ...prev,
          text: data.content,
          isAssistantSpeaking: false,
        }));
      } else if (data.role === 'assistant') {
        setState(prev => ({
          ...prev,
          text: data.content,
          isAssistantSpeaking: true,
        }));
      }
    };

    // Đăng ký các event listeners
    socket.on('userTranscript', handleUserTranscript);
    socket.on('assistantResponse', handleAssistantResponse);
    socket.on('assistantStartSpeaking', handleAssistantStartSpeaking);
    socket.on('assistantEndSpeaking', handleAssistantEndSpeaking);
    socket.on('transcript', handleTranscript); // Generic transcript handler

    // Cleanup
    return () => {
      socket.off('userTranscript', handleUserTranscript);
      socket.off('assistantResponse', handleAssistantResponse);
      socket.off('assistantStartSpeaking', handleAssistantStartSpeaking);
      socket.off('assistantEndSpeaking', handleAssistantEndSpeaking);
      socket.off('transcript', handleTranscript);
    };
  }, [socket, state.isAssistantSpeaking]);

  return {
    transcript: state.text,
    isAssistantSpeaking: state.isAssistantSpeaking,
  };
};
