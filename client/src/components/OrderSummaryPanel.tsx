import React, { useEffect, useState } from 'react';
import { useAssistant } from '@/context/AssistantContext';
import { ServiceRequest } from '@/types';
import hotelImage from '../assets/hotel-exterior.jpeg';
import InfographicSteps from './InfographicSteps';
import { parseSummaryToOrderDetails, extractRoomNumber } from '@/lib/summaryParser';
import { t } from '@/i18n';
import { Button } from './ui/button';

const OrderSummaryPanel: React.FC = () => {
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

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    if (!orderSummary) return;
    setOrderSummary({
      ...orderSummary,
      [field]: value
    });
  };

  // Handle item removal
  const handleRemoveItem = (itemId: string) => {
    if (!orderSummary) return;
    const updatedItems = orderSummary.items.filter(item => item.id !== itemId);
    const newTotalAmount = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setOrderSummary({
      ...orderSummary,
      items: updatedItems,
      totalAmount: newTotalAmount
    });
  };

  // Group service requests by type for better organization
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
          return {
            id: `item-${index}`,
            name: request.serviceType,
            description: request.requestText,
            quantity,
            price
          };
        });
        setOrderSummary({
          ...orderSummary,
          items: newItems,
          totalAmount: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        });
      }
    }
  }, [serviceRequests, orderSummary, setOrderSummary]);

  // useEffect phân tích callSummary thành orderSummary (không phụ thuộc vào isActive)
  useEffect(() => {
    if (callSummary && callSummary.content) {
      const parsed = parseSummaryToOrderDetails(callSummary.content);
      setOrderSummary({
        orderType: parsed.orderType || '',
        deliveryTime: parsed.deliveryTime || 'asap',
        roomNumber: parsed.roomNumber || '',
        guestName: parsed.guestName || '',
        guestEmail: parsed.guestEmail || '',
        guestPhone: parsed.guestPhone || '',
        specialInstructions: parsed.specialInstructions || '',
        items: parsed.items || [],
        totalAmount: parsed.totalAmount || 0
      });
    }
  }, [callSummary, setOrderSummary]);

  // Handle confirm order
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
    setOrder({
      reference: orderReference,
      estimatedTime: estimatedDisplayTime,
      summary: orderSummary
    });
    addActiveOrder({
      reference: orderReference,
      requestedAt: new Date(),
      estimatedTime: estimatedDisplayTime,
      status: 'Đã ghi nhận'
    });
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
        const formattedDuration = callDuration ? 
          `${Math.floor(callDuration / 60)}:${(callDuration % 60).toString().padStart(2, '0')}` : 
          '0:00';
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
            const response = await fetch(requestUrl, {
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
            if (!response.ok) {
              throw new Error(`Server responded with status: ${response.status}`);
            }
            await response.json();
            setEmailSentForCurrentSession(true);
          } catch (innerError) {}
        }, isMobile ? 50 : 500);
      } catch (error) {}
    }
    setCurrentInterface('interface4');
  };

  // Function to add note to the displayed summary
  const handleAddNote = () => {
    if (!note.trim() || !callSummary) return;
    setCallSummary({
      ...callSummary,
      content: `${callSummary.content}\n\nAdditional Notes:\n${note}`
    });
  };

  // Nếu chưa có dữ liệu AI, hiển thị thông báo thay vì panel rỗng
  if (!orderSummary || !orderSummary.items || orderSummary.items.length === 0) {
    return <div className="text-center text-gray-500 p-8">Chưa có dữ liệu tổng hợp từ AI</div>;
  }

  return (
    <div className="w-full max-w-4xl bg-white/90 rounded-2xl shadow-xl p-3 sm:p-6 md:p-10 mb-4 sm:mb-6 flex-grow border border-white/40 backdrop-blur-md" style={{minHeight: 420}}>
      {/* ... UI của Interface3 ... */}
    </div>
  );
};

export default OrderSummaryPanel; 