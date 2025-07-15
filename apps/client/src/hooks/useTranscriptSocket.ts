import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseTranscriptSocketProps {
  socketUrl: string;
}

interface TranscriptState {
  text: string;
  isAssistantSpeaking: boolean;
}

export const useTranscriptSocket = ({ socketUrl }: UseTranscriptSocketProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<TranscriptState>({
    text: '',
    isAssistantSpeaking: false,
  });

  // Khởi tạo WebSocket connection
  useEffect(() => {
    console.log('[useTranscriptSocket] Connecting to:', socketUrl);
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('[useTranscriptSocket] Socket.IO connected');
    });

    newSocket.on('disconnect', () => {
      console.log('[useTranscriptSocket] Socket.IO disconnected');
    });

    newSocket.on('error', (error) => {
      console.error('[useTranscriptSocket] Socket.IO error:', error);
    });

    return () => {
      console.log('[useTranscriptSocket] Cleaning up socket connection');
      newSocket.close();
    };
  }, [socketUrl]);

  // Xử lý các events
  useEffect(() => {
    if (!socket) return;

    const handleUserTranscript = (data: { text: string }) => {
      console.log('[useTranscriptSocket] User transcript received:', data);
      if (!state.isAssistantSpeaking) {
        setState(prev => ({ ...prev, text: data.text }));
      }
    };

    const handleAssistantResponse = (data: { assistant_reply_text: string }) => {
      console.log('[useTranscriptSocket] Assistant response received:', data);
      if (state.isAssistantSpeaking) {
        setState(prev => ({ ...prev, text: data.assistant_reply_text }));
      }
    };

    const handleAssistantStartSpeaking = () => {
      console.log('[useTranscriptSocket] Assistant started speaking');
      setState(prev => ({ ...prev, isAssistantSpeaking: true }));
    };

    const handleAssistantEndSpeaking = () => {
      console.log('[useTranscriptSocket] Assistant stopped speaking');
      setState(prev => ({ ...prev, isAssistantSpeaking: false }));
    };

    // Handle generic transcript messages from WebSocket bridge
    const handleTranscript = (data: { role: string; content: string; call_id?: string }) => {
      console.log('[useTranscriptSocket] Generic transcript received:', data);
      if (data.role === 'user') {
        setState(prev => ({ ...prev, text: data.content, isAssistantSpeaking: false }));
      } else if (data.role === 'assistant') {
        setState(prev => ({ ...prev, text: data.content, isAssistantSpeaking: true }));
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