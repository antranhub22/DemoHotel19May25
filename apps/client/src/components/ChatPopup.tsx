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
  className?: string; // Allow custom className
}

const ChatPopup: React.FC<ChatPopupProps> = ({ isOpen, onClose, layout = 'overlay', className = "" }) => {
  const { transcripts, modelOutput, language, callDuration } = useAssistant();
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrames = useRef<{[key: string]: number}>({});
  
  // Conversation states
  const [visibleChars, setVisibleChars] = useState<VisibleCharState>({});
  const [conversationTurns, setConversationTurns] = useState<ConversationTurn[]>([]);

  const cleanupAnimations = () => {
    Object.values(animationFrames.current).forEach(frameId => {
      cancelAnimationFrame(frameId);
    });
    animationFrames.current = {};
  };

  // ✅ ORIGINAL WORKING LOGIC: Process transcripts into conversation turns
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
  }, [conversationTurns, visibleChars]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [conversationTurns]);

  if (!isOpen) return null;

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

  // Popup content component
  const PopupContent = () => (
    <div 
      className={`relative z-30 overflow-hidden shadow-2xl chat-popup ${isGrid ? 'grid-layout' : 'overlay-layout'} ${isGrid ? '' : 'mx-auto animate-slide-up'}`}
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

      {/* Conversation Content */}
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
                    {turn.messages.map((message, msgIdx) => (
                      <div key={message.id} className="bg-blue-50 rounded-lg p-2">
                        <p className="text-blue-900 text-sm">
                          {message.content.slice(0, visibleChars[message.id] || 0)}
                          {(visibleChars[message.id] || 0) < message.content.length && (
                            <span className="opacity-60 animate-pulse">|</span>
                          )}
                        </p>
                      </div>
                    ))}
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
  );

  // Desktop: Return popup directly
  if (isGrid) {
    return <PopupContent />;
  }

  // Mobile: Wrap with fixed positioning container
  return (
    <>
      <div 
        className={className}
        style={{
          position: 'fixed',
          bottom: '40px', // Minimal space above bottom
          left: 0,
          right: 0,
          zIndex: 40, // Lower than SiriButton canvas
          pointerEvents: 'none', // Allow click-through container
        }}
      >
        <div style={{ pointerEvents: 'auto' }}> {/* Only popup interactive */}
          <PopupContent />
        </div>
      </div>

      {/* Styles */}
      <style>{`
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
      `}</style>
    </>
  );
};

export default ChatPopup; 