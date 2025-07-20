import React, { useEffect, useCallback } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { t } from '@/i18n';
import { useHotelConfiguration } from '@/hooks/useHotelConfiguration';

interface Interface4Props {
  isActive: boolean;
}

const Interface4: React.FC<Interface4Props> = ({ isActive }) => {
  // ✅ HOOKS STABILITY FIX: Always call all hooks consistently
  const { order, language, setOrder } = useAssistant(); // ✅ REMOVED: setCurrentInterface (focus Interface1 only)

  // Lấy config trực tiếp từ useHotelConfiguration thay vì từ AssistantContext  
  const { config: hotelConfig, isLoading: configLoading, error: configError } = useHotelConfiguration();
  
  // Clear console for clean debugging when Interface4 mounts
  useEffect(() => {
    if (isActive) {
      console.clear();
      console.log('🎬 === Interface4 Debug Session Started ===');
      console.log('🎬 Interface4 mounted with isActive:', isActive);
      console.log('🎬 Order:', order);
    }
  }, [isActive, order]);
  
  const handleReturnHome = useCallback(() => {
    console.log('🏠 Return to Home button clicked');
    console.log('Current interface before:', isActive);
    console.log('Order exists:', !!order);
    
    try {
      // Xóa order để đảm bảo dialog không hiển thị lại
      console.log('🗑️ Clearing order...');
      setOrder(null);
      
      console.log('🔄 Setting interface to interface1...');
      // setCurrentInterface('interface1');
      
      console.log('✅ Order cleared and // setCurrentInterface("interface1") called');
      
      // Force re-render bằng cách wait một chút
      setTimeout(() => {
        console.log('⏰ Delayed check - Current interface should be interface1');
        console.log('⏰ Order should be null:', !order);
      }, 100);
      
    } catch (error) {
      console.error('❌ Error in handleReturnHome:', error);
    }
  }, [isActive, order, setOrder]); // ✅ REMOVED: setCurrentInterface dependency
  
  // Debug logging
  console.log('🔍 Interface4 render:', { 
    isActive, 
    hasOrder: !!order, 
    orderReference: order?.reference,
    timestamp: new Date().toISOString()
  });
  console.log('[DEBUG] Interface4 render:', { hotelConfig });

  // --- EARLY RETURNS AFTER ALL HOOKS ---
  // Early return if hotel config is not loaded
  if (configLoading || !hotelConfig) {
    return (
      <div className="fixed inset-0 z-50 w-full h-full min-h-screen flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading hotel configuration...</p>
        </div>
      </div>
    );
  }

  // Show error if config failed to load
  if (configError) {
    return (
      <div className="fixed inset-0 z-50 w-full h-full min-h-screen flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Failed to load hotel configuration</div>
          <p className="text-white">{configError}</p>
        </div>
      </div>
    );
  }

  // Chỉ hiển thị khi isActive là true VÀ có order
  if (!isActive || !order) {
    console.log('❌ Interface4 not rendering - isActive:', isActive, 'hasOrder:', !!order);
    return null;
  }
  
  return (
    <div 
      className="fixed inset-0 z-50 w-full h-full min-h-screen flex items-start sm:items-center justify-center bg-black/30 backdrop-blur-sm" 
      id="interface4"
      onClick={(e) => {
        // Đảm bảo click vào background không gây lỗi
        if (e.target === e.currentTarget) {
          console.log('🖱️ Background clicked - not closing dialog');
        }
      }}
    >
      <div className="container mx-auto flex flex-col items-center justify-center pt-50 sm:pt-0 p-3 sm:p-5 text-center h-auto">
        <div className="w-full max-w-xs sm:max-w-md bg-white rounded-lg shadow-lg p-4 sm:p-8" style={{ fontFamily: hotelConfig.branding.fonts.primary + ', SF Pro Text, Roboto, Open Sans, Arial, sans-serif' }}>
          {/* Success Animation */}
          <div className="mb-4 sm:mb-6 flex justify-center">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: hotelConfig?.branding?.colors?.primary || '#1e40af' }}>
              <span className="material-icons text-white text-4xl sm:text-5xl">check</span>
            </div>
          </div>
          <h2 className="font-poppins font-bold text-xl sm:text-2xl text-primary mb-2 sm:mb-3">{t('order_confirmed', language)}</h2>
          <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">{t('order_confirmed_message', language)}</p>
          {/* Order Tracking Info */}
          <div className="bg-neutral p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
            <p className="font-medium text-gray-800 text-sm sm:text-base">{t('order_reference', language)}: <span className="font-bold">{order.reference}</span></p>
          </div>
          {/* Estimated Time */}
          <div className="mb-4 sm:mb-6">
            <p className="text-gray-600 text-xs sm:text-sm">{t('estimated_delivery_time', language)}</p>
            <p className="font-poppins font-bold text-lg sm:text-xl">{order.estimatedTime}</p>
          </div>
          {/* Return to Home Button */}
          <button 
            className="w-full px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-poppins font-medium text-sm sm:text-base transition-colors cursor-pointer"
            onClick={handleReturnHome}
            onMouseDown={() => console.log('🖱️ Mouse down on Return to Home button')}
            onMouseUp={() => console.log('🖱️ Mouse up on Return to Home button')}
            style={{ 
              zIndex: 9999,
              position: 'relative',
              pointerEvents: 'auto',
              backgroundColor: hotelConfig.branding.colors.secondary,
              color: '#ffffff'
            }}
          >
            {t('return_to_home', language)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Interface4;
