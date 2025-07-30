import { useAssistant } from '@/context';
import { usePopupContext } from '@/context/PopupContext';
import { useEffect } from 'react';
import { DebugLog } from '../debug/DebugWrapper';
import { SummaryPopupContent } from './SummaryPopupContent';

// Mobile Summary Popup Component - Extracted from Interface1.tsx
export const MobileSummaryPopup = () => {
  const { popups, removePopup } = usePopupContext();
  const { isCallActive } = useAssistant();

  // ✅ FIX: Calculate showSummary directly from popups to avoid race condition
  const summaryPopup = popups.find(popup => popup.type === 'summary');
  const showSummary = !!summaryPopup;

  // ✅ NEW: useEffect only for cleanup, not for state management
  useEffect(() => {
    // ✅ NEW: Auto-cleanup old summary popups to prevent accumulation
    if (popups.length > 10) {
      const summaryPopups = popups.filter(popup => popup.type === 'summary');
      if (summaryPopups.length > 1) {
        // Keep only the newest summary popup
        summaryPopups.slice(1).forEach(popup => {
          removePopup(popup.id);
        });
      }
    }

    // ✅ NEW: Cleanup any existing summary popups on component mount
    // This prevents showing summary popup when first loading the page
    const existingSummaryPopups = popups.filter(
      popup => popup.type === 'summary'
    );
    if (existingSummaryPopups.length > 0) {
      console.log(
        '🧹 [MobileSummaryPopup] Cleaning up existing summary popups on mount'
      );
      existingSummaryPopups.forEach(popup => {
        removePopup(popup.id);
      });
    }

    // ✅ NEW: Cleanup summary popups if call is active
    // Summary should only show when call has ended
    if (isCallActive && summaryPopup) {
      console.log(
        '📱 [MobileSummaryPopup] Call is active, cleaning up summary popup'
      );
      removePopup(summaryPopup.id);
    }
  }, [popups, removePopup, isCallActive, summaryPopup]);

  const handleClose = () => {
    // Remove all summary popups
    popups
      .filter(popup => popup.type === 'summary')
      .forEach(popup => {
        removePopup(popup.id);
      });
  };

  // ✅ NEW: Only show if call is NOT active AND there's actually a summary popup AND it's not empty
  if (!showSummary || !summaryPopup || isCallActive) {
    return null;
  }

  return (
    <>
      <DebugLog
        message="MobileSummaryPopup render state"
        data={{
          showSummary,
          popupsCount: popups.length,
          summaryPopupFound: !!summaryPopup,
          summaryPopupId: summaryPopup?.id,
          isCallActive,
        }}
      />

      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">📋 Call Summary</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <SummaryPopupContent />
        </div>
      </div>
    </>
  );
};
