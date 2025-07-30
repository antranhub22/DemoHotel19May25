import { usePopupContext } from '@/context/PopupContext';
import { useEffect } from 'react';
import { SummaryPopupContent } from './SummaryPopupContent';

// Mobile Summary Popup Component - Extracted from Interface1.tsx
export const MobileSummaryPopup = () => {
  console.log(
    '📱 [DEBUG] MobileSummaryPopup component rendered - NEW CODE VERSION'
  );
  const { popups, removePopup } = usePopupContext();

  // ✅ FIX: Calculate showSummary directly from popups to avoid race condition
  const summaryPopup = popups.find(popup => popup.type === 'summary');
  const showSummary = !!summaryPopup;

  console.log('📱 [DEBUG] MobileSummaryPopup - Direct calculation:');
  console.log('📱 [DEBUG] - popups count:', popups.length);
  console.log(
    '📱 [DEBUG] - popups types:',
    popups.map(p => p.type)
  );
  console.log('📱 [DEBUG] - summaryPopup found:', !!summaryPopup);
  console.log('📱 [DEBUG] - showSummary:', showSummary);

  // ✅ NEW: useEffect only for cleanup, not for state management
  useEffect(() => {
    console.log('📱 [DEBUG] MobileSummaryPopup useEffect triggered');
    console.log(
      '📱 [DEBUG] All popups:',
      popups.map(p => ({ id: p.id, type: p.type, title: p.title }))
    );

    if (summaryPopup) {
      console.log(
        '📱 [DEBUG] MobileSummaryPopup - Summary popup found:',
        summaryPopup
      );
    } else {
      console.log('📱 [DEBUG] MobileSummaryPopup - No summary popup found');
    }

    console.log(
      '📱 [DEBUG] MobileSummaryPopup - showSummary:',
      showSummary,
      'popups count:',
      popups.length,
      'summaryPopup:',
      summaryPopup
    );

    if (showSummary) {
      console.log(
        '📱 [DEBUG] MobileSummaryPopup - Summary popup found:',
        summaryPopup
      );
    } else {
      console.log('📱 [DEBUG] MobileSummaryPopup - No summary popup found');
    }

    // ✅ NEW: Auto-cleanup old summary popups to prevent accumulation
    if (popups.length > 10) {
      console.log('🧹 [DEBUG] Too many popups, cleaning up old ones');
      const summaryPopups = popups.filter(popup => popup.type === 'summary');
      if (summaryPopups.length > 1) {
        // Keep only the newest summary popup
        summaryPopups.slice(1).forEach(popup => {
          console.log('🗑️ [DEBUG] Removing old summary popup:', popup.id);
          removePopup(popup.id);
        });
      }
    }
  }, [popups, removePopup, summaryPopup, showSummary]);

  const handleClose = () => {
    console.log('📱 [DEBUG] MobileSummaryPopup - handleClose called');
    // Remove all summary popups
    popups
      .filter(popup => popup.type === 'summary')
      .forEach(popup => {
        console.log('🗑️ [DEBUG] Removing summary popup on close:', popup.id);
        removePopup(popup.id);
      });
  };

  // ✅ DEBUG: Log render state
  console.log(
    '📱 [DEBUG] MobileSummaryPopup render - showSummary:',
    showSummary
  );

  if (!showSummary) {
    console.log('📱 [DEBUG] MobileSummaryPopup - Not showing, returning null');
    return null;
  }

  console.log('📱 [DEBUG] MobileSummaryPopup - Rendering modal');

  return (
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
  );
};
