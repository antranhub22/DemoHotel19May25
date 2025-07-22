// ====================================================================
// 📚 REFERENCE CODE - NOT ACTIVE
// ====================================================================
// Interface3 - Moved to reference folder for future code patterns
// This component is DISABLED and for reference only
// DO NOT IMPORT OR USE IN ACTIVE DEVELOPMENT
// ====================================================================

import React from 'react';
// import { useEffect, useState } from 'react'; // Unused - commented for reference
// import { useAssistant } from '@/context/_reference/AssistantContext'; // Unused - commented for reference
import { logger } from '@shared/utils/logger';
// import hotelImage from '@/assets/hotel-exterior.jpeg'; // Unused - commented for reference
// import InfographicSteps from '../InfographicSteps'; // Unused - commented for reference
// import {
//   parseSummaryToOrderDetails,
//   extractRoomNumber,
// } from '@/lib/summaryParser'; // Unused - commented for reference
// import { t } from '@/i18n'; // Unused - commented for reference
// import { Button } from '../ui/button'; // Unused - commented for reference
// import { AlertCircle } from 'lucide-react'; // Unused - commented for reference
import { useHotelConfiguration } from '@/hooks/useHotelConfiguration';

interface Interface3Props {
  isActive: boolean;
}

/**
 * @deprecated This component is disabled and moved to reference folder
 * Use Interface1 for all active development
 */
const Interface3: React.FC<Interface3Props> = ({ isActive }) => {
  // ⚠️ WARNING: This component is for reference only
  console.warn('Interface3 is disabled - use Interface1 instead');

  // --- DI CHUYỂN TOÀN BỘ HOOK LÊN ĐẦU COMPONENT ---
  // const {
  //   orderSummary,
  //   setOrderSummary,
  //   // setCurrentInterface, // ✅ REMOVED: Interface switching (focus Interface1 only)
  //   setOrder,
  //   callSummary,
  //   setCallSummary,
  //   serviceRequests,
  //   callDuration,
  //   callDetails,
  //   emailSentForCurrentSession,
  //   setEmailSentForCurrentSession,
  //   addActiveOrder,
  //   translateToVietnamese,
  //   language,
  // } = useAssistant();

  // Lấy config trực tiếp từ useHotelConfiguration thay vì từ AssistantContext
  const {
    config: hotelConfig,
    isLoading: configLoading,
    error: configError,
  } = useHotelConfiguration();

  // const [groupedRequests, setGroupedRequests] = useState<
  //   Record<string, ServiceRequest[]>
  // >({});
  // const [note, setNote] = useState('');
  // --- KẾT THÚC DI CHUYỂN HOOK ---

  // ✅ DISABLED: Always return null
  return (
    <div className="fixed inset-0 z-50 bg-red-500/20 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          🚫 Interface3 Disabled
        </h2>
        <p className="text-gray-600 mb-4">
          This interface is disabled for reference only.
        </p>
        <p className="text-gray-600">Use Interface1 for all development.</p>
      </div>
    </div>
  );

  // ========== ORIGINAL CODE BELOW (REFERENCE ONLY) ==========

  // ✅ FIXED: Render conditionally without early returns
  if (configLoading || !hotelConfig) {
    logger.debug('[DEBUG] Interface3 render:', 'Component', {
      hotelConfig,
      configLoading,
    });
    return (
      <div className="absolute w-full min-h-screen h-full flex items-center justify-center z-10 bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            Loading hotel configuration...
          </p>
        </div>
      </div>
    );
  }

  if (configError) {
    return (
      <div className="absolute w-full min-h-screen h-full flex items-center justify-center z-10 bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">
            Failed to load hotel configuration
          </div>
          <p className="text-gray-600">{configError}</p>
        </div>
      </div>
    );
  }

  // if (!orderSummary) {
  //   return null;
  // }

  // ... [Rest of original Interface3 code would go here as reference]
  // This section is truncated for brevity in the reference file
};

export default Interface3;
