import React, { useEffect, useRef, useState } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { X } from 'lucide-react';
import { t } from '@/i18n';
import { STANDARD_POPUP_HEIGHT, STANDARD_POPUP_MAX_WIDTH, STANDARD_POPUP_MAX_HEIGHT_VH } from '@/context/PopupContext';
import { extractRoomNumber, parseSummaryToOrderDetails } from '@/lib/summaryParser';

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

// Interface cho summary data
interface SummaryData {
  source: string;
  roomNumber: string;
  content: string;
  items: Array<{
    name: string;
    description: string;
    quantity: number;
    price: number;
  }>;
  timestamp: Date;
  hasData: boolean;
}

// Tab modes
type PopupMode = 'conversation' | 'summary';

interface RealtimeConversationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  isRight?: boolean;
  layout?: 'grid' | 'overlay'; // grid = desktop column, overlay = mobile bottom
}

const RealtimeConversationPopup: React.FC<RealtimeConversationPopupProps> = ({ isOpen, onClose, isRight, layout = 'overlay' }) => {
  const { transcripts, modelOutput, language, callSummary, serviceRequests, callDuration } = useAssistant();
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrames = useRef<{[key: string]: number}>({});
  
  // 🆕 Tab state - NEW FUNCTIONALITY
  const [mode, setMode] = useState<PopupMode>('conversation');
  const [showSummaryTab, setShowSummaryTab] = useState(false);
  const [callHasEnded, setCallHasEnded] = useState(false); // Track if call actually ended
  
  // ✅ EXISTING STATES - UNCHANGED
  const [visibleChars, setVisibleChars] = useState<VisibleCharState>({});
  const [conversationTurns, setConversationTurns] = useState<ConversationTurn[]>([]);

  // ✅ EXISTING FUNCTIONS - UNCHANGED
  const cleanupAnimations = () => {
    Object.values(animationFrames.current).forEach(frameId => {
      cancelAnimationFrame(frameId);
    });
    animationFrames.current = {};
  };

  // 🆕 NEW: Summary data processing
  const getSummaryData = (): SummaryData => {
    // Priority 1: Vapi.ai callSummary (real-time, voice-optimized)
    if (callSummary && callSummary.content) {
      const roomNumber = extractRoomNumber(callSummary.content);
      const orderDetails = parseSummaryToOrderDetails(callSummary.content);
      
      return {
        source: 'Vapi.ai',
        roomNumber: roomNumber || 'Unknown',
        content: callSummary.content,
        items: orderDetails.items || [],
        timestamp: callSummary.timestamp,
        hasData: true
      };
    }
    
    // Priority 2: OpenAI serviceRequests (enhanced processing)
    if (serviceRequests && serviceRequests.length > 0) {
      const roomNumber = serviceRequests[0]?.details?.roomNumber || 'Unknown';
      
      return {
        source: 'OpenAI Enhanced',
        roomNumber,
        content: serviceRequests.map(req => 
          `${req.serviceType}: ${req.requestText}`
        ).join('\n'),
        items: serviceRequests.map(req => ({
          name: req.serviceType,
          description: req.requestText,
          quantity: 1,
          price: 10
        })),
        timestamp: new Date(),
        hasData: true
      };
    }
    
    // Priority 3: Show processing state if call actually ended with transcripts
    if (transcripts.length >= 2 && callHasEnded) {
      return {
        source: 'Processing',
        roomNumber: 'Processing...',
        content: 'AI is analyzing your conversation to generate a summary...',
        items: [],
        timestamp: new Date(),
        hasData: true // Show as "has data" to display processing state
      };
    }
    
    // Fallback: No summary available
    return {
      source: 'No data',
      roomNumber: 'Unknown',
      content: 'Call summary not available yet',
      items: [],
      timestamp: new Date(),
      hasData: false
    };
  };

  // 🆕 NEW: Track when call actually ends (from active to 0)
  useEffect(() => {
    // Track call ending: if callDuration goes from > 0 to 0, then call ended
    if (callDuration === 0 && transcripts.length > 0) {
      // Call ended if we have transcripts (meaning call was active before)
      setCallHasEnded(true);
      console.log('📞 [RealtimeConversationPopup] Call has ended - enabling summary features');
    } else if (callDuration > 0) {
      // Call is active - reset ended flag
      setCallHasEnded(false);
    }
  }, [callDuration, transcripts.length]);

  // 🆕 NEW: Check when to show summary tab
  useEffect(() => {
    const summaryData = getSummaryData();
    console.log('🔍 [RealtimeConversationPopup] Summary data check:', {
      hasCallSummary: !!callSummary,
      hasServiceRequests: serviceRequests?.length > 0,
      summaryDataHasData: summaryData.hasData,
      transcriptsCount: transcripts.length,
      callHasEnded,
      callDuration
    });
    
    // Show summary tab if we have actual data OR if call has actually ended with transcripts
    const shouldShowTab = summaryData.hasData || 
      (transcripts.length >= 2 && callHasEnded); // ✅ Only after call ACTUALLY ends
    
    setShowSummaryTab(shouldShowTab);
    console.log('📋 [RealtimeConversationPopup] Summary tab visibility:', shouldShowTab);
  }, [callSummary, serviceRequests, transcripts.length, callHasEnded]);

  // 🆕 NEW: Auto-switch to summary when call ends with data
  useEffect(() => {
    if (callHasEnded && showSummaryTab && conversationTurns.length > 0) {
      // Auto switch to summary when call ACTUALLY ends and we have data
      console.log('🔄 [RealtimeConversationPopup] Auto-switching to summary after call end');
      setTimeout(() => setMode('summary'), 1500); // Delay to allow processing message to show
    }
  }, [callHasEnded, showSummaryTab, conversationTurns.length]);

  // ✅ EXISTING EFFECT - UNCHANGED: Process transcripts into conversation turns
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

  // ✅ EXISTING EFFECT - UNCHANGED: Paint-on animation effect
  useEffect(() => {
    // Only animate if we're in conversation mode
    if (mode !== 'conversation') return;
    
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
  }, [conversationTurns, mode]); // Added mode dependency

  // ✅ EXISTING EFFECT - UNCHANGED: Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (containerRef.current && mode === 'conversation') {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [conversationTurns, mode]);

  if (!isOpen) return null;

  // ✅ EXISTING LOGIC - UNCHANGED: Conditional styles based on layout
  const isGrid = layout === 'grid';
  const popupStyles = isGrid ? {
    // Desktop Grid: Normal popup styling
    width: '100%',
    maxWidth: '100%', // Fit parent column
    height: '320px',
    maxHeight: '320px',
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1.5px solid rgba(255,255,255,0.3)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    borderRadius: 16, // Normal border radius
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

  // 🆕 NEW: Summary content component
  const SummaryContent: React.FC<{ data: SummaryData }> = ({ data }) => (
    <div className="space-y-3 p-3">
      {data.hasData ? (
        <>
          {/* Header with source indicator */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-green-700">📋 {t('summary', language)}</span>
            <span className="text-gray-500 text-[10px]">{data.source}</span>
          </div>
          
          {/* Room & Basic Info */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium text-gray-600">Room:</span>
              <span className="ml-1 font-semibold text-blue-800">{data.roomNumber}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Items:</span>
              <span className="ml-1 font-semibold text-green-700">{data.items.length}</span>
            </div>
          </div>
          
          {/* Quick Requests List */}
          {data.items.length > 0 && (
            <div className="space-y-1">
              <div className="text-[11px] font-medium text-gray-600">Requests:</div>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {data.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[10px]">
                    <span className="w-1 h-1 bg-green-500 rounded-full flex-shrink-0"></span>
                    <span className="text-gray-700 truncate">{item.name}</span>
                  </div>
                ))}
                {data.items.length > 3 && (
                  <div className="text-[10px] text-gray-500 italic">
                    +{data.items.length - 3} more items...
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Timestamp */}
          <div className="text-[10px] text-gray-400 text-right">
            {data.timestamp.toLocaleTimeString()}
          </div>
        </>
      ) : (
        /* No Data State - Different for Processing vs No Data */
        <div className="text-center py-4 text-gray-500">
          {data.source === 'Processing' ? (
            <>
              <div className="text-xs">🤖 AI Processing your conversation...</div>
              <div className="text-[10px] mt-1">Generating summary and extracting requests</div>
              <div className="text-[10px] mt-2 animate-pulse">●●●</div>
            </>
          ) : (
            <>
              <div className="text-xs">⏳ No summary available yet</div>
              <div className="text-[10px] mt-1">Complete a conversation to see summary</div>
            </>
          )}
        </div>
      )}
    </div>
  );

  // 🆕 NEW: Conversation content component (extracted from existing logic)
  const ConversationContent: React.FC = () => (
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
                <div className="bg-green-50 rounded-lg p-2">
                  <p
                    className="text-sm font-medium"
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
              <span className="text-xs text-gray-500 mt-0.5 block">
                {turn.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Popup */}
      <div 
        className={`relative z-30 overflow-hidden shadow-2xl realtime-popup ${isGrid ? 'grid-layout' : 'overlay-layout'} ${isRight ? 'popup-right' : ''} ${isGrid ? '' : 'mx-auto animate-slide-up'}`}
        style={popupStyles}
      >
        {/* 🆕 ENHANCED Header with Tabs */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200/40 bg-white/10" style={{backdropFilter:'blur(4px)'}}>
          {/* 🆕 NEW: Tab buttons */}
          <div className="flex space-x-1">
            <button
              onClick={() => setMode('conversation')}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                mode === 'conversation' 
                  ? 'bg-blue-500/80 text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-white/20'
              }`}
            >
              💬 Chat
            </button>
            {showSummaryTab && (
              <button
                onClick={() => setMode('summary')}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  mode === 'summary' 
                    ? 'bg-green-500/80 text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-white/20'
                }`}
              >
                📋 Summary
              </button>
            )}
          </div>
          
          {/* ✅ EXISTING: Close button */}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* 🆕 DYNAMIC Content based on active tab */}
        {mode === 'conversation' ? (
          <ConversationContent />
        ) : (
          <SummaryContent data={getSummaryData()} />
        )}
      </div>

      {/* ✅ EXISTING STYLES - UNCHANGED */}
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
        .realtime-popup.grid-layout {
          /* Grid styling handled by inline styles above */
        }
        
                 /* Overlay layout: Responsive styles for mobile bottom popup */
         .realtime-popup.overlay-layout {
           /* Only apply responsive styles to overlay layout */
         }
         
         @media (max-width: 640px) {
           .realtime-popup.overlay-layout {
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
           .realtime-popup.overlay-layout {
             width: 95vw !important;
             max-width: 400px !important;
             height: 270px !important;
             max-height: 38vh !important;
             margin: 0 auto !important;
           }
         }
         
         @media (min-width: 769px) {
           .realtime-popup.overlay-layout {
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

export default RealtimeConversationPopup; 