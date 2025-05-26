import React, { useEffect, useRef } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { X } from 'lucide-react';
import { t } from '../i18n';

interface RealtimeConversationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const RealtimeConversationPopup: React.FC<RealtimeConversationPopupProps> = ({ isOpen, onClose }) => {
  const { transcripts, modelOutput, language } = useAssistant();
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcripts, modelOutput]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div 
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-2xl h-[80vh] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {t('realtime_conversation', language)}
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
          {transcripts.map((transcript) => (
            <div key={`transcript-${transcript.id}`} className="mb-4">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">U</span>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-gray-800">{transcript.content}</p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">
                    {transcript.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {modelOutput.map((output, index) => (
            <div key={`output-${index}`} className="mb-4">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">A</span>
                </div>
                <div className="flex-1">
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-gray-800">{output}</p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default RealtimeConversationPopup; 