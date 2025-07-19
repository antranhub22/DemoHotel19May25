import { useCallback, useState } from 'react';
import { useAssistant } from '@/context/AssistantContext';

interface UseSendToFrontDeskHandlerProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseSendToFrontDeskHandlerReturn {
  handleSendToFrontDesk: () => void;
  isSubmitting: boolean;
}

/**
 * useSendToFrontDeskHandler - Dedicated handler for Send to FrontDesk functionality
 * 
 * Handles the complete order submission flow:
 * 1. Extract and validate order data from call summary
 * 2. Generate order with proper fallbacks
 * 3. Submit to /api/orders endpoint
 * 4. Update order state and handle success/error cases
 * 
 * @param props - Configuration options for success/error callbacks
 * @returns handleSendToFrontDesk function and loading state
 */
export const useSendToFrontDeskHandler = ({
  onSuccess,
  onError
}: UseSendToFrontDeskHandlerProps = {}): UseSendToFrontDeskHandlerReturn => {
  const { callSummary, serviceRequests, orderSummary, setOrder } = useAssistant();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendToFrontDesk = useCallback(async () => {
    console.log('🏨 [useSendToFrontDeskHandler] Send to FrontDesk clicked');
    
    // Use orderSummary if available, otherwise generate from summary data
    let currentOrderSummary = orderSummary;
    
    // If no orderSummary, try to generate from callSummary or serviceRequests
    if (!currentOrderSummary && (callSummary || serviceRequests?.length > 0)) {
      currentOrderSummary = {
        orderType: 'Room Service',
        deliveryTime: 'asap',
        roomNumber: '',
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        specialInstructions: '',
        items: serviceRequests?.map((req, index) => ({
          id: (index + 1).toString(),
          name: req.serviceType || 'General Service',
          description: req.requestText || 'No details provided',
          quantity: 1,
          price: 0
        })) || [
          {
            id: '1',
            name: 'General Service',
            description: 'Generated from call summary',
            quantity: 1,
            price: 0
          }
        ],
        totalAmount: 0
      };
    }
    
    if (!currentOrderSummary) {
      const errorMsg = 'No order information available to send!';
      console.warn('⚠️ [useSendToFrontDeskHandler] No order summary available');
      
      if (onError) {
        onError(errorMsg);
      } else {
        alert(errorMsg);
      }
      return;
    }

    setIsSubmitting(true);
    
    try {
      // ✅ IDENTICAL LOGIC from Interface3 handleConfirmOrder
      const getValidRoomNumber = () => {
        if (currentOrderSummary.roomNumber && currentOrderSummary.roomNumber !== 'unknown') 
          return currentOrderSummary.roomNumber;
        // Try to extract from callSummary if available
        if (callSummary && callSummary.content) {
          const match = callSummary.content.match(/Room Number:?\s*(\w+)/i);
          if (match && match[1]) return match[1];
        }
        return 'unknown';
      };
      
      const validItems = (currentOrderSummary.items && currentOrderSummary.items.length > 0)
        ? currentOrderSummary.items
        : [
            {
              id: '1',
              name: 'General Service',
              description: 'No details provided',
              quantity: 1,
              price: 0
            }
          ];
      
      const validOrderType = currentOrderSummary.orderType || 'Room Service';
      const validDeliveryTime = currentOrderSummary.deliveryTime || 'asap';
      const orderReference = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
      const now = new Date();
      
      const newOrder = {
        callId: orderReference,
        roomNumber: getValidRoomNumber(),
        orderType: validOrderType,
        deliveryTime: validDeliveryTime,
        specialInstructions: orderReference,
        items: validItems,
        totalAmount: currentOrderSummary.totalAmount || 0,
        status: 'pending',
        createdAt: now.toISOString()
      };
      
      console.log('📤 [useSendToFrontDeskHandler] Submitting order to /api/request:', newOrder);
      
      // ✅ UPDATED: Use /api/request endpoint (unified schema)
      const res = await fetch(`/api/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      
      if (!res.ok) throw new Error('Failed to create request');
      
      const response = await res.json();
      
      // ✅ UPDATED: Handle response from /api/request endpoint
      if (!response.success) {
        throw new Error(response.error || 'Failed to create request');
      }
      
      // ✅ UPDATED: Use response data from /api/request
      const requestData = response.data;
      
      setOrder({
        reference: requestData.reference || requestData.orderId,
        estimatedTime: requestData.estimatedTime || validDeliveryTime,
        summary: currentOrderSummary
      });
      
      console.log('✅ [useSendToFrontDeskHandler] Request sent to Front Desk successfully');
      
      if (onSuccess) {
        onSuccess();
      } else {
        alert('✅ Request sent to Front Desk successfully!');
      }
      
    } catch (err) {
      const errorMsg = 'Failed to send request to Front Desk!';
      console.error('❌ [useSendToFrontDeskHandler] Failed to send request:', err);
      
      if (onError) {
        onError(errorMsg);
      } else {
        alert(`❌ ${errorMsg}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [callSummary, serviceRequests, orderSummary, setOrder, onSuccess, onError]);

  return {
    handleSendToFrontDesk,
    isSubmitting
  };
}; 