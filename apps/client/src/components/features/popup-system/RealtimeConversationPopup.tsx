import * as React from "react";
import { useAssistant } from "@/context";
import {
  STANDARD_POPUP_HEIGHT,
  STANDARD_POPUP_MAX_HEIGHT_VH,
  STANDARD_POPUP_MAX_WIDTH,
} from "@/context/PopupContext";
import { t } from "@/i18n";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
// Interface cho trạng thái hiển thị của mỗi message
interface VisibleCharState {
  [messageId: string]: number;
}

// Interface cho một turn trong cuộc hội thoại
interface ConversationTurn {
  id: string;
  role: "user" | "assistant";
  timestamp: Date;
  messages: Array<{
    id: string;
    content: string;
    timestamp: Date;
  }>;
}

// Interface cho summary data
/* REMOVED UNUSED INTERFACE
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
*/

// Remove PopupMode type that includes 'summary'
// type PopupMode = 'conversation' | 'summary';

interface RealtimeConversationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  isRight?: boolean;
  layout?: "grid" | "overlay"; // grid = desktop column, overlay = mobile bottom
}

const RealtimeConversationPopup: React.FC<RealtimeConversationPopupProps> = ({
  isOpen,
  onClose,
  isRight,
  layout = "overlay",
}) => {
  const { transcripts, language } = useAssistant();
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrames = useRef<{ [key: string]: number }>({});

  const prefersReducedMotion = useReducedMotion();

  // ✅ DEBUG: Add logging to track transcripts
  useEffect(() => {
    console.log("🔍 [RealtimeConversationPopup] Transcripts changed:", {
      count: transcripts?.length || 0,
      transcripts:
        transcripts?.map((t) => ({
          id: t.id,
          role: t.role,
          content: t.content?.substring(0, 50) + "...",
          timestamp: t.timestamp,
        })) || [],
    });
  }, [transcripts]);

  // ✅ SIMPLIFIED: Remove tab state - only conversation now
  // Remove: const [mode, setMode] = useState<PopupMode>('conversation');
  // Remove: const [showSummaryTab, setShowSummaryTab] = useState(false);
  // Remove: const [callHasEnded, setCallHasEnded] = useState(false);

  // ✅ EXISTING STATES - UNCHANGED
  const [visibleChars, setVisibleChars] = useState<VisibleCharState>({});
  const [conversationTurns, setConversationTurns] = useState<
    ConversationTurn[]
  >([]);

  // ✅ DEBUG: Add logging to track conversationTurns
  useEffect(() => {
    console.log("🔍 [RealtimeConversationPopup] ConversationTurns changed:", {
      count: conversationTurns.length,
      turns: conversationTurns.map((turn) => ({
        id: turn.id,
        role: turn.role,
        messagesCount: turn.messages.length,
        firstMessage:
          turn.messages[0]?.content?.substring(0, 50) + "..." || "No content",
      })),
    });
  }, [conversationTurns]);

  // ✅ EXISTING FUNCTIONS - UNCHANGED
  const cleanupAnimations = () => {
    Object.values(animationFrames.current).forEach((frameId) => {
      cancelAnimationFrame(frameId);
    });
    animationFrames.current = {};
  };

  // Remove: Summary data processing function getSummaryData
  // Remove: Track when call actually ends useEffect
  // Remove: Check when to show summary tab useEffect
  // Remove: Auto-switch to summary when call ends useEffect

  // ✅ EXISTING EFFECT - UNCHANGED: Process transcripts into conversation turns
  useEffect(() => {
    console.log(
      "🔍 [RealtimeConversationPopup] Processing transcripts into turns:",
      {
        transcriptsCount: transcripts?.length || 0,
        transcriptsData: transcripts,
      },
    );

    const sortedTranscripts = [...transcripts].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );

    const turns: ConversationTurn[] = [];
    let currentTurn: ConversationTurn | null = null;

    sortedTranscripts.forEach((message) => {
      if (message.role === "user") {
        // Always create a new turn for user messages
        currentTurn = {
          id: message.id.toString(),
          role: "user",
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
        if (!currentTurn || currentTurn.role === "user") {
          // Start new assistant turn
          currentTurn = {
            id: message.id.toString(),
            role: "assistant",
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

    console.log("🔍 [RealtimeConversationPopup] Generated turns:", {
      turnsCount: turns.length,
      turns: turns.map((turn) => ({
        id: turn.id,
        role: turn.role,
        messagesCount: turn.messages.length,
      })),
    });

    setConversationTurns(turns);
  }, [transcripts]);

  // ✅ EXISTING EFFECT - UNCHANGED: Paint-on animation effect
  useEffect(() => {
    // Only animate if we're in conversation mode
    // if (mode !== 'conversation') return; // mode is removed

    // Get all assistant messages from all turns
    const assistantMessages = conversationTurns
      .filter((turn) => turn.role === "assistant")
      .flatMap((turn) => turn.messages);

    assistantMessages.forEach((message) => {
      // Skip if already animated
      if (visibleChars[message.id] === message.content.length) {
        return;
      }

      let currentChar = visibleChars[message.id] || 0;
      const content = message.content;

      const animate = () => {
        if (currentChar < content.length) {
          setVisibleChars((prev) => ({
            ...prev,
            [message.id]: currentChar + 1,
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
  }, [conversationTurns]); // Removed mode dependency

  // ✅ EXISTING EFFECT - UNCHANGED: Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [conversationTurns]);

  if (!isOpen) {
    return null;
  }

  // ✅ EXISTING LOGIC - UNCHANGED: Conditional styles based on layout
  const isGrid = layout === "grid";
  const popupStyles = isGrid
    ? {
        // Desktop Grid: Normal popup styling
        width: "100%",
        maxWidth: "100%", // Fit parent column
        height: "320px",
        maxHeight: "320px",
        background: "rgba(255,255,255,0.15)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1.5px solid rgba(255,255,255,0.3)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        borderRadius: 16, // Normal border radius
        marginBottom: 0,
      }
    : {
        // Mobile Overlay: Bottom popup styling
        width: "100%",
        maxWidth: `${STANDARD_POPUP_MAX_WIDTH}px`,
        height: `${STANDARD_POPUP_HEIGHT}px`,
        maxHeight: `${STANDARD_POPUP_MAX_HEIGHT_VH}vh`,
        background: "rgba(255,255,255,0.12)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1.5px solid rgba(255,255,255,0.25)",
        boxShadow: "0 -8px 32px rgba(0,0,0,0.18)",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        marginBottom: 0,
      };

  // 🆕 NEW: Conversation content component (extracted from existing logic)
  const ConversationContent: React.FC = () => (
    <div
      ref={containerRef}
      className="px-3 py-2 h-[calc(100%-3rem)] overflow-y-auto"
    >
      {conversationTurns.length === 0 && (
        <div
          className="text-gray-400 text-base text-center select-none"
          style={{ opacity: 0.7 }}
        >
          {t("tap_to_speak", language)}
        </div>
      )}
      {conversationTurns.map((turn, turnIdx) => (
        <div key={turn.id} className="mb-2">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              {turn.role === "user" ? (
                <div className="bg-gray-100 rounded-lg p-2">
                  <p className="text-gray-800 text-sm">
                    {turn.messages[0].content}
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 rounded-lg p-2">
                  <p
                    className="text-sm font-medium"
                    style={{
                      position: "relative",
                      background:
                        "linear-gradient(90deg, #FF512F, #F09819, #FFD700, #56ab2f, #43cea2, #1e90ff, #6a11cb, #FF512F)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontWeight: 600,
                      letterSpacing: 0.2,
                      transition: "background 0.5s",
                    }}
                  >
                    <span className="inline-flex flex-wrap">
                      {turn.messages.map((msg, idx) => {
                        const content = msg.content.slice(
                          0,
                          visibleChars[msg.id] || 0,
                        );
                        return (
                          <span key={msg.id} style={{ whiteSpace: "pre" }}>
                            {content}
                            {/* Blinking cursor cho từ cuối cùng khi đang xử lý */}
                            {idx === turn.messages.length - 1 &&
                              turnIdx === 0 &&
                              visibleChars[msg.id] < msg.content.length && (
                                <span
                                  className="animate-blink text-yellow-500"
                                  style={{ marginLeft: 1 }}
                                >
                                  |
                                </span>
                              )}
                          </span>
                        );
                      })}
                    </span>
                    {/* 3 chấm nhấp nháy khi assistant đang nghe */}
                    {turnIdx === 0 &&
                      turn.role === "assistant" &&
                      visibleChars[
                        turn.messages[turn.messages.length - 1].id
                      ] ===
                        turn.messages[turn.messages.length - 1].content
                          .length && (
                        <span className="ml-2 animate-ellipsis text-yellow-500">
                          ...
                        </span>
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
        className={`relative z-50 overflow-hidden shadow-2xl realtime-popup ${isGrid ? "grid-layout" : "overlay-layout"} ${isRight ? "popup-right" : ""} ${isGrid ? "" : "mx-auto animate-slide-up"}`}
        style={popupStyles}
      >
        {/* ✅ SIMPLIFIED Header - No tabs needed */}
        <div
          className="flex items-center justify-between px-4 py-2 border-b border-gray-200/40 bg-white/10"
          style={{
            backdropFilter: prefersReducedMotion ? undefined : "blur(4px)",
            WebkitBackdropFilter: prefersReducedMotion
              ? undefined
              : "blur(4px)",
          }}
        >
          {/* Simple title instead of tabs */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">
              💬 {t("chat", language)}
            </span>
          </div>

          {/* ✅ EXISTING: Close button */}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* ✅ SIMPLIFIED Content - Only conversation */}
        <ConversationContent />
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
