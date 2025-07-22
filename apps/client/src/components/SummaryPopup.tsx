import React, { Suspense } from 'react';
import { X } from 'lucide-react';

// Lazy load for code splitting - NEW: Use separated file
const SummaryPopupContent = React.lazy(() =>
  import('./popup-system/SummaryPopupContent').then(module => ({
    default: module.SummaryPopupContent,
  }))
);
import { logger } from '@shared/utils/logger';
import { useSendToFrontDeskHandler } from '@/hooks/useSendToFrontDeskHandler';

interface SummaryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  layout?: 'grid' | 'center-modal'; // grid = desktop column, center-modal = mobile center
  className?: string; // Allow custom className
}

const SummaryPopup: React.FC<SummaryPopupProps> = ({
  isOpen,
  onClose,
  layout = 'center-modal',
  className = '',
}) => {
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

  if (!isOpen) {return null;}

  const isGrid = layout === 'grid';

  // Shared popup content
  const PopupContent = () => (
    <div
      className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden"
      data-testid="summary-popup"
      style={{
        ...(isGrid
          ? {
              // Desktop Grid: Normal popup styling
              width: '100%',
              maxWidth: '100%',
              minHeight: '300px',
              maxHeight: '500px',
            }
          : {
              // Mobile Center Modal: Modal styling
              width: '90vw',
              maxWidth: '400px',
              maxHeight: '80vh',
            }),
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white/90">
        <h3 className="text-lg font-semibold text-gray-800">🔮 Call Summary</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close summary"
          data-testid="close-button"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Summary Content */}
      <div className="p-4 space-y-4">
        {/* Summary Content */}
        <div
          className="overflow-y-auto"
          style={{
            maxHeight: isGrid ? '320px' : '50vh',
          }}
        >
          <Suspense
            fallback={
              <div className="p-8 text-center text-gray-500">
                Loading summary...
              </div>
            }
          >
            <SummaryPopupContent />
          </Suspense>
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

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
        <div className="flex justify-center">
          <span className="text-xs text-gray-400">Call Summary Panel</span>
        </div>
      </div>
    </div>
  );

  if (isGrid) {
    // Desktop Grid: Normal component
    return (
      <div className={`relative ${className}`}>
        <PopupContent />
      </div>
    );
  }

  // Mobile Center Modal: Fixed positioning with backdrop
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md"
        onClick={onClose}
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      />

      {/* Modal Container */}
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 ${className}`}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            pointerEvents: 'auto',
            animation: 'modalSlideIn 0.3s ease-out',
          }}
        >
          <PopupContent />
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes modalSlideIn {
          from {
            transform: scale(0.95) translateY(20px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default SummaryPopup;
