import { useAssistant } from '@/context';
import { usePopupContext } from '@/context/PopupContext';
import { DebugLog } from '../debug/DebugWrapper';
import { SummaryPopupContent } from './SummaryPopupContent';

// Desktop Summary Popup Component - Similar to MobileSummaryPopup but for desktop layout
export const DesktopSummaryPopup = () => {
  const { popups, removePopup } = usePopupContext();
  const { isCallActive } = useAssistant();

  // ✅ FIX: Calculate showSummary directly from popups to avoid race condition
  const summaryPopup = popups.find(popup => popup.type === 'summary');
  const showSummary = !!summaryPopup;

  // ✅ REMOVED: Cleanup logic moved to useConfirmHandler for centralized management

  const handleClose = () => {
    // Remove all summary popups
    popups
      .filter(popup => popup.type === 'summary')
      .forEach(popup => {
        removePopup(popup.id);
      });
  };

  // ✅ DEBUG: Log render state
  console.log('🖥️ [DesktopSummaryPopup] Render check:', {
    showSummary,
    popupsCount: popups.length,
    summaryPopupFound: !!summaryPopup,
    summaryPopupId: summaryPopup?.id,
    isCallActive,
  });

  // ✅ SIMPLIFIED: Only show if there's a summary popup
  if (!showSummary) {
    console.log(
      '🖥️ [DesktopSummaryPopup] Not showing - no summary popup found'
    );
    return null;
  }

  return (
    <>
      <DebugLog
        message="DesktopSummaryPopup render state"
        data={{
          showSummary,
          popupsCount: popups.length,
          summaryPopupFound: !!summaryPopup,
          isCallActive,
        }}
      />

      <div className="bg-white rounded-lg p-6 max-w-md w-full border border-gray-200 shadow-lg">
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
    </>
  );
};
