import { Transcript } from "@/types/core";
import React from "react";

interface TranscriptItemProps {
  transcript: Transcript | any; // Support both types for compatibility
  formatDate?: (date: Date | string) => string;
  className?: string;
  contentClassName?: string;
  showTimestamp?: boolean;
}

/**
 * Shared TranscriptItem component to eliminate UI duplication
 * Used by RealtimeConversationPopup and CallDetails
 */
export const TranscriptItem: React.FC<TranscriptItemProps> = ({
  transcript,
  formatDate = (date) => new Date(date).toLocaleTimeString(),
  className = "",
  contentClassName = "",
  showTimestamp = true,
}) => {
  const isAssistant = transcript.role === "assistant";

  return (
    <div
      className={`flex ${isAssistant ? "justify-start" : "justify-end"} ${className}`}
    >
      <div
        className={`max-w-[75%] p-3 rounded-lg relative ${
          isAssistant ? "bg-blue-50 text-blue-900" : "bg-gray-100 text-gray-900"
        } ${contentClassName}`}
      >
        {showTimestamp && (
          <div className="text-xs text-gray-500 mb-1">
            {isAssistant ? "Assistant" : "Guest"}
            {transcript.timestamp && <> • {formatDate(transcript.timestamp)}</>}
          </div>
        )}
        <p className="text-sm">
          {transcript.content || transcript.message || ""}
        </p>
      </div>
    </div>
  );
};

export default TranscriptItem;
