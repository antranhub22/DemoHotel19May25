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
  className?: string;
  zIndex?: number; // For stacking in mobile
}

const SummaryPopup: React.FC<SummaryPopupProps> = ({ 
  isOpen, 
  onClose, 
  layout = 'overlay', 
  className = "",
  zIndex = 40 
}) => {
  const { callSummary, serviceRequests, language, transcripts, callDuration } = useAssistant();
  
  // ✅ SUMMARY DATA PROCESSING
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
          `${req.serviceType}: ${req.requestText || req.details?.otherDetails || 'N/A'}`
        ).join('\n'),
        items: [], // ServiceRequest doesn't have items, will use parseSummaryToOrderDetails later
        timestamp: new Date(),
        hasData: true
      };
    }
    
    // Priority 3: Show processing state if call actually ended with transcripts
    if (transcripts.length >= 2 && callDuration === 0) {
      return {
        source: 'Processing',
        roomNumber: 'Processing...',
        content: 'AI is analyzing your conversation to generate a summary...',
        items: [],
        timestamp: new Date(),
        hasData: true // Show as "has data" to display processing state
      };
    }
    
    // Priority 4: No data state
    return {
      source: 'No Data',
      roomNumber: 'No room detected',
      content: 'No summary available yet. Complete a call to see the summary.',
      items: [],
      timestamp: new Date(),
      hasData: false
    };
  };

  if (!isOpen) return null;

  const data = getSummaryData();

  // ✅ RESPONSIVE STYLES WITH STACKING SUPPORT
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
    // Mobile Overlay: Bottom popup styling with stacking support
    width: '100%',
    maxWidth: `${STANDARD_POPUP_MAX_WIDTH}px`,
    height: `${STANDARD_POPUP_HEIGHT}px`,
    maxHeight: `${STANDARD_POPUP_MAX_HEIGHT_VH}vh`,
    background: 'rgba(255,255,255,0.15)', // Slightly more opaque for stacking
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1.5px solid rgba(255,255,255,0.3)',
    boxShadow: '0 -8px 32px rgba(0,0,0,0.25)', // Stronger shadow for stacking
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
    zIndex: zIndex, // Support for stacking
  };

  // ✅ SUMMARY CONTENT COMPONENT
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
          
          {/* Content Summary */}
          <div className="text-xs">
            <div className="font-medium text-gray-600 mb-1">Summary:</div>
            <div className="text-gray-700 bg-gray-50 rounded p-2 text-[11px] leading-relaxed max-h-24 overflow-y-auto">
              {data.content}
            </div>
          </div>
          
          {/* Items List (if available) */}
          {data.items.length > 0 && (
            <div className="text-xs">
              <div className="font-medium text-gray-600 mb-1">
                Items ({data.items.length}):
              </div>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {data.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-blue-50 rounded p-1 text-[10px]">
                    <span className="font-medium text-blue-900">
                      {item.quantity}x {item.name}
                    </span>
                    {item.price && (
                      <span className="text-blue-700 font-semibold">
                        ${item.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                ))}
                {data.items.length > 3 && (
                  <div className="text-center text-gray-500 text-[10px] italic">
                    +{data.items.length - 3} more items...
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Timestamp */}
          <div className="text-right text-[10px] text-gray-500">
            {data.timestamp.toLocaleString()}
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
              <div className="text-[10px] mt-1">Complete a call to see the summary</div>
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Summary Popup */}
      <div 
        className={`relative overflow-hidden shadow-2xl summary-popup ${isGrid ? 'grid-layout' : 'overlay-layout'} ${isGrid ? '' : 'mx-auto animate-slide-up'} ${className}`}
        style={popupStyles}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200/40 bg-white/10" style={{backdropFilter:'blur(4px)'}}>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">📋 {t('summary', language)}</span>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Summary Content */}
        <SummaryContent data={data} />
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
        .summary-popup.grid-layout {
          /* Grid styling handled by inline styles above */
        }
        
        /* Overlay layout: Responsive styles for mobile bottom popup */
        .summary-popup.overlay-layout {
          /* Only apply responsive styles to overlay layout */
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
           border-bottom-left-radius: 0 !important;
           border-bottom-right-radius: 0 !important;
         }
       }
       
       @media (min-width: 641px) and (max-width: 768px) {
          .summary-popup.overlay-layout {
            width: 95vw !important;
            max-width: 400px !important;
            height: 270px !important;
            max-height: 38vh !important;
            margin: 0 auto !important;
          }
        }
        
        @media (min-width: 769px) {
          .summary-popup.overlay-layout {
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

export default SummaryPopup; 