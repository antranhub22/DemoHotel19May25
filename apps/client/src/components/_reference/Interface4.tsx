// ====================================================================
// 📚 REFERENCE CODE - NOT ACTIVE  
// ====================================================================
// Interface4 - Moved to reference folder for future code patterns
// This component is DISABLED and for reference only
// DO NOT IMPORT OR USE IN ACTIVE DEVELOPMENT
// ====================================================================

import React, { useEffect, useCallback } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { t } from '@/i18n';
import { useHotelConfiguration } from '@/hooks/useHotelConfiguration';
import { logger } from '@shared/utils/logger';

interface Interface4Props {
  isActive: boolean;
}

/**
 * @deprecated This component is disabled and moved to reference folder
 * Use Interface1 for all active development
 */
const Interface4: React.FC<Interface4Props> = ({ isActive }) => {
  // ⚠️ WARNING: This component is for reference only
  console.warn('Interface4 is disabled - use Interface1 instead');
  
  // ✅ HOOKS STABILITY FIX: Always call all hooks consistently
  const { order, language, setOrder } = useAssistant(); // ✅ REMOVED: setCurrentInterface (focus Interface1 only)

  // Lấy config trực tiếp từ useHotelConfiguration thay vì từ AssistantContext
  const {
    config: hotelConfig,
    isLoading: configLoading,
    error: configError,
  } = useHotelConfiguration();

  // ✅ DISABLED: Always return null
  return (
    <div className="fixed inset-0 z-50 bg-red-500/20 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          🚫 Interface4 Disabled
        </h2>
        <p className="text-gray-600 mb-4">
          This interface is disabled for reference only.
        </p>
        <p className="text-gray-600">
          Use Interface1 for all development.
        </p>
      </div>
    </div>
  );

  // ========== ORIGINAL CODE BELOW (REFERENCE ONLY) ==========
  
  // Log Interface4 activation for debugging
  useEffect(() => {
    if (isActive) {
      logger.debug('Interface4 Debug Session Started', 'Interface4');
      logger.debug('Interface4 mounted', 'Interface4', {
        isActive,
        hasOrder: !!order,
      });
    }
  }, [isActive, order]);

  const handleReturnHome = useCallback(() => {
    logger.info('Return to Home button clicked', 'Interface4');
    logger.debug('Current state before return', 'Interface4', {
      isActive,
      hasOrder: !!order,
    });

    try {
      // Xóa order để đảm bảo dialog không hiển thị lại
      logger.debug('Clearing order', 'Interface4');
      setOrder(null);

      logger.debug('Setting interface to interface1', 'Interface4');
      // setCurrentInterface('interface1');

      logger.success(
        'Order cleared and interface reset completed',
        'Interface4'
      );

      // Force re-render bằng cách wait một chút
      setTimeout(() => {
        logger.debug(
          'Delayed check - Current interface should be interface1',
          'Interface4'
        );
        logger.debug('Order should be null', 'Interface4', {
          orderCleared: !order,
        });
      }, 100);
    } catch (error) {
      logger.error('Error in handleReturnHome', 'Interface4', error);
    }
  }, [isActive, order, setOrder]);

  // ... [Rest of original Interface4 code would go here as reference]
  // This section is truncated for brevity in the reference file
};

export default Interface4; 