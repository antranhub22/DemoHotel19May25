import React, { useEffect, useState } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { X } from 'lucide-react';
import { t } from '@/i18n';
import { STANDARD_POPUP_HEIGHT, STANDARD_POPUP_MAX_WIDTH, STANDARD_POPUP_MAX_HEIGHT_VH } from '@/context/PopupContext';
import { extractRoomNumber, parseSummaryToOrderDetails } from '@/lib/summaryParser';

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

interface SummaryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  layout?: 'grid' | 'overlay'; // grid = desktop column, overlay = mobile bottom
}

const SummaryPopup: React.FC<SummaryPopupProps> = ({ isOpen, onClose, layout = 'overlay' }) => {
  const { transcripts, callSummary, serviceRequests, language, callDuration } = useAssistant();
  const [callHasEnded, setCallHasEnded] = useState(false);
  const [showSummaryData, setShowSummaryData] = useState(false);

  // ✅ ORIGINAL WORKING LOGIC: Track when call actually ends (from active to 0)
  useEffect(() => {
    // Track call ending: if callDuration goes from > 0 to 0, then call ended
    if (callDuration === 0 && transcripts.length > 0) {
      // Call ended if we have transcripts (meaning call was active before)
      setCallHasEnded(true);
      console.log('📞 [SummaryPopup] Call has ended - enabling summary features');
    } else if (callDuration > 0) {
      // Call is active - reset ended flag
      setCallHasEnded(false);
    }
  }, [callDuration, transcripts.length]);

  // ✅ ORIGINAL WORKING LOGIC: Check when to show summary data
  useEffect(() => {
    const summaryData = getSummaryData();
    console.log('🔍 [SummaryPopup] Summary data check:', {
      hasCallSummary: !!callSummary,
      hasServiceRequests: serviceRequests?.length > 0,
      summaryDataHasData: summaryData.hasData,
      transcriptsCount: transcripts.length,
      callHasEnded,
      callDuration
    });
    
    // Show summary data if we have actual data OR if call has actually ended with transcripts
    const shouldShowData = summaryData.hasData || 
      (transcripts.length >= 2 && callHasEnded); // ✅ Only after call ACTUALLY ends
    
    setShowSummaryData(shouldShowData);
    console.log('📋 [SummaryPopup] Summary data visibility:', shouldShowData);
  }, [callSummary, serviceRequests, transcripts.length, callHasEnded]);

  // Summary data processing
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

  if (!isOpen) return null;

  // Conditional styles based on layout
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

  const data = getSummaryData();

  return (
    <>
      {/* Popup */}
      <div 
        className={`relative z-30 overflow-hidden shadow-2xl summary-popup ${isGrid ? 'grid-layout' : 'overlay-layout'} ${isGrid ? '' : 'mx-auto animate-slide-up'}`}
        style={popupStyles}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200/40 bg-white/10" style={{backdropFilter:'blur(4px)'}}>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">📋 {t('summary', language)}</span>
            {showSummaryData && (
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Summary Content */}
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
          .summary-popup.overlay-layout {
            width: 100vw !important;
            max-width: 100vw !important;
            height: 120px !important;
            max-height: 20vh !important;
            margin: 0 !important;
            border-top-left-radius: 16px !important;
            border-top-right-radius: 16px !important;
          }
        }
      `}</style>
    </>
  );
};

export default SummaryPopup; 