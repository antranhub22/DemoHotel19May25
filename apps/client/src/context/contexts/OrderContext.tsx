import {
  ActiveOrder,
  CallSummary,
  Order,
  OrderSummary,
  ServiceRequest,
} from "@/types";
import logger from "@shared/utils/logger";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
// ✅ NEW: Recent request interface for tracking just-submitted requests
export interface RecentRequest {
  id: string | number;
  reference: string;
  roomNumber: string;
  guestName: string;
  requestContent: string;
  orderType: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  submittedAt: Date;
  estimatedTime?: string;
  items?: Array<{
    name: string;
    quantity: number;
    description?: string;
  }>;
}

export interface OrderContextType {
  // Order state
  order: Order | null;
  setOrder: (order: Order | null) => void;
  orderSummary: OrderSummary | null;
  setOrderSummary: (summary: OrderSummary) => void;

  // Call summary state
  callSummary: CallSummary | null;
  setCallSummary: (summary: CallSummary | null) => void;

  // Service requests state
  serviceRequests: ServiceRequest[];
  setServiceRequests: (requests: ServiceRequest[]) => void;

  // Active orders state
  activeOrders: ActiveOrder[];
  setActiveOrders: React.Dispatch<React.SetStateAction<ActiveOrder[]>>;
  addActiveOrder: (order: ActiveOrder) => void;

  // ✅ NEW: Recent request state for post-submit display
  recentRequest: RecentRequest | null;
  setRecentRequest: (request: RecentRequest | null) => void;

  // Email state
  emailSentForCurrentSession: boolean;
  setEmailSentForCurrentSession: (sent: boolean) => void;
  requestReceivedAt: Date | null;
  setRequestReceivedAt: (date: Date | null) => void;
}

const initialOrderSummary: OrderSummary = {
  orderType: "Room Service",
  deliveryTime: "asap",
  roomNumber: "",
  guestName: "",
  guestEmail: "",
  guestPhone: "",
  specialInstructions: "",
  items: [
    {
      id: "1",
      name: "Club Sandwich",
      description: "Served with french fries and side salad",
      quantity: 1,
      price: 15.0,
    },
    {
      id: "2",
      name: "Fresh Orange Juice",
      description: "Large size",
      quantity: 1,
      price: 8.0,
    },
  ],
  totalAmount: 23.0,
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  logger.debug("[OrderProvider] Initializing...", "Component");

  const [order, setOrder] = useState<Order | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [callSummary, setCallSummary] = useState<CallSummary | null>(null);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [emailSentForCurrentSession, setEmailSentForCurrentSession] =
    useState<boolean>(false);
  const [requestReceivedAt, setRequestReceivedAt] = useState<Date | null>(null);

  // ✅ NEW: Recent request state
  const [recentRequest, setRecentRequest] = useState<RecentRequest | null>(
    null,
  );

  // Active orders with localStorage persistence
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const stored = localStorage.getItem("activeOrders");
      if (!stored) {
        return [];
      }
      const parsed = JSON.parse(stored) as (ActiveOrder & {
        requestedAt: string;
      })[];
      // Convert requestedAt string back into Date
      return parsed.map((o) => ({
        ...o,
        requestedAt: new Date(o.requestedAt),
      }));
    } catch (err) {
      logger.error(
        "[OrderContext] Failed to parse activeOrders from localStorage",
        "Component",
        err,
      );
      return [];
    }
  });

  // Persist activeOrders to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      localStorage.setItem("activeOrders", JSON.stringify(activeOrders));
    } catch {
      logger.error(
        "[OrderContext] Failed to persist activeOrders to localStorage",
        "Component",
      );
    }
  }, [activeOrders]);

  // Add active order
  const addActiveOrder = useCallback((order: ActiveOrder) => {
    setActiveOrders((prev) => [
      ...prev,
      {
        ...order,
        status: order.status || "Đã ghi nhận",
      },
    ]);
    logger.debug("[OrderContext] Active order added:", "Component", order);
  }, []);

  // Polling API để lấy trạng thái order mới nhất mỗi 5 giây
  useEffect(() => {
    let polling: NodeJS.Timeout | null = null;

    const fetchOrders = async () => {
      try {
        // Use authenticated fetch with auto-retry
        const { authenticatedFetch } = await import("@/lib/authHelper");

        // Use relative URL to call API from same domain
        const res = await authenticatedFetch(`/api/request`);
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            logger.warn(
              "[OrderContext] Auth failed - token may be invalid or missing",
              "Component",
            );
          }
          return;
        }

        const data = await (res as any).json();
        logger.debug(
          "[OrderContext] Fetched orders from API:",
          "Component",
          data,
        );

        // Map data to ActiveOrder format
        if (Array.isArray(data)) {
          setActiveOrders(
            data.map((o: any) => ({
              reference: o.specialInstructions || o.reference || o.callId || "",
              requestedAt: o.createdAt ? new Date(o.createdAt) : new Date(),
              estimatedTime: o.deliveryTime || "",
              status:
                o.status === "completed"
                  ? "Hoàn thiện"
                  : o.status === "pending"
                    ? "Đã ghi nhận"
                    : o.status,
              ...o,
            })),
          );
        }
      } catch (err) {
        // Ignore polling errors to prevent spam
      }
    };

    // Start polling
    fetchOrders();
    polling = setInterval(fetchOrders, 5000);

    return () => {
      if (polling) {
        clearInterval(polling);
      }
    };
  }, []);

  const value: OrderContextType = {
    order,
    setOrder,
    orderSummary,
    setOrderSummary,
    callSummary,
    setCallSummary,
    serviceRequests,
    setServiceRequests,
    activeOrders,
    setActiveOrders,
    addActiveOrder,
    // ✅ NEW: Recent request state
    recentRequest,
    setRecentRequest,
    emailSentForCurrentSession,
    setEmailSentForCurrentSession,
    requestReceivedAt,
    setRequestReceivedAt,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
}

export { initialOrderSummary };
