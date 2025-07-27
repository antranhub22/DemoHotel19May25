import { useAssistant } from '@/context';
import { t } from '@/i18n';
import { X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

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

const ChatPopup: React.FC<ChatPopupProps> = ({
  isOpen,
  onClose,
  layout = 'overlay',
  className = '',
}) => {
  const { transcripts, language } = useAssistant();
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrames = useRef<{ [key: string]: number }>({});

  // ✅ DEBUG: Add logging to track isOpen and transcripts
  useEffect(() => {
    console.log('🔍 [ChatPopup] Props and state changed:', {
      isOpen,
      layout,
      transcriptsCount: transcripts?.length || 0,
      transcriptsData:
        transcripts?.map(t => ({
          id: t.id,
          role: t.role,
          content: t.content?.substring(0, 30) + '...',
        })) || [],
    });
  }, [isOpen, layout, transcripts]);

  // ✅ FIX: Track animation state to prevent re-animation on re-renders
  const [hasAnimated, setHasAnimated] = useState(false);

  // Conversation states
  const [visibleChars, setVisibleChars] = useState<VisibleCharState>({});
  const [conversationTurns, setConversationTurns] = useState<
    ConversationTurn[]
  >([]);

  // ✅ DEBUG: Add logging to track conversationTurns
  useEffect(() => {
    console.log('🔍 [ChatPopup] ConversationTurns changed:', {
      count: conversationTurns.length,
      turns: conversationTurns.map(turn => ({
        id: turn.id,
        role: turn.role,
        messagesCount: turn.messages.length,
      })),
    });
  }, [conversationTurns]);

  // ✅ FIX: Reset animation state when popup opens/closes
  useEffect(() => {
    if (isOpen && !hasAnimated) {
      setHasAnimated(true);
    } else if (!isOpen) {
      setHasAnimated(false);
    }
  }, [isOpen]); // 🔧 FIX: Removed hasAnimated to prevent infinite loop

  const cleanupAnimations = () => {
    Object.values(animationFrames.current).forEach(frameId => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    });
    animationFrames.current = {};
  };

  useEffect(() => {
    return cleanupAnimations;
  }, []);

  // Process transcripts into conversation turns
  useEffect(() => {
    if (!transcripts || transcripts.length === 0) {
      setConversationTurns([]);
      return;
    }

    const sortedTranscripts = [...transcripts].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    const turns: ConversationTurn[] = [];
    let currentTurn: ConversationTurn | null = null;

    sortedTranscripts.forEach(message => {
      if (message.role === 'user') {
        // Always create a new turn for user messages
        currentTurn = {
          id: message.id.toString(),
          role: 'user',
          timestamp: message.timestamp,
          messages: [
            {
              id: message.id.toString(),
              content: message.content,
              timestamp: message.timestamp,
            },
          ],
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
            messages: [],
          };
          turns.push(currentTurn);
        }
        // Add message to current assistant turn
        currentTurn.messages.push({
          id: message.id.toString(),
          content: message.content,
          timestamp: message.timestamp,
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
      if (!visibleChars[message.id]) {
        setVisibleChars(prev => ({ ...prev, [message.id]: 0 }));

        const paintText = () => {
          setVisibleChars(prev => {
            const currentLength = prev[message.id] || 0;
            if (currentLength < message.content.length) {
              const frameId = requestAnimationFrame(paintText);
              animationFrames.current[message.id] = frameId;
              return { ...prev, [message.id]: currentLength + 1 };
            } else {
              delete animationFrames.current[message.id];
              return prev;
            }
          });
        };

        setTimeout(paintText, 100);
      }
    });
  }, [conversationTurns]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [conversationTurns]);

  const isGrid = layout === 'grid';

  // ✅ FIX: Memoize styles to prevent recalculation
  const popupStyles = useMemo(
    () =>
      isGrid
        ? {
            // Desktop Grid: Normal popup styling
            width: '100%',
            maxWidth: '100%',
            height: '320px',
            maxHeight: '320px',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }
        : {
            // Full screen layout
            width: '100vw',
            height: '100vh',
            maxWidth: '100vw',
            maxHeight: '100vh',
            background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
            borderRadius: '0',
            border: 'none',
            boxShadow: 'none',
          },
    [isGrid]
  );

  if (!isOpen) {
    return null;
  }

  // Popup content component
  const PopupContent = () => (
    <div
      className={`relative z-30 overflow-hidden shadow-2xl chat-popup ${isGrid ? 'grid-layout' : 'overlay-layout'} ${!isGrid && hasAnimated ? 'mx-auto animate-slide-up' : 'mx-auto'}`}
      style={popupStyles}
      data-testid="chat-popup"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b border-gray-200/40 bg-white/10"
        style={{ backdropFilter: 'blur(4px)' }}
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">
            💬 {t('chat', language)}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          data-testid="close-button"
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
          <div
            className="text-gray-400 text-base text-center select-none"
            style={{ opacity: 0.7 }}
          >
            {t('tap_to_speak', language)}
          </div>
        )}
        {conversationTurns.map((turn, _turnIdx) => (
          <div key={turn.id} className="mb-2">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                {turn.role === 'user' ? (
                  <div className="bg-gray-100 rounded-lg p-2">
                    <p className="text-gray-800 text-sm">
                      {turn.messages[0].content}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {turn.messages.map((message, _msgIdx) => (
                      <div
                        key={message.id}
                        className="bg-blue-50 rounded-lg p-2"
                      >
                        <p className="text-blue-900 text-sm">
                          {message.content.slice(
                            0,
                            visibleChars[message.id] || 0
                          )}
                          {(visibleChars[message.id] || 0) <
                            message.content.length && (
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
          // ✅ FIX: Prevent mobile viewport issues
          transform: 'translateZ(0)', // Force layer creation
          WebkitTransform: 'translateZ(0)',
        }}
      >
        <div
          style={{
            pointerEvents: 'auto',
            // ✅ FIX: Ensure content doesn't shift
            position: 'relative',
            transform: 'translateZ(0)',
          }}
        >
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
          animation: slideUp 0.3s ease-out forwards;
        }

        /* ✅ FIX: Correct CSS selectors for space-separated classes */
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
            /* ✅ FIX: Prevent mobile jerky behavior */
            position: relative !important;
            transform: translateZ(0) !important;
            -webkit-transform: translateZ(0) !important;
          }
        }

        /* ✅ FIX: Add mobile optimization for smooth rendering */
        .chat-popup {
          transform: translateZ(0); /* Force hardware acceleration */
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          -webkit-perspective: 1000;
          perspective: 1000;
          /* ✅ FIX: Prevent sub-pixel rendering issues */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .chat-popup.overlay-layout {
          will-change: transform; /* Optimize for animations */
          /* ✅ FIX: Stabilize mobile rendering */
          contain: layout style paint;
        }

        /* ✅ FIX: Prevent layout shift during scroll */
        .chat-popup .overflow-y-auto {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
          /* ✅ FIX: Prevent scroll bounce on iOS */
          overscroll-behavior: contain;
        }

        /* ✅ FIX: Prevent mobile tap delays */
        .chat-popup * {
          touch-action: manipulation;
        }
      `}</style>
    </>
  );
};

export default ChatPopup;
