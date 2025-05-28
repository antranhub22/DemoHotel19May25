// Interface1 component - latest version v1.0.1 
import React, { useState, useEffect, useCallback } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import hotelImage from '../assets/hotel-exterior.jpeg';
import { t } from '../i18n';
import { ActiveOrder } from '@/types';
import { initVapi, getVapiInstance } from '@/lib/vapiClient';
import { FaGlobeAsia } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';
import SiriCallButton from './SiriCallButton';
import RealtimeConversationPopup from './RealtimeConversationPopup';
import { Button } from '@/components/ui/button';
import ReferencePopup from './ReferencePopup';
import Interface3 from './Interface3';
import { parseSummaryToOrderDetails } from '@/lib/summaryParser';

interface Interface1Props {
  isActive: boolean;
}

const Interface1: React.FC<Interface1Props> = ({ isActive }) => {
  const { 
    setCurrentInterface, 
    setTranscripts, 
    setModelOutput, 
    setCallDetails, 
    setCallDuration, 
    setEmailSentForCurrentSession,
    activeOrders,
    language,
    setLanguage,
    callSummary,
    orderSummary,
    setOrderSummary,
    endCall
  } = useAssistant();

  const [isMuted, setIsMuted] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [localDuration, setLocalDuration] = useState(0);
  const [showOrderCard, setShowOrderCard] = useState(false);
  
  // State để lưu trữ tooltip đang hiển thị
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [showSummaryPopup, setShowSummaryPopup] = useState(false);
  const [showGeneratingPopup, setShowGeneratingPopup] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  
  // Track current time for countdown calculations
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Toggle mute function
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Format duration for display
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  };

  // Handler for Cancel button - End call and go back to interface1
  const handleCancel = useCallback(() => {
    setCurrentInterface('interface1');
  }, [setCurrentInterface]);

  // Handler for Next button - End call and proceed to interface3
  const handleNext = useCallback(() => {
    if (language === 'fr') {
      setCurrentInterface('interface3fr');
    } else {
      setCurrentInterface('interface3');
    }
  }, [setCurrentInterface, language]);

  // Local timer as a backup to ensure we always have a working timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    // Only start the timer when this interface is active
    if (isActive) {
      console.log('Interface1 is active, starting local timer');
      setLocalDuration(0);
      
      // Start the local timer
      timer = setInterval(() => {
        setLocalDuration(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) {
        console.log('Cleaning up local timer in Interface1');
        clearInterval(timer);
      }
    };
  }, [isActive]);

  // Hàm dùng chung cho mọi ngôn ngữ
  const handleCall = async (lang: 'en' | 'fr' | 'zh' | 'ru' | 'ko' | 'vi') => {
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
    } else if (lang === 'vi') {
      publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY_VI;
      assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID_VI;
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
  const IconWithTooltip = ({ iconName, tooltip, className }: { iconName: string, tooltip: string, className?: string }) => (
    <div className="relative flex flex-col items-center justify-center cursor-pointer">
      <span 
        className={`material-icons text-xl sm:text-4xl text-[#F9BF3B] ${className || ''}`} 
        style={{ filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))' }}
        onClick={() => handleIconClick(iconName)}
      >
        {iconName}
      </span>
      {activeTooltip === iconName && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-[160px] sm:max-w-[200px] bg-white/90 text-gray-800 text-xs sm:text-sm font-medium py-1 px-2 rounded shadow-lg z-50 pointer-events-none text-center">
          {tooltip}
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

  // Thêm hàm lấy instance vapi
  const vapi = getVapiInstance();

  // Handler cho nút Cancel
  const handleCancelVapiCall = () => {
    if (vapi) vapi.stop();
    setIsCallStarted(false);
    setShowConversation(false);
    setShowSummaryPopup(false);
    setCurrentInterface('interface1');
  };
  // Handler cho nút Confirm
  const handleConfirmVapiCall = async () => {
    if (!isCallStarted || !vapi) return;
    setIsConfirming(true);
    try {
      vapi.stop();
      endCall();
      // Nếu chưa có orderSummary, tạo mới từ callSummary
      if (!orderSummary && callSummary?.content) {
        const summary = parseSummaryToOrderDetails(callSummary.content);
        setOrderSummary(summary as any);
      }
      // Nếu chưa có summary thực sự, show popup Generating
      if (!callSummary?.content || callSummary.content === 'Generating AI summary of your conversation...') {
        setShowGeneratingPopup(true);
      } else {
        setShowSummaryPopup(true);
      }
    } catch (error) {
      console.error('Error ending call:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  // Theo dõi callSummary, khi đã có nội dung thực sự thì ẩn popup Generating và show popup summary
  useEffect(() => {
    if (
      showGeneratingPopup &&
      callSummary?.content &&
      callSummary.content !== 'Generating AI summary of your conversation...'
    ) {
      setShowGeneratingPopup(false);
      setShowSummaryPopup(true);
    }
  }, [callSummary, showGeneratingPopup]);

  useEffect(() => {
    if (
      callSummary?.content &&
      callSummary.content !== 'Generating AI summary of your conversation...' &&
      (!orderSummary || !orderSummary.items || orderSummary.items.length === 0)
    ) {
      const summary = parseSummaryToOrderDetails(callSummary.content);
      setOrderSummary(summary as any);
    }
  }, [callSummary, orderSummary, setOrderSummary]);

  useEffect(() => {
    if (isActive) {
      setShowSummaryPopup(false);
      setShowGeneratingPopup(false);
      setIsCallStarted(false);
      setShowConversation(false);
    }
  }, [isActive]);

  // Theo dõi activeOrders để hiển thị thẻ Order khi có order mới từ Interface3
  useEffect(() => {
    console.log('activeOrders changed:', activeOrders);
    if (activeOrders && activeOrders.length > 0) {
      console.log('Setting showOrderCard to true');
      setShowOrderCard(true);
    }
  }, [activeOrders]);

  // Thêm useEffect để debug showOrderCard
  useEffect(() => {
    console.log('showOrderCard changed:', showOrderCard);
  }, [showOrderCard]);

  // Mapping icon và tooltip cho từng panel
  const toursIcons = [
    { iconName: 'wb_sunny', tooltip: 'Half Day' },
    { iconName: 'calendar_today', tooltip: 'Full Day' },
    { iconName: 'event_note', tooltip: 'Multi Day' },
    { iconName: 'star', tooltip: 'Special Tours' },
  ];
  const busTicketsIcons = [
    { iconName: 'location_city', tooltip: 'Ho Chi Minh' },
    { iconName: 'park', tooltip: 'Da Lat' },
    { iconName: 'beach_access', tooltip: 'Nha Trang' },
    { iconName: 'waves', tooltip: 'Da Nang' },
    { iconName: 'directions_boat', tooltip: 'Can Tho' },
    { iconName: 'directions_bus', tooltip: 'Vung Tau' },
    { iconName: 'nature_people', tooltip: 'My Tho' },
  ];
  const vehicleRentalIcons = [
    { iconName: 'two_wheeler', tooltip: 'Motorbike' },
    { iconName: 'drive_eta', tooltip: 'Car with driver' },
    { iconName: 'directions_car', tooltip: 'Car without Driver' },
  ];
  const currencyIcons = [
    { iconName: 'attach_money', tooltip: 'USD' },
    { iconName: 'euro', tooltip: 'EUR' },
    { iconName: 'currency_ruble', tooltip: 'RUB' },
    { iconName: 'currency_yen', tooltip: 'KWR' },
    { iconName: 'swap_horiz', tooltip: 'Other' },
  ];
  const laundryIcons = [
    { iconName: 'local_laundry_service', tooltip: 'Standard' },
    { iconName: 'bolt', tooltip: 'Express' },
    { iconName: 'dry_cleaning', tooltip: 'Dry Cleaning' },
    { iconName: 'iron', tooltip: 'Iron Service' },
    { iconName: 'help', tooltip: 'Special Request' },
  ];
  const homestayIcons = [
    { iconName: 'home', tooltip: 'Under 300.000 VND' },
    { iconName: 'attach_money', tooltip: '300.000 to 600.000 VND' },
    { iconName: 'house_siding', tooltip: 'Over 600.000 VND' },
    { iconName: 'calendar_month', tooltip: 'Long-Rent' },
    { iconName: 'meeting_room', tooltip: 'Full-House' },
  ];

  // Icon và tooltip cho các dịch vụ mới
  const localTourismIcons = [
    { iconName: 'map', tooltip: 'Area Map' },
    { iconName: 'place', tooltip: 'Attractions' },
    { iconName: 'directions_walk', tooltip: 'Walking Tour' },
    { iconName: 'info', tooltip: 'Tourist Info' },
  ];
  const roomServiceIcons = [
    { iconName: 'restaurant', tooltip: 'Order Food' },
    { iconName: 'local_cafe', tooltip: 'Beverages' },
    { iconName: 'breakfast_dining', tooltip: 'Breakfast' },
    { iconName: 'room_service', tooltip: 'Other Requests' },
  ];
  const housekeepingIcons = [
    { iconName: 'cleaning_services', tooltip: 'Cleaning' },
    { iconName: 'local_laundry_service', tooltip: 'Laundry' },
    { iconName: 'bathtub', tooltip: 'Bathroom' },
    { iconName: 'king_bed', tooltip: 'Bedding' },
  ];
  const guestFeedbackIcons = [
    { iconName: 'rate_review', tooltip: 'Review' },
    { iconName: 'feedback', tooltip: 'Feedback' },
    { iconName: 'star_rate', tooltip: 'Rate Us' },
    { iconName: 'question_answer', tooltip: 'Q&A' },
  ];
  const localSouvenirIcons = [
    { iconName: 'shopping_bag', tooltip: 'Souvenir Shop' },
    { iconName: 'local_florist', tooltip: 'Handicraft' },
    { iconName: 'redeem', tooltip: 'Gift' },
    { iconName: 'storefront', tooltip: 'Local Product' },
  ];

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
      <div className={`container mx-auto flex flex-col items-center justify-start text-white p-3 pt-6 sm:p-5 sm:pt-10 lg:pt-16 overflow-visible pb-32 sm:pb-24 ${isConfirming ? 'opacity-5' : 'opacity-100'} transition-opacity duration-300`} 
        style={{ transform: 'translateZ(20px)', minHeight: 'fit-content' }}
      >
        {/* Header chính với logo và tên khách sạn */}
        <div className="w-full flex flex-row items-center justify-start mb-2">
          <img src="/assets/minhon-logo.jpg" alt="Mi Nhon Hotel Logo" className="h-12 w-12 sm:h-16 sm:w-16 object-contain mr-3" style={{ filter: 'brightness(0) invert(1)' }} />
        </div>
        {/* Dòng chữ giới thiệu AI voice assistant */}
        <p className="text-2xl sm:text-4xl lg:text-5xl text-center max-w-full mb-4 truncate sm:whitespace-nowrap overflow-x-auto font-[Dancing_Script,cursive] font-bold" style={{ fontFamily: 'Dancing Script, Poppins, cursive', letterSpacing: 1 }}>
          Speak Multiple Languages with Our AI Voice Assistant
        </p>
        
        {/* Main Call Button với hiệu ứng nâng cao */}
        <div className="flex flex-row items-start justify-center gap-4 mb-4 sm:mb-12 w-full relative">
          {/* Popup realtime conversation bên trái - chỉ desktop */}
          {showConversation && (
            <div className="hidden sm:block flex-shrink-0" style={{ marginRight: 0 }}>
              <RealtimeConversationPopup 
                isOpen={showConversation}
                onClose={() => setShowConversation(false)}
              />
            </div>
          )}
          {/* Nút Call luôn ở giữa */}
          <div className="flex-none flex flex-col items-center justify-center mx-auto" style={{zIndex: 10}}>
            {!isCallStarted ? (
              <>
                {/* Ripple Animation ... */}
          <div className="absolute inset-0 rounded-full border-4 border-amber-400 animate-[ripple_1.5s_linear_infinite] pointer-events-none transition-opacity duration-300 group-hover:opacity-80 opacity-60"></div>
          <div className="absolute inset-0 rounded-full border-4 border-amber-400/70 animate-[ripple_2s_linear_infinite] pointer-events-none transition-opacity duration-300 group-hover:opacity-60 opacity-40"></div>
          {/* Main Button */}
            <button 
            id={`vapiButton${language === 'en' ? 'En' : language === 'fr' ? 'Fr' : language === 'zh' ? 'Zh' : language === 'ru' ? 'Ru' : language === 'ko' ? 'Ko' : 'Vi'}`}
            className="group relative w-36 h-36 sm:w-40 sm:h-40 lg:w-56 lg:h-56 rounded-full font-poppins font-bold flex flex-col items-center justify-center overflow-hidden hover:translate-y-[-2px] hover:shadow-[0px_12px_20px_rgba(0,0,0,0.2)]"
            onClick={() => handleCall(language as any)}
            style={{
              background: language === 'en' 
                      ? 'linear-gradient(180deg, rgba(85,154,154,0.9) 0%, rgba(85,154,154,0.9) 100%)'
                : language === 'fr' 
                      ? 'linear-gradient(180deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.9) 100%)'
                : language === 'zh' 
                      ? 'linear-gradient(180deg, rgba(220, 38, 38, 0.9) 0%, rgba(185, 28, 28, 0.9) 100%)'
                : language === 'ru' 
                      ? 'linear-gradient(180deg, rgba(79, 70, 229, 0.9) 0%, rgba(67, 56, 202, 0.9) 100%)'
                      : language === 'ko' 
                            ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.9) 100%)'
                            : 'linear-gradient(180deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.9) 100%)',
              boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.25), 0px 6px 12px rgba(0, 0, 0, 0.15), inset 0px 1px 0px rgba(255, 255, 255, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              transition: 'all 0.3s ease',
              transform: 'translateY(0) translateZ(30px)',
            }}
          >
            <span className="material-icons text-4xl sm:text-6xl lg:text-7xl mb-2 text-[#F9BF3B] transition-all duration-300 group-hover:scale-110" 
              style={{ 
                filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))',
                color: language === 'en' 
                        ? '#F9BF3B'
                  : language === 'fr' 
                        ? '#FFFFFF'
                  : language === 'zh' 
                        ? '#FFEB3B'
                  : language === 'ru' 
                        ? '#F48FB1'
                        : language === 'ko' 
                              ? '#4ADE80'
                              : '#4ADE80'
              }}
            >mic</span>
            <span className="text-lg sm:text-2xl lg:text-3xl font-bold whitespace-nowrap text-white"
              style={{ textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}
            >{t('press_to_call', language)}</span>
            <span className="absolute w-full h-full rounded-full pointer-events-none"></span>
            </button>
              </>
            ) : (
              <div className="relative flex flex-col items-center justify-center mb-1 sm:mb-6 w-full max-w-xs mx-auto">
                <SiriCallButton
                  containerId="siri-button"
                  isListening={!isMuted}
                  volumeLevel={micLevel}
                />
                {/* Duration bar với các nút hai bên, căn giữa tuyệt đối */}
                <div className="flex items-center justify-center mt-2 w-full gap-2 sm:gap-3">
                  {/* Nút Mute bên trái */}
                  <button
                    className="flex items-center justify-center transition-colors"
                    title={isMuted ? t('unmute', language) : t('mute', language)}
                    onClick={toggleMute}
                    style={{fontSize: 22, padding: 0, background: 'none', border: 'none', color: '#d4af37', width: 28, height: 28}}
                    onMouseOver={e => (e.currentTarget.style.color = '#ffd700')}
                    onMouseOut={e => (e.currentTarget.style.color = '#d4af37')}
                  >
                    <span className="material-icons">{isMuted ? 'mic_off' : 'mic'}</span>
                  </button>
                  {/* Duration ở giữa, luôn căn giữa */}
                  <div className="flex-1 flex justify-center">
                    <div className="text-white text-xs sm:text-sm bg-blue-900/80 rounded-full px-3 sm:px-4 py-1 shadow-lg border border-white/30 flex items-center justify-center" style={{backdropFilter:'blur(2px)'}}>
                      {formatDuration(localDuration)}
                    </div>
                  </div>
                  {/* Nút MicLevel bên phải */}
                  <div className="w-7 h-7 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                      <div 
                        className="w-3 h-3 rounded-full bg-white transition-all duration-200"
                        style={{
                          transform: `scale(${1 + (micLevel * 0.5)})`,
                          opacity: 0.7 + (micLevel * 0.3)
                        }}
                      />
                    </div>
                  </div>
                </div>
                {/* Hai nút nhỏ Cancel/Confirm dưới hàng Mute/Duration/Volume */}
                {isCallStarted && (
                  <div className="flex flex-row justify-between items-center w-full max-w-xs mx-auto mt-2 gap-2">
                    <button
                      className="flex-1 py-2 rounded-full bg-white hover:bg-red-100 text-red-700 font-semibold text-sm border border-red-200 shadow transition"
                      style={{ minWidth: 90, maxWidth: 120 }}
                      onClick={handleCancelVapiCall}
                    >
                      Cancel
                    </button>
                    <button
                      className="flex-1 py-2 rounded-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold text-sm shadow transition"
                      style={{ minWidth: 90, maxWidth: 120 }}
                      onClick={handleConfirmVapiCall}
                    >
                      {t('confirm_request', language)}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Popup reference bên phải - chỉ desktop */}
          {showConversation && (
            <div className="hidden sm:block flex-shrink-0 text-gray-800" style={{ marginLeft: 0 }}>
              <ReferencePopup 
                isOpen={showConversation}
                onClose={() => setShowConversation(false)}
              />
            </div>
          )}
        </div>
        {/* Popup realtime conversation & reference - chỉ mobile, render dưới nút Call */}
        {showConversation && (
          <div className="block sm:hidden w-full flex flex-col items-center gap-2 mb-2 text-gray-800">
            <RealtimeConversationPopup 
              isOpen={showConversation}
              onClose={() => setShowConversation(false)}
            />
            <ReferencePopup 
              isOpen={showConversation}
              onClose={() => setShowConversation(false)}
            />
          </div>
        )}
        {/* Services Section - Glass Morphism & 3D */}
        <div className="text-center w-full max-w-5xl mb-10 sm:mb-8" style={{ perspective: '1000px' }}>
          {/* Hàng trên cùng: 5 dịch vụ mới */}
          <div className="flex flex-col md:flex-row justify-center gap-3 mb-3 w-full">
            {/* Local Tourism Info */}
            <div className="p-0.5 py-0 sm:p-2 w-4/5 mx-auto md:w-48 min-h-[38px] h-[45px] sm:min-h-[77px] sm:h-[90px] transition-all duration-250 hover:scale-103 hover:-translate-y-1 flex flex-col justify-between"
              style={{
                background: 'rgba(85,154,154,0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                transform: 'translateZ(20px)'
              }}
            >
              <h4 className="font-medium text-amber-400 pb-0 mb-0.5 text-xs sm:text-sm"
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}
              >Local Tourism Info</h4>
              <ul className="grid grid-cols-4 gap-0 sm:gap-2 py-0.5 sm:py-2">
                {localTourismIcons.map(i => (
                  <li key={i.iconName}><IconWithTooltip iconName={i.iconName} tooltip={i.tooltip} /></li>
                ))}
              </ul>
            </div>
            {/* Room Service */}
            <div className="p-0.5 py-0 sm:p-2 w-4/5 mx-auto md:w-48 min-h-[38px] h-[45px] sm:min-h-[77px] sm:h-[90px] transition-all duration-250 hover:scale-103 hover:-translate-y-1 flex flex-col justify-between"
              style={{
                background: 'rgba(85,154,154,0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                transform: 'translateZ(20px)'
              }}
            >
              <h4 className="font-medium text-amber-400 pb-0 mb-0.5 text-xs sm:text-sm"
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}
              >Room Service</h4>
              <ul className="grid grid-cols-4 gap-0 sm:gap-2 py-0.5 sm:py-2">
                {roomServiceIcons.map(i => (
                  <li key={i.iconName}><IconWithTooltip iconName={i.iconName} tooltip={i.tooltip} /></li>
                ))}
              </ul>
            </div>
            {/* Housekeeping */}
            <div className="p-0.5 py-0 sm:p-2 w-4/5 mx-auto md:w-48 min-h-[38px] h-[45px] sm:min-h-[77px] sm:h-[90px] transition-all duration-250 hover:scale-103 hover:-translate-y-1 flex flex-col justify-between"
              style={{
                background: 'rgba(85,154,154,0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                transform: 'translateZ(20px)'
              }}
            >
              <h4 className="font-medium text-amber-400 pb-0 mb-0.5 text-xs sm:text-sm"
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}
              >Housekeeping</h4>
              <ul className="grid grid-cols-4 gap-0 sm:gap-2 py-0.5 sm:py-2">
                {housekeepingIcons.map(i => (
                  <li key={i.iconName}><IconWithTooltip iconName={i.iconName} tooltip={i.tooltip} /></li>
                ))}
              </ul>
            </div>
            {/* Guest Feedbacks */}
            <div className="p-0.5 py-0 sm:p-2 w-4/5 mx-auto md:w-48 min-h-[38px] h-[45px] sm:min-h-[77px] sm:h-[90px] transition-all duration-250 hover:scale-103 hover:-translate-y-1 flex flex-col justify-between"
              style={{
                background: 'rgba(85,154,154,0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                transform: 'translateZ(20px)'
              }}
            >
              <h4 className="font-medium text-amber-400 pb-0 mb-0.5 text-xs sm:text-sm"
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}
              >Guest Feedbacks</h4>
              <ul className="grid grid-cols-4 gap-0 sm:gap-2 py-0.5 sm:py-2">
                {guestFeedbackIcons.map(i => (
                  <li key={i.iconName}><IconWithTooltip iconName={i.iconName} tooltip={i.tooltip} /></li>
                ))}
              </ul>
            </div>
            {/* Local Souvenir */}
            <div className="p-0.5 py-0 sm:p-2 w-4/5 mx-auto md:w-48 min-h-[38px] h-[45px] sm:min-h-[77px] sm:h-[90px] transition-all duration-250 hover:scale-103 hover:-translate-y-1 flex flex-col justify-between"
              style={{
                background: 'rgba(85,154,154,0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                transform: 'translateZ(20px)'
              }}
            >
              <h4 className="font-medium text-amber-400 pb-0 mb-0.5 text-xs sm:text-sm"
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}
              >Local Souvenir</h4>
              <ul className="grid grid-cols-4 gap-0 sm:gap-2 py-0.5 sm:py-2">
                {localSouvenirIcons.map(i => (
                  <li key={i.iconName}><IconWithTooltip iconName={i.iconName} tooltip={i.tooltip} /></li>
                ))}
              </ul>
            </div>
          </div>
          {/* Hàng dưới: Tours, Bus Tickets, Vehicle Rental */}
          <div className="flex flex-col md:flex-row justify-center gap-3 mb-3 w-full">
            {/* Tours */}
            <div className="p-0.5 py-0 sm:p-2 w-4/5 mx-auto md:w-64 min-h-[38px] h-[45px] sm:min-h-[77px] sm:h-[90px] transition-all duration-250 hover:scale-103 hover:-translate-y-1 flex flex-col justify-between"
              style={{
                background: 'rgba(85,154,154,0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                transform: 'translateZ(20px)'
              }}
            >
              <h4 className="font-medium text-amber-400 pb-0 mb-0.5 text-xs sm:text-sm"
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}
              >Tours</h4>
              <ul className="grid grid-cols-4 gap-0 sm:gap-2 py-0.5 sm:py-2">
                {toursIcons.map(i => (
                  <li key={i.iconName}><IconWithTooltip iconName={i.iconName} tooltip={i.tooltip} /></li>
                ))}
              </ul>
            </div>
            {/* Bus Tickets */}
            <div className="p-0.5 py-0 sm:p-2 w-4/5 mx-auto md:w-[560px] min-h-[38px] h-[45px] sm:min-h-[77px] sm:h-[90px] transition-all duration-250 hover:scale-103 hover:-translate-y-1 flex flex-col justify-between"
                style={{ 
                background: 'rgba(85,154,154,0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                transform: 'translateZ(20px)'
              }}
            >
              <h4 className="font-medium text-amber-400 pb-0 mb-0.5 text-xs sm:text-sm"
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}
              >Bus Tickets</h4>
              <ul className="flex flex-row flex-nowrap gap-4 py-0.5 sm:py-2 justify-center items-center">
                {busTicketsIcons.map(i => (
                  <li key={i.iconName}><IconWithTooltip iconName={i.iconName} tooltip={i.tooltip} /></li>
                ))}
              </ul>
            </div>
            {/* Vehicle Rental */}
            <div className="p-0.5 py-0 sm:p-2 w-4/5 mx-auto md:w-64 min-h-[38px] h-[45px] sm:min-h-[77px] sm:h-[90px] transition-all duration-250 hover:scale-103 hover:-translate-y-1 flex flex-col justify-between"
              style={{
                background: 'rgba(85,154,154,0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                transform: 'translateZ(20px)'
              }}
            >
              <h4 className="font-medium text-amber-400 pb-0 mb-0.5 text-xs sm:text-sm"
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}
              >Vehicle Rental</h4>
              <ul className="grid grid-cols-3 gap-0 sm:gap-2 py-0.5 sm:py-2">
                {vehicleRentalIcons.map(i => (
                  <li key={i.iconName}><IconWithTooltip iconName={i.iconName} tooltip={i.tooltip} /></li>
                ))}
              </ul>
            </div>
          </div>
          {/* Hàng dưới: Currency Exchange, Laundry Service, HomeStay */}
          <div className="flex flex-col md:flex-row justify-center gap-3 w-full mb-8">
            {/* Currency Exchange */}
            <div className="p-0.5 py-0 sm:p-2 w-4/5 mx-auto md:w-64 mb-2 sm:mb-0 min-h-[38px] h-[45px] sm:min-h-[77px] sm:h-[90px] transition-all duration-250 hover:scale-103 hover:-translate-y-1 flex flex-col justify-between"
              style={{
                background: 'rgba(85,154,154,0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                transform: 'translateZ(20px)'
              }}
            >
              <h4 className="font-medium text-amber-400 pb-0 mb-0.5 text-xs sm:text-sm"
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}
              >Currency Exchange</h4>
              <ul className="grid grid-cols-5 gap-0 sm:gap-2 py-0.5 sm:py-2">
                {currencyIcons.map(i => (
                  <li key={i.iconName}><IconWithTooltip iconName={i.iconName} tooltip={i.tooltip} /></li>
                ))}
              </ul>
            </div>
            {/* Laundry Service */}
            <div className="p-0.5 py-0 sm:p-2 w-4/5 mx-auto md:w-64 mb-2 sm:mb-0 min-h-[38px] h-[45px] sm:min-h-[77px] sm:h-[90px] transition-all duration-250 hover:scale-103 hover:-translate-y-1 flex flex-col justify-between"
              style={{
                background: 'rgba(85,154,154,0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                transform: 'translateZ(20px)'
              }}
            >
              <h4 className="font-medium text-amber-400 pb-0 mb-0.5 text-xs sm:text-sm"
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}
              >Laundry Service</h4>
              <ul className="grid grid-cols-5 gap-0 sm:gap-2 py-0.5 sm:py-2">
                {laundryIcons.map(i => (
                  <li key={i.iconName}><IconWithTooltip iconName={i.iconName} tooltip={i.tooltip} /></li>
                ))}
              </ul>
            </div>
            {/* HomeStay */}
            <div className="p-0.5 py-0 sm:p-2 w-4/5 mx-auto md:w-64 mb-4 sm:mb-0 min-h-[38px] h-[45px] sm:min-h-[77px] sm:h-[90px] transition-all duration-250 hover:scale-103 hover:-translate-y-1 flex flex-col justify-between"
              style={{
                background: 'rgba(85,154,154,0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                boxShadow: '0px 10px 25px rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.18)',
                transform: 'translateZ(20px)'
              }}
            >
              <h4 className="font-medium text-amber-400 pb-0 mb-0.5 text-xs sm:text-sm"
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }}
              >HomeStay</h4>
              <ul className="grid grid-cols-5 gap-0 sm:gap-2 py-0.5 sm:py-2">
                {homestayIcons.map(i => (
                  <li key={i.iconName}><IconWithTooltip iconName={i.iconName} tooltip={i.tooltip} /></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {/* Active orders status panels - thêm hiệu ứng 3D và đường viền sáng */}
        {showOrderCard && activeOrders && activeOrders.length > 0 && (
          <div className="flex flex-col items-center gap-y-4 mb-20 pb-16 w-full px-2 sm:mb-12 sm:pb-8 sm:flex-row sm:flex-nowrap sm:gap-x-4 sm:overflow-x-auto sm:justify-start mt-4">
            {[...activeOrders].sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime()).map((o: ActiveOrder) => {
              const deadline = new Date(o.requestedAt.getTime() + 60 * 60 * 1000);
              const diffSec = Math.max(Math.ceil((deadline.getTime() - now.getTime()) / 1000), 0);
              if (diffSec <= 0) return null;
              const mins = Math.floor(diffSec / 60).toString().padStart(2, '0');
              const secs = (diffSec % 60).toString().padStart(2, '0');
              return (
                <div key={o.reference} 
                  className="p-2 sm:p-3 text-gray-800 max-w-xs w-[220px] flex-shrink-0 transition-all duration-250 hover:rotate-1 hover:scale-105"
                  style={{
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '24px',
                    boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    transform: 'translateZ(20px)',
                    transformStyle: 'preserve-3d',
                    zIndex: 20,
                    marginBottom: '8px',
                    transition: 'all 0.3s ease-in-out'
                  }}
                >
                  {/* Đồng hồ đếm ngược ở trên đầu */}
                  <div className="flex justify-center items-center mb-1.5">
                    <span className="font-bold text-lg text-blue-800 bg-blue-50 px-4 py-1.5 rounded-full shadow-sm" 
                      style={{
                        borderRadius: '16px',
                        boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    >{`${mins}:${secs}`}</span>
                  </div>
                  
                  <p className="text-xs sm:text-sm mb-0.5 px-1.5"><strong>{t('order_ref', language)}:</strong> {o.reference}</p>
                  <p className="text-xs sm:text-sm mb-0.5 px-1.5"><strong>{t('requested_at', language)}:</strong> {o.requestedAt.toLocaleString('en-US', {timeZone: 'Asia/Ho_Chi_Minh', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'})}</p>
                  <p className="text-xs sm:text-sm mb-0.5 px-1.5"><strong>{t('estimated_completion', language)}:</strong> {o.estimatedTime}</p>
                  
                  {/* Thêm trạng thái - hiển thị theo ngôn ngữ đã chọn */}
                  <div className="mt-2 flex justify-center">
                    {(() => {
                      const style = getStatusStyle(o.status);
                      // Log để debug
                      console.log('Order status:', o.status, '->', getStatusTranslationKey(o.status));
                      return (
                        <span className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold ${style.bg} ${style.text} w-full text-center shadow-md border border-white/60`}
                          style={{
                            borderRadius: '16px',
                            boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.12)',
                            transition: 'all 0.2s ease',
                            letterSpacing: 0.2
                          }}
                        >
                          <span className="material-icons text-base mr-1" style={{marginTop: -2}}>{style.icon}</span>
                          {t(getStatusTranslationKey(o.status), language)}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Popup Generating */}
      {showGeneratingPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="relative bg-white/90 rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full mx-4">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="material-icons text-blue-600 text-3xl sm:text-4xl animate-spin">sync</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-blue-900 text-center">{t('generating_summary', language)}</h3>
              <p className="text-gray-600 text-sm sm:text-base text-center">{t('generating_summary_desc', language)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Popup summary Interface3 */}
      {showSummaryPopup && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="relative w-full h-full flex items-start sm:items-center justify-center">
            <button
              className="absolute top-2 right-2 z-10 p-2 bg-white/80 rounded-full shadow hover:bg-white"
              onClick={() => setShowSummaryPopup(false)}
              title="Đóng summary"
            >
              <span className="material-icons text-gray-600">close</span>
            </button>
            <div className="w-full max-w-4xl flex justify-center pt-50 sm:pt-0">
              <div className="w-full max-h-screen overflow-y-auto">
                <Interface3 isActive={true} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interface1;
