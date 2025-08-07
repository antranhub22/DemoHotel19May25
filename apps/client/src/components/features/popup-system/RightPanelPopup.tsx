import { X } from 'lucide-react';
import React from 'react';
import { useSendToFrontDeskHandler } from '@/hooks/useSendToFrontDeskHandler';
import { SummaryPopupContent } from './SummaryPopupContent';

interface RightPanelPopupProps {
  isOpen: boolean;
  onClose: () => void;
  showSummary?: boolean; // New prop to control summary display
}

const RightPanelPopup: React.FC<RightPanelPopup> = ({ isOpen, onClose, showSummary = false }) => {
  // ✅ REFACTORED: Use dedicated hook for Send to FrontDesk logic
  const { handleSendToFrontDesk, isSubmitting } = useSendToFrontDeskHandler({
    onSuccess: () => {
      alert('✅ Request sent to Front Desk successfully!');
      onClose();
    },
    onError: error => {
      alert(`❌ ${error}`);
    },
  });

  if (!isOpen) {
    return null;
  }

  return (
    <div className="relative">
      {/* Popup Container */}
      <div
        className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4 w-full max-w-sm"
        style={{
          minHeight: '300px',
          maxHeight: '500px',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">
            {showSummary ? 'Call Summary' : 'Right Panel'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close right panel"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Conditional Content */}
        {showSummary ? (
          /* Summary Content */
          <div className="space-y-4">
            {/* Summary Content */}
            <div className="overflow-y-auto" style={{ maxHeight: '320px' }}>
              <SummaryPopupContent />
            </div>

            {/* ✅ SIMPLIFIED: Action Buttons using dedicated hook */}
            <div className="flex gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendToFrontDesk}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Sending...
                  </>
                ) : (
                  'Send to FrontDesk'
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Placeholder Content */
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-2xl">⚙️</span>
            </div>
            <p className="text-center text-sm">
              Panel content will be added here
            </p>
            <p className="text-center text-xs mt-2 text-gray-400">
              Coming soon...
            </p>
          </div>
        )}

        {/* Footer - Optional */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex justify-center">
            <span className="text-xs text-gray-400">
              {showSummary ? 'Call Summary Panel' : 'Right Panel Features'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanelPopup;
