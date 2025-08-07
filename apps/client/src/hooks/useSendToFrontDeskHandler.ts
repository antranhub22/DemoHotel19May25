import type { Room } from '@/types/common.types';
import { useAssistant } from '@/context';
import { usePopupContext } from '@/context/PopupContext';
import logger from '../../../../packages/shared/utils/logger';
import { useCallback, useMemo, useState } from 'react';
// ✅ CONSTANTS - Moved to top level
const CONSTANTS = {
  ORDER_TYPE_DEFAULT: 'Room Service',
  DELIVERY_TIME_DEFAULT: 'asap',
  SERVICE_NAME_DEFAULT: 'General Service',
  ROOM_NUMBER_FALLBACK: 'unknown',
  ORDER_PREFIX: 'ORD',
  ORDER_MIN: 10000,
  ORDER_RANGE: 90000,
  STATUS_PENDING: 'pending',
} as const;

const ERROR_MESSAGES = {
  NO_ORDER_DATA: 'No order information available to send!',
  REQUEST_FAILED: 'Failed to send request to Front Desk!',
  NETWORK_ERROR: 'Network error occurred while sending request',
  SERVER_ERROR: 'Server error occurred while processing request',
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
  onError,
}: UseSendToFrontDeskHandlerProps = {}): UseSendToFrontDeskHandlerReturn => {
  const {
    callSummary,
    serviceRequests,
    orderSummary,
    setOrder,
    // ✅ ADD: Reset methods for UI refresh after SendToFrontDesk success
    clearTranscripts,
    clearModelOutput,
    setOrderSummary,
    setCallSummary,
    setServiceRequests,
    setEmailSentForCurrentSession,
    setRequestReceivedAt,
    setVietnameseSummary,
    // ✅ NEW: Recent request state for displaying request card after reset
    setRecentRequest,
  } = useAssistant();

  // ✅ ADD: Popup management for clearing summary popups
  const { clearAllPopups } = usePopupContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ MEMOIZED: Default item template to prevent recreation
  const defaultServiceItem = useMemo(
    () => ({
      id: '1',
      name: CONSTANTS.SERVICE_NAME_DEFAULT,
      description: 'Service request from voice call',
      quantity: 1,
      price: 0,
    }),
    []
  );

  // ✅ MEMOIZED: Generated order summary from context data
  const generatedOrderSummary = useMemo(() => {
    if (orderSummary) {
      return orderSummary;
    }

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
        price: 0,
      })) || [defaultServiceItem],
      totalAmount: 0,
    };
  }, [orderSummary, callSummary, serviceRequests, defaultServiceItem]);

  // ✅ EXTRACTED: Room number extraction logic
  const extractRoomNumber = useCallback(
    (orderData: any, callContent?: string): string => {
      // Priority 1: Direct value from order data
      if (
        orderData?.roomNumber &&
        orderData.roomNumber !== CONSTANTS.ROOM_NUMBER_FALLBACK
      ) {
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
    },
    []
  );

  // ✅ EXTRACTED: Order reference generation
  const generateOrderReference = useCallback((): string => {
    const randomNumber = Math.floor(
      CONSTANTS.ORDER_MIN + Math.random() * CONSTANTS.ORDER_RANGE
    );
    return `${CONSTANTS.ORDER_PREFIX}-${randomNumber}`;
  }, []);

  // ✅ EXTRACTED: Request payload builder
  const buildRequestPayload = useCallback(
    (orderData: any) => {
      const orderReference = generateOrderReference();
      const validItems =
        orderData.items && orderData.items.length > 0
          ? orderData.items
          : [defaultServiceItem];

      return {
        callId: orderReference,
        roomNumber: extractRoomNumber(
          orderData,
          serviceRequests?.[0]?.details?.roomNumber || ''
        ),
        orderType: orderData.orderType || CONSTANTS.ORDER_TYPE_DEFAULT,
        deliveryTime: orderData.deliveryTime || CONSTANTS.DELIVERY_TIME_DEFAULT,
        specialInstructions: orderReference,
        items: validItems,
        totalAmount: orderData.totalAmount || 0,
        status: CONSTANTS.STATUS_PENDING,
        createdAt: new Date().toISOString(),
      };
    },
    [
      extractRoomNumber,
      generateOrderReference,
      defaultServiceItem,
      serviceRequests,
    ]
  );

  // ✅ EXTRACTED: Submit request to server
  const submitRequest = useCallback(async (payload: any) => {
    logger.debug(
      '🔐 [useSendToFrontDeskHandler] Using guest authentication with tenant context',
      'Component'
    );

    // ✅ STEP 1: Get guest session token
    let guestToken = localStorage.getItem('guest_token');

    // ✅ STEP 2: Submit request with guest token
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Guest-Session': `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    // Add authorization header if we have a guest token
    if (guestToken) {
      headers.Authorization = `Bearer ${guestToken}`;
    }

    const response = await fetch('/api/guest/requests', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
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
  const handleSuccess = useCallback(
    (requestData: any, orderData: any) => {
      logger.debug(
        '✅ [useSendToFrontDeskHandler] Request sent to Front Desk successfully',
        'Component'
      );

      // Update global order state
      setOrder({
        reference: requestData.reference || requestData.orderId,
        estimatedTime:
          requestData.estimatedTime ||
          orderData.deliveryTime ||
          CONSTANTS.DELIVERY_TIME_DEFAULT,
        summary: orderData,
      });

      // ✅ ENHANCED: Combine database accuracy + voice call details for best UX
      if (requestData && requestData.data) {
        const dbData = requestData.data; // Actual database record

        // Helper function to build detailed request content
        const buildDetailedRequestContent = (
          orderData: any,
          serviceReqs: any[]
        ) => {
          if (serviceReqs && serviceReqs.length > 0) {
            // Use detailed service requests from voice call
            const details = serviceReqs
              .map(req => req.requestText || req.serviceType)
              .join(', ');
            return `${orderData.orderType || 'Room Service'}: ${details}`;
          }

          if (orderData.items && orderData.items.length > 0) {
            // Use items from order data
            const itemDetails = orderData.items
              .map(
                (item: any) =>
                  `${item.quantity || 1}x ${item.name || item.description || 'item'}`
              )
              .join(', ');
            return `${orderData.orderType || 'Room Service'}: ${itemDetails}`;
          }

          // Fallback to database content or generic
          return dbData.request_content || 'Yêu cầu dịch vụ từ voice assistant';
        };

        // Helper function to extract room number with priority
        const extractBestRoomNumber = (
          orderData: any,
          serviceReqs: any[],
          dbRoomNumber: string
        ) => {
          // Priority 1: Room number from order data
          if (
            orderData.roomNumber &&
            orderData.roomNumber !== 'TBD' &&
            orderData.roomNumber !== 'unknown'
          ) {
            return orderData.roomNumber;
          }

          // Priority 2: Room number from service requests
          for (const req of serviceReqs || []) {
            if (
              req.roomNumber &&
              req.roomNumber !== 'TBD' &&
              req.roomNumber !== 'unknown'
            ) {
              return req.roomNumber;
            }
          }

          // Priority 3: Extract from content using regex
          const contentToSearch = [
            orderData.specialInstructions,
            orderData.requestText,
            ...(serviceReqs || []).map(req => req.requestText),
          ]
            .filter(Boolean)
            .join(' ');

          const roomMatch = contentToSearch.match(/(?:room|phòng)\s*#?(\d+)/i);
          if (roomMatch && roomMatch[1]) {
            return roomMatch[1];
          }

          // Priority 4: Database value (might be TBD)
          return dbRoomNumber || 'TBD';
        };

        const enhancedRequestData = {
          // ✅ Database accuracy (ID, timestamps, status)
          id: dbData.id,
          reference: `REQ-${dbData.id}`,
          status: dbData.status as
            | 'pending'
            | 'in-progress'
            | 'completed'
            | 'cancelled',
          submittedAt: new Date(dbData.created_at),

          // ✅ Enhanced with voice call details
          roomNumber: extractBestRoomNumber(
            orderData,
            serviceRequests,
            dbData.room_number
          ),
          guestName: orderData.guestName || dbData.guest_name || 'Khách',
          requestContent: buildDetailedRequestContent(
            orderData,
            serviceRequests
          ),
          orderType:
            orderData.orderType ||
            dbData.order_type ||
            dbData.type ||
            'Room Service',
          estimatedTime:
            orderData.deliveryTime ||
            dbData.delivery_time ||
            CONSTANTS.DELIVERY_TIME_DEFAULT,

          // ✅ Voice call items with fallback to database
          items:
            orderData.items?.map((item: any) => ({
              name: item.name || item.description || 'Dịch vụ',
              quantity: item.quantity || 1,
              description: item.description,
            })) || (dbData.items ? JSON.parse(dbData.items) : []),
        };

        logger.debug(
          '💎 [useSendToFrontDeskHandler] Saving ENHANCED data (DB + Voice)...',
          'Component',
          {
            id: enhancedRequestData.id,
            reference: enhancedRequestData.reference,
            roomNumber: enhancedRequestData.roomNumber,
            hasItems: enhancedRequestData.items.length,
            contentPreview: enhancedRequestData.requestContent.substring(0, 50),
          }
        );

        // Save enhanced request data
        setRecentRequest(enhancedRequestData);
      } else {
        logger.warn(
          '⚠️ [useSendToFrontDeskHandler] No database data in response, using voice call data',
          'Component'
        );

        // Fallback to voice call data only
        const voiceCallData = {
          id: Date.now(),
          reference: `REQ-${Date.now()}`,
          roomNumber: orderData.roomNumber || 'TBD',
          guestName: orderData.guestName || 'Khách',
          requestContent:
            serviceRequests?.length > 0
              ? `${orderData.orderType}: ${serviceRequests.map(req => req.requestText).join(', ')}`
              : `${orderData.orderType}: Yêu cầu từ voice assistant`,
          orderType: orderData.orderType || 'Room Service',
          status: 'pending' as const,
          submittedAt: new Date(),
          estimatedTime:
            orderData.deliveryTime || CONSTANTS.DELIVERY_TIME_DEFAULT,
          items: orderData.items || [],
        };

        setRecentRequest(voiceCallData);
      }

      // ✅ NEW: Reset UI to initial state after successful submission
      // Add small delay to let user see success message
      setTimeout(() => {
        logger.debug(
          '🔄 [useSendToFrontDeskHandler] Resetting UI to initial state...',
          'Component'
        );

        // Clear all conversation and order data (but keep recentRequest)
        clearTranscripts();
        clearModelOutput();
        setOrderSummary(null);
        setCallSummary(null);
        setServiceRequests([]);
        setEmailSentForCurrentSession(false);
        setRequestReceivedAt(null);
        setVietnameseSummary(null);

        // ✅ NEW: Clear summary popups to prevent showing after UI reset
        clearAllPopups();

        logger.debug(
          '🗑️ [useSendToFrontDeskHandler] Cleared summary popups and call state',
          'Component'
        );

        logger.debug(
          '✅ [useSendToFrontDeskHandler] UI reset completed - ready for new call',
          'Component'
        );

        // Show notification that UI is ready for new call
        logger.success(
          '🎤 Ready for new voice call! Interface has been reset.',
          'Component'
        );
      }, 2000); // 2 second delay to show success message first

      // Execute callback or show default feedback
      if (onSuccess) {
        onSuccess();
      } else {
        // Use logger instead of alert for better UX
        logger.success(
          '✅ Request sent to front desk successfully! UI reset for new call.',
          'Component'
        );
      }
    },
    [
      setOrder,
      onSuccess,
      clearTranscripts,
      clearModelOutput,
      setOrderSummary,
      setCallSummary,
      setServiceRequests,
      setEmailSentForCurrentSession,
      setRequestReceivedAt,
      setVietnameseSummary,
      setRecentRequest,
      clearAllPopups,
      serviceRequests, // Include serviceRequests for enhanced data combination
    ]
  );

  // ✅ EXTRACTED: Error handling
  const handleError = useCallback(
    (error: Error) => {
      logger.error(
        '❌ [useSendToFrontDeskHandler] Failed to send request:',
        'Component',
        error
      );

      const errorMessage =
        (error as any)?.message ||
        String(error) ||
        ERROR_MESSAGES.REQUEST_FAILED;

      if (onError) {
        onError(errorMessage);
      } else {
        // Use logger instead of alert for better UX
        logger.error(`❌ Failed to send request: ${errorMessage}`, 'Component');
      }
    },
    [onError]
  );

  // ✅ MAIN HANDLER: Clean and focused
  const handleSendToFrontDesk = useCallback(async () => {
    logger.debug(
      '🏨 [useSendToFrontDeskHandler] Send to FrontDesk initiated',
      'Component'
    );

    // Validate order data availability
    if (!generatedOrderSummary) {
      logger.warn(
        '⚠️ [useSendToFrontDeskHandler] No order summary available',
        'Component'
      );
      const errorMsg = ERROR_MESSAGES.NO_ORDER_DATA;

      if (onError) {
        onError(errorMsg);
      } else {
        logger.error(`❌ No order summary available: ${errorMsg}`, 'Component');
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Build and submit request - SIMPLIFIED
      const requestPayload = buildRequestPayload(generatedOrderSummary);

      // ✅ SIMPLIFIED: Backend now accepts any format with automatic fallbacks
      const backendPayload = {
        ...requestPayload,
        // Optional: Override with any specific fields if needed
        tenantId: 'mi-nhon-hotel',
      };

      logger.debug(
        '📤 [useSendToFrontDeskHandler] Submitting request to guest endpoint:',
        'Component',
        {
          orderType: backendPayload.orderType,
          roomNumber: backendPayload.roomNumber,
          items: backendPayload.items?.length || 0,
          tenantId: backendPayload.tenantId,
        }
      );

      // ✅ FIXED: Use guest endpoint for voice assistant requests (no auth required)
      const response = await fetch('/api/guest/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add guest session ID for tracking
          'X-Guest-Session': `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        },
        body: JSON.stringify(backendPayload),
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

      const requestData = result.data;

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
    onError,
  ]);

  return {
    handleSendToFrontDesk,
    isSubmitting,
  };
};
