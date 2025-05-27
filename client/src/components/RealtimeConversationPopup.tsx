import React, { useEffect, useRef, useState } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { X } from 'lucide-react';
import { t } from '../i18n';
import { createPortal } from 'react-dom';

// Interface cho trạng thái hiển thị của mỗi message
interface VisibleCharState {
  [messageId: string]: number;
}

// Interface cho một turn trong cuộc hội thoại
interface ConversationTurn {
  id: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  messages: Array<{
    id: string;
    content: string;
    timestamp: Date;
  }>;
}

interface RealtimeConversationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  isRight?: boolean;
}

const RealtimeConversationPopup: React.FC<RealtimeConversationPopupProps> = ({ isOpen, onClose, isRight }) => {
  const { transcripts, modelOutput, language } = useAssistant();
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrames = useRef<{[key: string]: number}>({});
  
  // State cho Paint-on effect
  const [visibleChars, setVisibleChars] = useState<VisibleCharState>({});
  
  // State để lưu trữ các turns đã được xử lý
  const [conversationTurns, setConversationTurns] = useState<ConversationTurn[]>([]);

  // Cleanup function for animations
  const cleanupAnimations = () => {
    Object.values(animationFrames.current).forEach(frameId => {
      cancelAnimationFrame(frameId);
    });
    animationFrames.current = {};
  };

  // Process transcripts into conversation turns
  useEffect(() => {
    const sortedTranscripts = [...transcripts].sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );

    const turns: ConversationTurn[] = [];
    let currentTurn: ConversationTurn | null = null;

    sortedTranscripts.forEach((message) => {
      if (message.role === 'user') {
        // Always create a new turn for user messages
        currentTurn = {
          id: message.id.toString(),
          role: 'user',
          timestamp: message.timestamp,
          messages: [{ 
            id: message.id.toString(), 
            content: message.content,
            timestamp: message.timestamp 
          }]
        };
        turns.push(currentTurn);
      } else {
        // For assistant messages
        if (!currentTurn || currentTurn.role === 'user') {
          // Start new assistant turn
          currentTurn = {
            id: message.id.toString(),
            role: 'assistant',
            timestamp: message.timestamp,
            messages: []
          };
          turns.push(currentTurn);
        }
        // Add message to current assistant turn
        currentTurn.messages.push({
          id: message.id.toString(),
          content: message.content,
          timestamp: message.timestamp
        });
      }
    });

    setConversationTurns(turns);
  }, [transcripts]);

  // Paint-on animation effect
  useEffect(() => {
    // Get all assistant messages from all turns
    const assistantMessages = conversationTurns
      .filter(turn => turn.role === 'assistant')
      .flatMap(turn => turn.messages);
    
    assistantMessages.forEach(message => {
      // Skip if already animated
      if (visibleChars[message.id] === message.content.length) return;
      
      let currentChar = visibleChars[message.id] || 0;
      const content = message.content;
      
      const animate = () => {
        if (currentChar < content.length) {
          setVisibleChars(prev => ({
            ...prev,
            [message.id]: currentChar + 1
          }));
          currentChar++;
          animationFrames.current[message.id] = requestAnimationFrame(animate);
        } else {
          delete animationFrames.current[message.id];
        }
      };
      
      animationFrames.current[message.id] = requestAnimationFrame(animate);
    });
    
    // Cleanup on unmount or when turns change
    return () => cleanupAnimations();
  }, [conversationTurns]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [conversationTurns]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className={`fixed z-[9999] overflow-hidden rounded-2xl shadow-2xl realtime-popup ${isRight ? 'popup-right' : ''}`}
      style={{
        top: 40,
        left: isRight ? 'unset' : 40,
        right: isRight ? 40 : 'unset',
        width: '90vw',
        maxWidth: 360,
        height: '70vh',
        maxHeight: 440,
        background: 'rgba(255,255,255,0.12)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1.5px solid rgba(255,255,255,0.25)',
        boxShadow: isRight ? '0 8px 32px rgba(0,0,0,0.18), 8px 0 24px rgba(0,0,0,0.10)' : '0 8px 32px rgba(0,0,0,0.18)',
        borderRadius: 24,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200/40 bg-white/10" style={{backdropFilter:'blur(4px)'}}>
        <h3 className="text-lg font-semibold text-gray-800">
          Conversation
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      {/* Conversation Content */}
      <div 
        ref={containerRef}
        className="p-4 h-[calc(100%-4rem)] overflow-y-auto"
      >
        {conversationTurns.length === 0 && (
          <div className="text-gray-400 text-base text-center select-none" style={{opacity: 0.7}}>
            {t('tap_to_speak', language)}
          </div>
        )}
        {conversationTurns.map((turn, turnIdx) => (
          <div key={turn.id} className="mb-4">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: turn.role === 'user' ? '#3B82F6' : '#10B981'
                }}
              >
                <span className="text-white text-sm">{turn.role === 'user' ? 'U' : 'A'}</span>
              </div>
              <div className="flex-1">
                {turn.role === 'user' ? (
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-gray-800">{turn.messages[0].content}</p>
                  </div>
                ) : (
                  <div className="bg-green-50 rounded-lg p-3">
                    <p
                      className="text-base md:text-lg font-medium"
                      style={{
                        position: 'relative',
                        background: 'linear-gradient(90deg, #FF512F, #F09819, #FFD700, #56ab2f, #43cea2, #1e90ff, #6a11cb, #FF512F)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 600,
                        letterSpacing: 0.2,
                        transition: 'background 0.5s'
                      }}
                    >
                      <span className="inline-flex flex-wrap">
                        {turn.messages.map((msg, idx) => {
                          const content = msg.content.slice(0, visibleChars[msg.id] || 0);
                          return (
                            <span key={msg.id} style={{ whiteSpace: 'pre' }}>
                              {content}
                              {/* Blinking cursor cho từ cuối cùng khi đang xử lý */}
                              {idx === turn.messages.length - 1 && turnIdx === 0 && visibleChars[msg.id] < msg.content.length && (
                                <span className="animate-blink text-yellow-500" style={{marginLeft: 1}}>|</span>
                              )}
                            </span>
                          );
                        })}
                      </span>
                      {/* 3 chấm nhấp nháy khi assistant đang nghe */}
                      {turnIdx === 0 && turn.role === 'assistant' && visibleChars[turn.messages[turn.messages.length-1].id] === turn.messages[turn.messages.length-1].content.length && (
                        <span className="ml-2 animate-ellipsis text-yellow-500">...</span>
                      )}
                    </p>
                  </div>
                )}
                <span className="text-xs text-gray-500 mt-1 block">
                  {turn.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Desktop: popup lệch phải nút Call */}
      <style>{`
        @media (min-width: 640px) {
          .realtime-popup {
            width: 340px !important;
            height: 420px !important;
            max-width: 340px !important;
            max-height: 420px !important;
          }
          .popup-right {
            /* Có thể thêm hiệu ứng đối xứng nếu muốn */
          }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default RealtimeConversationPopup; 