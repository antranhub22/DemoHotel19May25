import React, { useEffect, useRef, useState } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { X } from 'lucide-react';
import { t } from '@/i18n';
import { STANDARD_POPUP_HEIGHT, STANDARD_POPUP_MAX_WIDTH, STANDARD_POPUP_MAX_HEIGHT_VH } from '@/context/PopupContext';

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

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  layout?: 'grid' | 'overlay'; // grid = desktop column, overlay = mobile bottom
  className?: string;
}

const ChatPopup: React.FC<ChatPopupProps> = ({ isOpen, onClose, layout = 'overlay', className = "" }) => {
  const { transcripts, language } = useAssistant();
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrames = useRef<{[key: string]: number}>({});
  
  // ✅ CONVERSATION STATES
  const [visibleChars, setVisibleChars] = useState<VisibleCharState>({});
  const [conversationTurns, setConversationTurns] = useState<ConversationTurn[]>([]);

  // ✅ CLEANUP ANIMATIONS
  const cleanupAnimations = () => {
    Object.values(animationFrames.current).forEach(frameId => {
      cancelAnimationFrame(frameId);
    });
    animationFrames.current = {};
  };

  // ✅ PROCESS TRANSCRIPTS INTO CONVERSATION TURNS
  useEffect(() => {
    if (!transcripts || transcripts.length === 0) {
      setConversationTurns([]);
      return;
    }

    const turns: ConversationTurn[] = [];
    let currentUserTurn: ConversationTurn | null = null;
    let currentAssistantTurn: ConversationTurn | null = null;

    transcripts.forEach((transcript) => {
      const role = transcript.role; // Already 'user' | 'assistant'
      const timestamp = new Date(transcript.timestamp);
      const messageId = `${transcript.role}-${transcript.timestamp}-${Math.random()}`;
      
      const message = {
        id: messageId,
        content: transcript.content,
        timestamp: timestamp
      };

      if (role === 'user') {
        if (currentUserTurn) {
          currentUserTurn.messages.push(message);
        } else {
          currentUserTurn = {
            id: `user-turn-${timestamp.getTime()}`,
            role: 'user',
            timestamp: timestamp,
            messages: [message]
          };
          turns.push(currentUserTurn);
          currentAssistantTurn = null;
        }
      } else {
        if (currentAssistantTurn) {
          currentAssistantTurn.messages.push(message);
        } else {
          currentAssistantTurn = {
            id: `assistant-turn-${timestamp.getTime()}`,
            role: 'assistant',
            timestamp: timestamp,
            messages: [message]
          };
          turns.push(currentAssistantTurn);
          currentUserTurn = null;
        }
      }
    });

    setConversationTurns(turns);
  }, [transcripts]);

  // ✅ PAINT-ON ANIMATION EFFECT
  useEffect(() => {
    const assistantMessages = conversationTurns
      .filter(turn => turn.role === 'assistant')
      .flatMap(turn => turn.messages);
    
    assistantMessages.forEach(message => {
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
    
    return () => cleanupAnimations();
  }, [conversationTurns]);

  // ✅ AUTO SCROLL TO BOTTOM
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [conversationTurns]);

  if (!isOpen) return null;

  // ✅ RESPONSIVE STYLES
  const isGrid = layout === 'grid';
  const popupStyles = isGrid ? {
    // Desktop Grid: Normal popup styling
    width: '100%',
    maxWidth: '100%',
    height: '320px',
    maxHeight: '320px',
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1.5px solid rgba(255,255,255,0.3)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    borderRadius: 16,
    marginBottom: 0,
  } : {
    // Mobile Overlay: Bottom popup styling
    width: '100%',
    maxWidth: `${STANDARD_POPUP_MAX_WIDTH}px`,
    height: `${STANDARD_POPUP_HEIGHT}px`,
    maxHeight: `${STANDARD_POPUP_MAX_HEIGHT_VH}vh`,
    background: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: '1.5px solid rgba(255,255,255,0.25)',
    boxShadow: '0 -8px 32px rgba(0,0,0,0.18)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
  };

  return (
    <>
      {/* Chat Popup */}
      <div 
        className={`relative z-30 overflow-hidden shadow-2xl chat-popup ${isGrid ? 'grid-layout' : 'overlay-layout'} ${isGrid ? '' : 'mx-auto animate-slide-up'} ${className}`}
        style={popupStyles}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200/40 bg-white/10" style={{backdropFilter:'blur(4px)'}}>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">💬 {t('chat', language)}</span>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Chat Content */}
        <div 
          ref={containerRef}
          className="px-3 py-2 h-[calc(100%-3rem)] overflow-y-auto"
        >
          {conversationTurns.length === 0 && (
            <div className="text-gray-400 text-base text-center select-none" style={{opacity: 0.7}}>
              {t('tap_to_speak', language)}
            </div>
          )}
          {conversationTurns.map((turn, turnIdx) => (
            <div key={turn.id} className="mb-2">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  {turn.role === 'user' ? (
                    <div className="bg-gray-100 rounded-lg p-2">
                      <p className="text-gray-800 text-sm">{turn.messages[0].content}</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {turn.messages.map((message, messageIdx) => {
                        const visibleText = message.content.slice(0, visibleChars[message.id] || 0);
                        const isCompletelyVisible = visibleChars[message.id] === message.content.length;
                        
                        return (
                          <div 
                            key={message.id}
                            className="text-gray-700 text-sm"
                            style={{
                              background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(16,185,129,0.1))',
                              padding: '8px 12px',
                              borderRadius: '12px',
                              border: '1px solid rgba(59,130,246,0.2)',
                              fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                              lineHeight: 1.4
                            }}
                          >
                            <span>{visibleText}</span>
                            {!isCompletelyVisible && (
                              <span className="animate-pulse">|</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  <span className="text-xs text-gray-500 mt-0.5 block">
                    {turn.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Styles */}
      <style>{`
        /* Animation for slide up from bottom - only for overlay */
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
        
        /* Grid layout: No responsive overrides - use inline styles */
        .chat-popup.grid-layout {
          /* Grid styling handled by inline styles above */
        }
        
        /* Overlay layout: Responsive styles for mobile bottom popup */
        .chat-popup.overlay-layout {
          /* Only apply responsive styles to overlay layout */
        }
        
        @media (max-width: 640px) {
          .chat-popup.overlay-layout {
           width: 100vw !important;
           max-width: 100vw !important;
           height: 120px !important;
           max-height: 20vh !important;
           margin: 0 !important;
           border-top-left-radius: 16px !important;
           border-top-right-radius: 16px !important;
           border-bottom-left-radius: 0 !important;
           border-bottom-right-radius: 0 !important;
         }
       }
       
       @media (min-width: 641px) and (max-width: 768px) {
          .chat-popup.overlay-layout {
            width: 95vw !important;
            max-width: 400px !important;
            height: 270px !important;
            max-height: 38vh !important;
            margin: 0 auto !important;
          }
        }
        
        @media (min-width: 769px) {
          .chat-popup.overlay-layout {
           width: 100% !important;
           max-width: 350px !important;
           height: 280px !important;
           max-height: 40vh !important;
           margin: 0 auto !important;
         }
       }
      `}</style>
    </>
  );
};

export default ChatPopup; 