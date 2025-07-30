import { usePopupContext } from '@/context/PopupContext';
import { useEffect } from 'react';
import { DebugLog } from '../debug/DebugWrapper';
import { SummaryPopupContent } from './SummaryPopupContent';

// Mobile Summary Popup Component - Extracted from Interface1.tsx
export const MobileSummaryPopup = () => {
  const { popups, removePopup } = usePopupContext();

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
  }, [popups, removePopup]);

  const handleClose = () => {
    // Remove all summary popups
    popups
      .filter(popup => popup.type === 'summary')
      .forEach(popup => {
        removePopup(popup.id);
      });
  };

  if (!showSummary) {
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
        }}
      />

      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
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
