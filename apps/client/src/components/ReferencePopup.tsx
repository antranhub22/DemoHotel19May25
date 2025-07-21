import React from 'react';
import { logger } from '@shared/utils/logger';

interface ReferencePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReferencePopup: React.FC<ReferencePopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div
      className="relative z-30 overflow-hidden rounded-2xl shadow-2xl reference-popup"
      style={{
        width: '90vw',
        maxWidth: 360,
        height: '70vh',
        maxHeight: 440,
        background: 'rgba(255,255,255,0.12)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1.5px solid rgba(255,255,255,0.25)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b border-gray-200/40 bg-white/10"
        style={{ backdropFilter: 'blur(4px)' }}
      >
        <h3 className="text-lg font-semibold text-gray-800">Reference</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <span className="material-icons text-gray-500">close</span>
        </button>
      </div>
      {/* Placeholder nội dung rỗng */}
      <div className="p-4 h-[calc(100%-4rem)] overflow-y-auto flex items-center justify-center text-gray-400">
        {/* Nội dung sẽ bổ sung sau */}
      </div>
      <style>{`
        @media (min-width: 640px) {
          .reference-popup {
            width: 340px !important;
            height: 420px !important;
            max-width: 340px !important;
            max-height: 420px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReferencePopup;
