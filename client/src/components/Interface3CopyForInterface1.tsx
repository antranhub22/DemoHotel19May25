// File này được tạo từ Interface3 để sử dụng lại toàn bộ UI và logic cho Interface1
import React, { useEffect, useState } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { ServiceRequest } from '@/types';
import hotelImage from '../assets/hotel-exterior.jpeg';
import InfographicSteps from './InfographicSteps';
import { parseSummaryToOrderDetails, extractRoomNumber } from '@/lib/summaryParser';
import { t } from '@/i18n';
import { Button } from './ui/button';

interface Interface3CopyForInterface1Props {
  isActive: boolean;
}

const Interface3CopyForInterface1: React.FC<Interface3CopyForInterface1Props> = ({ isActive }) => {
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
  const handleInputChange = (field: string, value: string) => {
    if (!orderSummary) return;
    setOrderSummary({ ...orderSummary, [field]: value });
  };
  const handleRemoveItem = (itemId: string) => {
    if (!orderSummary) return;
    const updatedItems = orderSummary.items.filter(item => item.id !== itemId);
    const newTotalAmount = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setOrderSummary({ ...orderSummary, items: updatedItems, totalAmount: newTotalAmount });
  };
  useEffect(() => {
    if (serviceRequests && serviceRequests.length > 0) {
      const grouped = serviceRequests.reduce((acc, request) => {
        const type = request.serviceType;
        if (!acc[type]) acc[type] = [];
        acc[type].push(request);
        return acc;
      }, {} as Record<string, ServiceRequest[]>);
      setGroupedRequests(grouped);
      if (orderSummary && (!orderSummary.items || orderSummary.items.length === 0)) {
        const newItems = serviceRequests.map((request, index) => {
          let quantity = 1;
          const details = request.details || {};
          const quantityMatch = request.requestText.match(/(\d+)\s+(towels|bottles|pieces|cups|glasses|plates|servings|items)/i);
          if (quantityMatch) {
            quantity = parseInt(quantityMatch[1]);
          } else if (typeof details.people === 'number') {
            quantity = details.people;
          }
          let price = 10;
          if (request.serviceType === 'room-service') price = 15;
          else if (request.serviceType === 'housekeeping') price = 8;
          else if (request.serviceType === 'transportation') price = 25;
          else if (request.serviceType === 'tours-activities') price = 35;
          else if (request.serviceType === 'spa') price = 30;
          return { id: `item-${index}`, name: request.serviceType, description: request.requestText, quantity, price };
        });
        setOrderSummary({ ...orderSummary, items: newItems, totalAmount: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) });
      }
    }
  }, [serviceRequests, orderSummary, setOrderSummary]);
  const getServiceName = (serviceType: string): string => {
    const typeMap: Record<string, string> = {
      'room-service': t('room_service', language),
      'housekeeping': t('housekeeping', language),
      'wake-up': t('wake_up_call', language),
      'amenities': t('additional_amenities', language),
      'restaurant': t('restaurant_reservation', language),
      'spa': t('spa_appointment', language),
      'transportation': t('transportation', language),
      'attractions': t('local_attractions', language),
      'tours-activities': t('tours_activities', language),
      'technical-support': t('technical_support', language),
      'concierge': t('concierge_services', language),
      'wellness-fitness': t('wellness_fitness', language),
      'security': t('security_assistance', language),
      'special-occasions': t('special_occasion', language),
      'other': t('other_service', language)
    };
    return typeMap[serviceType] || serviceType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  useEffect(() => {
    if (isActive && callSummary && orderSummary) {
      const content = callSummary.content;
      const detectedRoomNumber = extractRoomNumber(content);
      if (detectedRoomNumber && detectedRoomNumber !== orderSummary.roomNumber) {
        setOrderSummary({ ...orderSummary, roomNumber: detectedRoomNumber });
      }
      if (!serviceRequests || serviceRequests.length === 0) {
        const requestsMatch = content.match(/List of Requests:([\s\S]*?)(?:\n\nSpecial Instructions|\n\nThe conversation)/);
        if (requestsMatch) {
          const requestsSection = requestsMatch[1];
          const requestRegex = /Request (\d+): ([^\n]+)/g;
          let match;
          const newItems = [];
          let id = 1;
          while ((match = requestRegex.exec(requestsSection)) !== null) {
            const requestType = match[2].trim();
            const requestIndex = match.index;
            const endIndex = requestsSection.indexOf(`Request ${parseInt(match[1]) + 1}:`, requestIndex);
            const detailsSection = endIndex > -1 ? requestsSection.substring(requestIndex, endIndex) : requestsSection.substring(requestIndex);
            const detailsRegex = /- ([^:]+): ([^\n]+)/g;
            let detailsMatch;
            const details: Record<string, string> = {};
            while ((detailsMatch = detailsRegex.exec(detailsSection)) !== null) {
              const key = detailsMatch[1].trim();
              const value = detailsMatch[2].trim();
              details[key.toLowerCase()] = value;
            }
            let description = '';
            if (details['service description']) {
              description += `${details['service description']}`;
            }
            if (details['details']) {
              description += description ? `. ${details['details']}` : details['details'];
            }
            if (details['items']) {
              description += description ? `\nItems: ${details['items']}` : `Items: ${details['items']}`;
            }
            if (details['service timing requested']) {
              description += `\nTiming: ${details['service timing requested']}`;
            }
            if (details['destinations']) {
              description += `\nDestinations: ${details['destinations']}`;
            }
            if (!description) {
              description = `Requested ${requestType} service`;
            }
            newItems.push({ id: id.toString(), name: requestType, description: description, quantity: 1, price: 10 });
            id++;
          }
          if (newItems.length > 0 && (!orderSummary.items || orderSummary.items.length === 0)) {
            const serviceTypes = newItems.map(item => item.name.toLowerCase().replace(/\s+/g, '-')).join(',');
            const roomNumber = extractRoomNumber(content) || orderSummary.roomNumber;
            const timingMatch = content.match(/Service Timing Requested:?\s*([^\n]+)/i);
            const timing = timingMatch ? timingMatch[1] : orderSummary.deliveryTime;
            let deliveryTime = orderSummary.deliveryTime;
            if (timing) {
              if (/soon|immediate|urgent|right now/i.test(timing)) {
                deliveryTime = 'asap';
              } else if (/30 minute|half hour/i.test(timing)) {
                deliveryTime = '30min';
              } else if (/hour|60 minute/i.test(timing)) {
                deliveryTime = '1hour';
              } else if (/schedule|later|specific/i.test(timing)) {
                deliveryTime = 'specific';
              }
            }
            setOrderSummary({ ...orderSummary, items: newItems, orderType: serviceTypes, roomNumber: roomNumber, deliveryTime: deliveryTime, totalAmount: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) });
          }
        }
      }
    }
  }, [isActive, callSummary, orderSummary, setOrderSummary]);
  const handleConfirmOrder = async () => {
    if (!orderSummary) return;
    const orderReference = `#ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    let estimatedDisplayTime: string;
    switch (orderSummary.deliveryTime) {
      case 'asap':
        estimatedDisplayTime = 'As soon as possible';
        break;
      case '30min':
        estimatedDisplayTime = '30 minutes';
        break;
      case '1hour':
        estimatedDisplayTime = '1 hour';
        break;
      default:
        estimatedDisplayTime = orderSummary.deliveryTime || '15-20 minutes';
    }
    setOrder({ reference: orderReference, estimatedTime: estimatedDisplayTime, summary: orderSummary });
    addActiveOrder({ reference: orderReference, requestedAt: new Date(), estimatedTime: estimatedDisplayTime, status: 'Đã ghi nhận' });
    if (emailSentForCurrentSession) {
      setCurrentInterface('interface4');
      return;
    }
    const isVietnameseActive = document.querySelector('[data-interface="interface3vi"]')?.getAttribute('data-active') === 'true';
    if (!isVietnameseActive) {
      try {
        let summaryForEmail = callSummary?.content || '';
        try {
          summaryForEmail = await translateToVietnamese(summaryForEmail);
        } catch (e) {}
        const formattedDuration = callDuration ? `${Math.floor(callDuration / 60)}:${(callDuration % 60).toString().padStart(2, '0')}` : '0:00';
        const generatedCallId = `call-${Date.now()}`;
        const currentCallId = callDetails?.id || generatedCallId;
        const emailPayload = {
          toEmail: 'tuans2@gmail.com',
          callDetails: {
            callId: currentCallId,
            roomNumber: orderSummary.roomNumber || 'unknown',
            summary: summaryForEmail || 'No summary available',
            timestamp: callSummary?.timestamp || new Date(),
            duration: formattedDuration,
            serviceRequests: orderSummary.items.map(item => item.name),
            orderReference: orderReference,
            note: note
          }
        };
        const isMobile = /iPhone|iPad|iPod|Android|Mobile|webOS|BlackBerry/i.test(navigator.userAgent);
        setTimeout(async () => {
          try {
            const endpoint = isMobile ? '/api/mobile-call-summary-email' : '/api/send-call-summary-email';
            const requestUrl = isMobile ? `${endpoint}?_=${Date.now()}` : endpoint;
            await fetch(requestUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'X-Device-Type': isMobile ? 'mobile' : 'desktop'
              },
              body: JSON.stringify(emailPayload),
              cache: 'no-cache',
              credentials: 'same-origin',
            });
            setEmailSentForCurrentSession(true);
          } catch (innerError) {}
        }, isMobile ? 50 : 500);
      } catch (error) {}
    }
    setCurrentInterface('interface4');
  };
  const handleAddNote = () => {
    if (!note.trim() || !callSummary) return;
    setCallSummary({ ...callSummary, content: `${callSummary.content}\n\nAdditional Notes:\n${note}` });
  };
  if (!orderSummary) return null;
  return (
    <div className={`absolute w-full min-h-screen h-full transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'} z-30 overflow-y-auto`} id="interface3" style={{backgroundImage: `linear-gradient(rgba(85,154,154,0.7), rgba(121, 219, 220, 0.6)), url(${hotelImage})`,backgroundSize: 'cover',backgroundPosition: 'center',fontFamily: 'SF Pro Text, Roboto, Open Sans, Arial, sans-serif'}}>
      <div className="container mx-auto flex flex-col p-2 sm:p-4 md:p-8">
        <div className="mx-auto w-full max-w-4xl bg-white/90 rounded-2xl shadow-xl p-3 sm:p-6 md:p-10 mb-4 sm:mb-6 flex-grow border border-white/40 backdrop-blur-md" style={{minHeight: 420}}>
          <div className="mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-gray-200">
            <p className="font-poppins font-bold text-xl sm:text-2xl text-blue-900 tracking-wide">{t('order_summary', language)}</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 sm:gap-10 md:gap-16">
            {/* Left column: summary, notes, room number */}
            <div className="md:w-3/4 w-full space-y-3 sm:space-y-4">
              {/* Mobile: Cancel và Send to Reception lên trên cùng */}
              <div className="flex sm:hidden flex-row w-full gap-2 mb-2">
                <button className="flex-1 flex items-center justify-center px-2 py-1.5 bg-white/80 hover:bg-blue-100 text-blue-900 rounded-full text-xs font-semibold border border-white/30 shadow transition-colors" onClick={() => setCurrentInterface('interface1')}>
                  <span className="material-icons text-base mr-1">cancel</span>{t('cancel', language)}
                </button>
                <Button
                  onClick={handleConfirmOrder}
                  variant="yellow"
                  className="flex-1 flex items-center justify-center space-x-2 text-xs font-bold sm:hidden"
                  style={{ minHeight: 44, minWidth: 120, zIndex: 10 }}
                >
                  <span className="material-icons">send</span>
                  <span className="whitespace-nowrap">{t('send_to_reception', language)}</span>
                </Button>
              </div>
              {/* Mobile: Add Note, Room, Vietnamese, textarea lên trên summary */}
              <div className="flex flex-col gap-2 mb-2 sm:hidden">
                <div className="flex flex-row w-full gap-2">
                  <button className="h-10 px-3 bg-[#ffe082] hover:bg-[#ffe9b3] text-blue-900 rounded-full text-xs font-semibold shadow transition-colors flex-1" onClick={handleAddNote} disabled={!note.trim()}>{t('add_note', language)}</button>
                  <div className="flex items-center space-x-2 w-full justify-center">
                    <label className="text-xs text-gray-600 font-medium">{t('room_number', language)}</label>
                    <input type="text" placeholder={t('enter_room_number', language)} className="w-16 p-2 border border-white/30 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] bg-white/70 text-gray-900 font-semibold text-xs" value={orderSummary.roomNumber} onChange={(e) => handleInputChange('roomNumber', e.target.value)} />
                  </div>
                  <button className="h-10 px-3 bg-white/70 text-blue-900 rounded-full text-xs font-semibold border border-white/30 shadow flex items-center justify-center" onClick={() => setCurrentInterface('interface3vi')}>
                    <span className="material-icons text-base">language</span>
                  </button>
                </div>
                <textarea placeholder={t('enter_notes', language)} className="w-full p-2 border border-white/30 rounded-xl text-xs bg-white/60 focus:bg-white/90 focus:ring-2 focus:ring-[#d4af37] transition italic font-light text-gray-500" value={note} onChange={(e) => setNote(e.target.value)} rows={3} style={{fontFamily:'inherit'}} />
              </div>
              {/* AI-generated Call Summary Container */}
              {callSummary && (
                <div id="summary-container" className="mb-3 sm:mb-4">
                  <div className="p-3 sm:p-5 bg-white/80 rounded-xl shadow border border-white/30 mb-3 sm:mb-4 relative" style={{backdropFilter:'blur(2px)'}}>
                    <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 text-blue-800">{t('summary', language)}</h3>
                    <div className="text-sm sm:text-base leading-relaxed text-gray-800 whitespace-pre-line" style={{fontWeight: 400}}>
                      {/* Custom summary formatting */}
                      {(() => {
                        const lines = (callSummary.content || '').split('\n');
                        // Lọc bỏ dòng Next Step và xử lý Guest's Name
                        return lines.filter(line => !/^Next Step:/i.test(line) && !/Please Press Send To Reception/i.test(line)).map((line, idx) => {
                          // Loại bỏ phần (used for Guest with a confirmed reservation)
                          if (/^Guest's Name/i.test(line)) {
                            const cleaned = line.replace(/\s*\(used for Guest with a confirmed reservation\)/i, '');
                            return <div key={idx}><b>{cleaned}</b></div>;
                          }
                          if (/^Room Number:/i.test(line)) return <div key={idx}><b>{line}</b></div>;
                          if (/^REQUEST \d+:/i.test(line)) return <div key={idx} className="mt-3 mb-1"><b>{line}</b></div>;
                          if (/^• Service Timing:/i.test(line)) return <div key={idx} style={{marginLeft:16}}><b>{line}</b></div>;
                          if (/^• Order Details:/i.test(line)) return <div key={idx} style={{marginLeft:16}}><b>{line}</b></div>;
                          if (/^• Special Requirements:/i.test(line)) return <div key={idx} style={{marginLeft:16}}><b>{line}</b></div>;
                          // Lùi dòng cho nội dung con của Order Details
                          if (/^• [^-].+/.test(line)) return <div key={idx} style={{marginLeft:32}}>{line}</div>;
                          if (/^\s*[-•]/.test(line)) return <div key={idx} style={{marginLeft:32}}>{line}</div>;
                          if (/^\s*$/.test(line)) return <div key={idx} style={{height:8}}></div>;
                          return <div key={idx}>{line}</div>;
                        });
                      })()}
                    </div>
                    <div className="mt-2 sm:mt-3 flex justify-end">
                      <div className="text-xs text-gray-500">
                        {t('generated_at', language)} {new Date(callSummary.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  {/* Ghi chú in nghiêng dưới cùng */}
                  <div className="text-center mt-2 mb-1">
                    <span className="italic text-sm" style={{color:'#2563eb', background:'#e0f2fe', borderRadius: '6px', padding: '4px 12px', display: 'inline-block', fontWeight: 500}}>
                      Please Press <b style={{fontWeight:700, color:'#1d4ed8'}}>Send To Reception</b> To Complete Your Request
                    </span>
                  </div>
                </div>
              )}
              {/* Desktop: Additional Notes, Room Number, and Actions (giữ nguyên) */}
              <div className="hidden sm:flex flex-row items-center gap-2 h-10">
                <button className="h-10 px-3 sm:px-4 bg-[#ffe082] hover:bg-[#ffe9b3] text-blue-900 rounded-full text-xs sm:text-sm font-semibold shadow transition-colors" onClick={handleAddNote} disabled={!note.trim()}>{t('add_note', language)}</button>
                <div className="flex items-center space-x-2 w-full justify-center">
                  <label className="text-xs sm:text-base text-gray-600 font-medium">{t('room_number', language)}</label>
                  <input type="text" placeholder={t('enter_room_number', language)} className="w-16 sm:w-32 p-2 border border-white/30 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] bg-white/70 text-gray-900 font-semibold text-xs sm:text-base" value={orderSummary.roomNumber} onChange={(e) => handleInputChange('roomNumber', e.target.value)} />
                </div>
                <button className="h-10 px-3 sm:px-4 bg-white/70 text-blue-900 rounded-full text-xs sm:text-sm font-semibold border border-white/30 shadow flex items-center justify-center" onClick={() => setCurrentInterface('interface3vi')}>
                  <span className="material-icons text-base">language</span>
                </button>
              </div>
              <textarea placeholder={t('enter_notes', language)} className="hidden sm:block w-full p-2 sm:p-3 border border-white/30 rounded-xl mb-3 sm:mb-4 text-xs sm:text-sm bg-white/60 focus:bg-white/90 focus:ring-2 focus:ring-[#d4af37] transition italic font-light text-gray-500" value={note} onChange={(e) => setNote(e.target.value)} rows={3} style={{fontFamily:'inherit'}} />
            </div>
            {/* Right column: control buttons at top-right (ẩn trên mobile) */}
            <div className="md:w-1/4 w-full hidden sm:flex md:justify-end justify-center">
              <div className="flex flex-col items-end space-y-2 sm:space-y-3 w-full md:w-auto">
                <Button
                  onClick={handleConfirmOrder}
                  variant="yellow"
                  className="w-full md:w-auto flex items-center justify-center space-x-2 text-xs sm:text-sm font-bold"
                  style={{ minHeight: 44, minWidth: 160, zIndex: 10 }}
                >
                  <span className="material-icons">send</span>
                  <span className="whitespace-nowrap">{t('send_to_reception', language)}</span>
                </Button>
                <button className="w-full md:w-auto flex items-center justify-center px-2 sm:px-3 py-1.5 bg-white/80 hover:bg-blue-100 text-blue-900 rounded-full text-xs font-semibold border border-white/30 shadow transition-colors" onClick={() => setCurrentInterface('interface1')}>
                  <span className="material-icons text-base mr-1">cancel</span>{t('cancel', language)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interface3CopyForInterface1; 