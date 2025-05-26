import React, { useEffect, useState } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { ServiceRequest } from '@/types';
import hotelImage from '../assets/hotel-exterior.jpeg';
import InfographicSteps from './InfographicSteps';
import { parseSummaryToOrderDetails, extractRoomNumber } from '@/lib/summaryParser';
import { t } from '@/i18n';
import { Button } from './ui/button';

interface Interface3PopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const Interface3Popup: React.FC<Interface3PopupProps> = ({ isOpen, onClose }) => {
  const { 
    orderSummary, 
    setOrderSummary, 
    setCurrentInterface,
    setOrder,
    callSummary,
    setCallSummary,
    serviceRequests,
    callDuration,
    callDetails,
    emailSentForCurrentSession,
    setEmailSentForCurrentSession,
    addActiveOrder,
    translateToVietnamese,
    language
  } = useAssistant();
  const [groupedRequests, setGroupedRequests] = useState<Record<string, ServiceRequest[]>>({});
  const [note, setNote] = useState('');

  // ... giữ nguyên toàn bộ logic, useEffect, các hàm xử lý ...
  // (Copy toàn bộ phần logic từ Interface3 ở đây)

  // ...

  if (!isOpen || !orderSummary) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      {/* Popup */}
      <div 
        className="fixed z-50 overflow-hidden rounded-2xl shadow-2xl"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90vw',
          maxWidth: 420,
          height: '80vh',
          maxHeight: 600,
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1.5px solid rgba(255,255,255,0.25)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        }}
      >
        {/* Nút đóng popup */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/40 bg-white/10" style={{backdropFilter:'blur(4px)'}}>
          <h3 className="text-lg font-semibold text-blue-900">
            {t('order_summary', language)}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <span className="material-icons text-lg">close</span>
          </button>
        </div>
        {/* Copy toàn bộ phần render UI của Interface3 vào đây, giữ nguyên mọi thứ */}
        <div className="p-0 sm:p-2 md:p-4 overflow-y-auto h-[calc(100%-4rem)]">
          {/* ... UI của Interface3 ... */}
        </div>
      </div>
      {/* Responsive popup style cho desktop */}
      <style>{`
        @media (min-width: 640px) {
          .fixed.z-50.overflow-hidden.rounded-2xl.shadow-2xl {
            left: calc(50% - 260px);
            top: 50%;
            transform: translateY(-50%);
            width: 400px !important;
            height: 540px !important;
            max-width: 400px !important;
            max-height: 540px !important;
          }
        }
      `}</style>
    </>
  );
};

export default Interface3Popup; 