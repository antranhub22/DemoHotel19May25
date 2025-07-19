import { useCallback, useState, useMemo } from 'react';
import { useAssistant } from '@/context/AssistantContext';

// ✅ CONSTANTS - Moved to top level
const CONSTANTS = {
  ORDER_TYPE_DEFAULT: 'Room Service',
  DELIVERY_TIME_DEFAULT: 'asap',
  SERVICE_NAME_DEFAULT: 'General Service',
  ROOM_NUMBER_FALLBACK: 'unknown',
  ORDER_PREFIX: 'ORD',
  ORDER_MIN: 10000,
  ORDER_RANGE: 90000,
  STATUS_PENDING: 'pending'
} as const;

const ERROR_MESSAGES = {
  NO_ORDER_DATA: 'No order information available to send!',
  REQUEST_FAILED: 'Failed to send request to Front Desk!',
  NETWORK_ERROR: 'Network error occurred while sending request',
  SERVER_ERROR: 'Server error occurred while processing request'
} as const;

const SUCCESS_MESSAGES = {
  REQUEST_SENT: '✅ Request sent to Front Desk successfully!'
} as const;

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
 * Handles the complete request submission flow:
 * 1. Extract and validate order data from call summary
 * 2. Generate request with proper fallbacks
 * 3. Submit to /api/request endpoint (unified schema)
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

  // ✅ MEMOIZED: Default item template to prevent recreation
  const defaultServiceItem = useMemo(() => ({
    id: '1',
    name: CONSTANTS.SERVICE_NAME_DEFAULT,
    description: 'Service request from voice call',
    quantity: 1,
    price: 0
  }), []);

  // ✅ MEMOIZED: Generated order summary from context data
  const generatedOrderSummary = useMemo(() => {
    if (orderSummary) return orderSummary;
    
    if (!callSummary && (!serviceRequests || serviceRequests.length === 0)) {
      return null;
    }

    return {
      orderType: CONSTANTS.ORDER_TYPE_DEFAULT,
      deliveryTime: CONSTANTS.DELIVERY_TIME_DEFAULT,
      roomNumber: '',
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      specialInstructions: '',
      items: serviceRequests?.map((req, index) => ({
        id: (index + 1).toString(),
        name: req.serviceType || CONSTANTS.SERVICE_NAME_DEFAULT,
        description: req.requestText || 'No details provided',
        quantity: 1,
        price: 0
      })) || [defaultServiceItem],
      totalAmount: 0
    };
  }, [orderSummary, callSummary, serviceRequests, defaultServiceItem]);

  // ✅ EXTRACTED: Room number extraction logic
  const extractRoomNumber = useCallback((orderData: any, callContent?: string): string => {
    // Priority 1: Direct value from order data
    if (orderData?.roomNumber && orderData.roomNumber !== CONSTANTS.ROOM_NUMBER_FALLBACK) {
      return orderData.roomNumber;
    }
    
    // Priority 2: Extract from call summary using regex
    if (callContent) {
      const roomNumberPattern = /Room Number:?\s*(\w+)/i;
      const match = callContent.match(roomNumberPattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // Priority 3: Fallback
    return CONSTANTS.ROOM_NUMBER_FALLBACK;
  }, []);

  // ✅ EXTRACTED: Order reference generation
  const generateOrderReference = useCallback((): string => {
    const randomNumber = Math.floor(CONSTANTS.ORDER_MIN + Math.random() * CONSTANTS.ORDER_RANGE);
    return `${CONSTANTS.ORDER_PREFIX}-${randomNumber}`;
  }, []);

  // ✅ EXTRACTED: Request payload builder
  const buildRequestPayload = useCallback((orderData: any) => {
    const orderReference = generateOrderReference();
    const validItems = (orderData.items && orderData.items.length > 0)
      ? orderData.items
      : [defaultServiceItem];

    return {
      callId: orderReference,
      roomNumber: extractRoomNumber(orderData, callSummary?.content),
      orderType: orderData.orderType || CONSTANTS.ORDER_TYPE_DEFAULT,
      deliveryTime: orderData.deliveryTime || CONSTANTS.DELIVERY_TIME_DEFAULT,
      specialInstructions: orderReference,
      items: validItems,
      totalAmount: orderData.totalAmount || 0,
      status: CONSTANTS.STATUS_PENDING,
      createdAt: new Date().toISOString()
    };
  }, [extractRoomNumber, generateOrderReference, defaultServiceItem, callSummary?.content]);

  // ✅ EXTRACTED: API call logic
  const submitRequest = useCallback(async (payload: any) => {
    console.log('📤 [useSendToFrontDeskHandler] Submitting request to /api/request:', payload);
    
    const response = await fetch('/api/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const status = response.status;
      if (status >= 500) {
        throw new Error(ERROR_MESSAGES.SERVER_ERROR);
      } else if (status >= 400) {
        throw new Error(ERROR_MESSAGES.REQUEST_FAILED);
      } else {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || ERROR_MESSAGES.REQUEST_FAILED);
    }

    return result.data;
  }, []);

  // ✅ EXTRACTED: Success handling
  const handleSuccess = useCallback((requestData: any, orderData: any) => {
    console.log('✅ [useSendToFrontDeskHandler] Request sent to Front Desk successfully');
    
    // Update global order state
    setOrder({
      reference: requestData.reference || requestData.orderId,
      estimatedTime: requestData.estimatedTime || orderData.deliveryTime || CONSTANTS.DELIVERY_TIME_DEFAULT,
      summary: orderData
    });

    // Execute callback or show default feedback
    if (onSuccess) {
      onSuccess();
    } else {
      // Consider replacing with toast notification in production
      alert(SUCCESS_MESSAGES.REQUEST_SENT);
    }
  }, [setOrder, onSuccess]);

  // ✅ EXTRACTED: Error handling
  const handleError = useCallback((error: Error) => {
    console.error('❌ [useSendToFrontDeskHandler] Failed to send request:', error);
    
    const errorMessage = error.message || ERROR_MESSAGES.REQUEST_FAILED;
    
    if (onError) {
      onError(errorMessage);
    } else {
      // Consider replacing with toast notification in production
      alert(`❌ ${errorMessage}`);
    }
  }, [onError]);

  // ✅ MAIN HANDLER: Clean and focused
  const handleSendToFrontDesk = useCallback(async () => {
    console.log('🏨 [useSendToFrontDeskHandler] Send to FrontDesk initiated');
    
    // Validate order data availability
    if (!generatedOrderSummary) {
      console.warn('⚠️ [useSendToFrontDeskHandler] No order summary available');
      const errorMsg = ERROR_MESSAGES.NO_ORDER_DATA;
      
      if (onError) {
        onError(errorMsg);
      } else {
        alert(errorMsg);
      }
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Build and submit request
      const requestPayload = buildRequestPayload(generatedOrderSummary);
      const requestData = await submitRequest(requestPayload);
      
      // Handle success
      handleSuccess(requestData, generatedOrderSummary);
      
    } catch (error) {
      // Handle error
      handleError(error as Error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    generatedOrderSummary,
    buildRequestPayload,
    submitRequest,
    handleSuccess,
    handleError,
    onError
  ]);

  return {
    handleSendToFrontDesk,
    isSubmitting
  };
}; 