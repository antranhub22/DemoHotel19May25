import { useAssistant } from '@/context';
import { usePopupContext } from '@/context/PopupContext';
import { DebugLog } from '../debug/DebugWrapper';
import { SummaryPopupContent } from './SummaryPopupContent';

// Mobile Summary Popup Component - Extracted from Interface1.tsx
export const MobileSummaryPopup = () => {
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

  // ✅ SIMPLIFIED: Only show if there's a summary popup
  if (!showSummary || !summaryPopup) {
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
