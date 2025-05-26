// Interface1 component - latest version v1.0.1 
import React, { useState, useCallback, useEffect } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import hotelImage from '../assets/hotel-exterior.jpeg';
import { t } from '@/i18n';
import SiriCallButton from './SiriCallButton';
import RealtimeConversationPopup from './RealtimeConversationPopup';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import InfographicSteps from './InfographicSteps';

interface Interface1Props {
  isActive: boolean;
}

const Interface1: React.FC<Interface1Props> = ({ isActive }) => {
  const { 
    setCurrentInterface, 
    language, 
    setLanguage,
    isMuted,
    micLevel,
    transcripts,
    endCall,
    setEmailSentForCurrentSession,
    setCallDetails,
    setTranscripts,
    setModelOutput,
    setCallDuration
  } = useAssistant();
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [showInfographic, setShowInfographic] = useState(false);
  
  // Track current time for countdown calculations
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handler for Cancel button - End call and go back to interface1
  const handleCancel = useCallback(() => {
    // Call the context's endCall and switch to interface1
    endCall();
    setIsCallStarted(false);
    setShowConversation(false);
  }, [endCall]);

  // Handler for Next button - End call and proceed to interface3
  const handleNext = useCallback(() => {
    // Nếu chưa có hội thoại thì không cho xác nhận
    if (!transcripts || transcripts.length === 0) {
      alert(t('need_conversation', language));
      return;
    }
    // Call the context's endCall and switch to interface3
    endCall();
    if (language === 'fr') {
      setCurrentInterface('interface3fr');
    } else {
      setCurrentInterface('interface3');
    }
  }, [endCall, setCurrentInterface, transcripts, language]);

  const startCall = () => {
    setIsCallStarted(true);
    setShowConversation(true);
    setEmailSentForCurrentSession(false);
    setCallDetails({
      startTime: new Date(),
      endTime: null,
      duration: 0,
      status: 'in-progress'
    });
    setTranscripts([]);
    setModelOutput([]);
    setCallDuration(0);
  };

  // Hàm dùng chung cho mọi ngôn ngữ
  const handleCall = async (lang: 'en' | 'fr' | 'zh' | 'ru' | 'ko') => {
    setEmailSentForCurrentSession(false);
    setCallDetails({
      id: `call-${Date.now()}`,
      roomNumber: '',
      duration: '0',
      category: ''
    });
    setTranscripts([]);
    setModelOutput([]);
    setCallDuration(0);
    let publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
    let assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID;
    if (lang === 'fr') {
      publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY_FR;
      assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID_FR;
    } else if (lang === 'zh') {
      publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY_ZH;
      assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID_ZH;
    } else if (lang === 'ru') {
      publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY_RU;
      assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID_RU;
    } else if (lang === 'ko') {
      publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY_KO;
      assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID_KO;
    }
    const vapi = await initVapi(publicKey);
    if (vapi && assistantId) {
      await vapi.start(assistantId);
      setIsCallStarted(true);
      setShowConversation(true);
    }
  };

  // Hàm xử lý khi click vào icon
  const handleIconClick = (iconName: string) => {
    // Nếu đang hiển thị tooltip cho icon này rồi thì ẩn đi, ngược lại thì hiển thị
    setActiveTooltip(activeTooltip === iconName ? null : iconName);
    
    // Tự động ẩn tooltip sau 3 giây
    if (activeTooltip !== iconName) {
      setTimeout(() => {
        setActiveTooltip(currentTooltip => currentTooltip === iconName ? null : currentTooltip);
      }, 3000);
    }
  };

  // Component hiển thị icon với tooltip
  const IconWithTooltip = ({ iconName, className }: { iconName: string, className?: string }) => (
    <div className="relative flex flex-col items-center justify-center cursor-pointer">
      <span 
        className={`material-icons text-xl sm:text-4xl text-[#F9BF3B] ${className || ''}`} 
        style={{ filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))' }}
        onClick={() => handleIconClick(iconName)}
      >
        {iconName}
      </span>
      
      {activeTooltip === iconName && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-[120px] sm:max-w-[180px] bg-white/90 text-gray-800 text-xs sm:text-sm font-medium py-1 px-2 rounded shadow-lg z-50 pointer-events-none text-center">
          {t(`icon_${iconName}`, language)}
          <div className="absolute w-2 h-2 bg-white/90 transform rotate-45 left-1/2 -translate-x-1/2 top-full -mt-1"></div>
        </div>
      )}
    </div>
  );

  // Hàm để xác định màu sắc và icon dựa trên trạng thái
  const getStatusStyle = (status: string | undefined) => {
    if (!status) return { bg: 'bg-gray-300', text: 'text-gray-800', icon: 'info' };
    switch (status) {
      case 'Đã ghi nhận':
        return { bg: 'bg-gray-300', text: 'text-gray-800', icon: 'assignment_turned_in' };
      case 'Đang thực hiện':
        return { bg: 'bg-yellow-400', text: 'text-yellow-900', icon: 'autorenew' };
      case 'Đã thực hiện và đang bàn giao cho khách':
        return { bg: 'bg-blue-400', text: 'text-blue-900', icon: 'local_shipping' };
      case 'Hoàn thiện':
        return { bg: 'bg-green-500', text: 'text-white', icon: 'check_circle' };
      case 'Lưu ý khác':
        return { bg: 'bg-red-400', text: 'text-white', icon: 'error' };
      default:
        return { bg: 'bg-gray-300', text: 'text-gray-800', icon: 'info' };
    }
  };

  // Hàm chuyển đổi trạng thái từ Staff UI sang key cho dịch thuật
  const getStatusTranslationKey = (status: string | undefined): string => {
    if (!status) return 'status_acknowledged';
    const normalized = status.trim().toLowerCase();
    if (normalized.includes('đã ghi nhận') || normalized.includes('acknowledged')) return 'status_acknowledged';
    if (normalized.includes('đang thực hiện') || normalized.includes('in progress')) return 'status_in_progress';
    if (normalized.includes('bàn giao') || normalized.includes('delivering')) return 'status_delivering';
    if (normalized.includes('hoàn thiện') || normalized.includes('completed')) return 'status_completed';
    if (normalized.includes('lưu ý') || normalized.includes('note')) return 'status_note';
    return 'status_acknowledged';
  };

  // Log dữ liệu order thực tế để debug
  console.log('ActiveOrders:', activeOrders);

  return (
    <div 
      className={`absolute w-full min-h-screen h-full transition-opacity duration-500 ${
        isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
      } z-30 overflow-y-auto`} 
      id="interface1"
      style={{
        backgroundImage: `linear-gradient(rgba(85,154,154,0.7), rgba(121, 219, 220, 0.6)), url(${hotelImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: 'SF Pro Text, Roboto, Open Sans, Arial, sans-serif'
      }}
    >
      <div className="container mx-auto flex flex-col p-2 sm:p-4 md:p-8">
        <div className="mx-auto w-full max-w-4xl bg-white/90 rounded-2xl shadow-xl p-3 sm:p-6 md:p-10 mb-4 sm:mb-6 flex-grow border border-white/40 backdrop-blur-md" style={{minHeight: 420}}>
          <div className="mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-gray-200">
            <p className="font-poppins font-bold text-xl sm:text-2xl text-blue-900 tracking-wide">{t('hotel_name', language)}</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 sm:gap-10 md:gap-16">
            {/* Left column: main content */}
            <div className="md:w-3/4 w-full space-y-3 sm:space-y-4">
              {/* Mobile: Cancel và Confirm lên trên cùng */}
              <div className="flex sm:hidden flex-row w-full gap-2 mb-2">
                <button
                  id="cancelButton"
                  onClick={handleCancel}
                  className="flex items-center justify-center px-3 py-2 bg-white/80 hover:bg-blue-100 text-blue-900 rounded-full text-xs font-semibold border-2 border-blue-200 shadow transition-colors sm:hidden active:scale-95 active:bg-blue-100"
                  style={{
                    fontFamily: 'inherit',
                    letterSpacing: 0.2,
                    minHeight: 44,
                    minWidth: 90,
                    fontSize: 14,
                    touchAction: 'manipulation',
                    zIndex: 10
                  }}
                >
                  <span className="material-icons text-base mr-1">cancel</span>{t('cancel', language)}
                </button>
                <Button
                  id="confirmButton"
                  onClick={handleNext}
                  variant="yellow"
                  className="flex items-center justify-center sm:hidden text-xs font-bold"
                  style={{ minHeight: 44, minWidth: 120, fontSize: 14, zIndex: 10 }}
                >
                  <span className="material-icons text-lg mr-2">send</span>{t('confirm', language)}
                </Button>
              </div>
              {/* Main content */}
              <div className="flex flex-col items-center justify-center space-y-4">
                {!isCallStarted ? (
                  <button
                    onClick={startCall}
                    className="w-full max-w-xs bg-[#d4af37] hover:bg-[#ffd700] text-blue-900 font-bold rounded-full shadow-lg text-lg sm:text-xl transition-colors border border-white/30 flex items-center justify-center py-3 sm:py-4"
                    style={{ fontFamily: 'inherit', letterSpacing: 0.5 }}
                  >
                    <span className="material-icons mr-2 text-lg sm:text-2xl">call</span>
                    {t('press_to_call', language)}
                  </button>
                ) : (
                  <div className="relative flex flex-col items-center justify-center mb-1 sm:mb-6 w-full max-w-xs mx-auto">
                    <SiriCallButton
                      containerId="siri-button"
                      isListening={!isMuted}
                      volumeLevel={micLevel}
                    />
                    {/* Confirm & Cancel buttons dưới SiriCallButton */}
                    <div className="flex flex-row w-full gap-2 mt-4">
                      <button
                        id="cancelButton"
                        onClick={handleCancel}
                        className="flex items-center justify-center px-3 py-2 bg-white/80 hover:bg-blue-100 text-blue-900 rounded-full text-xs font-semibold border-2 border-blue-200 shadow transition-colors sm:hidden active:scale-95 active:bg-blue-100"
                        style={{
                          fontFamily: 'inherit',
                          letterSpacing: 0.2,
                          minHeight: 44,
                          minWidth: 90,
                          fontSize: 14,
                          touchAction: 'manipulation',
                          zIndex: 10
                        }}
                      >
                        <span className="material-icons text-base mr-1">cancel</span>{t('cancel', language)}
                      </button>
                      <Button
                        id="confirmButton"
                        onClick={handleNext}
                        variant="yellow"
                        className="flex items-center justify-center sm:hidden text-xs font-bold"
                        style={{ minHeight: 44, minWidth: 120, fontSize: 14, zIndex: 10 }}
                      >
                        <span className="material-icons text-lg mr-2">send</span>{t('confirm', language)}
                      </Button>
                    </div>
                    {/* Desktop version */}
                    <div className="hidden sm:flex flex-row w-full gap-2 mt-4 justify-center">
                      <Button
                        id="endCallButton"
                        onClick={handleNext}
                        variant="yellow"
                        className="w-full md:w-auto flex items-center justify-center space-x-2 text-base sm:text-lg"
                        style={{ minHeight: 56, minWidth: 220, zIndex: 10 }}
                      >
                        <span className="material-icons">send</span>
                        <span className="whitespace-nowrap">{t('confirm_request', language)}</span>
                      </Button>
                      <button
                        id="cancelButtonDesktop"
                        onClick={handleCancel}
                        className="w-full md:w-auto bg-white hover:bg-blue-100 text-blue-900 font-semibold py-3 px-8 rounded-full shadow flex items-center justify-center space-x-2 transition-all duration-200 border-2 border-blue-200 text-base sm:text-lg active:scale-95 active:bg-blue-100"
                        style={{
                          fontFamily: 'inherit',
                          letterSpacing: 0.2,
                          minHeight: 56,
                          minWidth: 120,
                          touchAction: 'manipulation',
                          zIndex: 10
                        }}
                      >
                        <span className="material-icons text-lg mr-2">cancel</span>{t('cancel', language)}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Right column: control buttons at top-right (ẩn trên mobile) */}
            <div className="md:w-1/4 w-full hidden sm:flex md:justify-end justify-center">
              <div className="flex flex-col items-end space-y-2 sm:space-y-3 w-full md:w-auto">
                <Button
                  id="endCallButton"
                  onClick={handleNext}
                  variant="yellow"
                  className="w-full md:w-auto flex items-center justify-center space-x-2 text-base sm:text-lg"
                  style={{ minHeight: 56, minWidth: 220, zIndex: 10 }}
                >
                  <span className="material-icons">send</span>
                  <span className="whitespace-nowrap">{t('confirm_request', language)}</span>
                </Button>
                <button
                  id="cancelButtonDesktop"
                  onClick={handleCancel}
                  className="w-full md:w-auto bg-white hover:bg-blue-100 text-blue-900 font-semibold py-3 px-8 rounded-full shadow flex items-center justify-center space-x-2 transition-all duration-200 border-2 border-blue-200 text-base sm:text-lg active:scale-95 active:bg-blue-100"
                  style={{
                    fontFamily: 'inherit',
                    letterSpacing: 0.2,
                    minHeight: 56,
                    minWidth: 120,
                    touchAction: 'manipulation',
                    zIndex: 10
                  }}
                >
                  <span className="material-icons text-lg mr-2">cancel</span>{t('cancel', language)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Realtime Conversation Popup */}
      <RealtimeConversationPopup
        isOpen={showConversation}
        onClose={() => setShowConversation(false)}
      />

      {/* Infographic Popup */}
      {showInfographic && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowInfographic(false)}
          />
          <div 
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-2xl h-[80vh] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                {t('how_to_use', language)}
              </h3>
              <button
                onClick={() => setShowInfographic(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 h-[calc(100%-4rem)] overflow-y-auto">
              <InfographicSteps />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Interface1;
