import type { Room } from "@/types/common.types";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderProvider, useOrder } from "../OrderContext";
import React from "react";

// Mock data
const mockOrder = {
  reference: "order-123",
  estimatedTime: "30 minutes",
  summary: {
    orderType: "Room Service",
    deliveryTime: "asap" as const,
    roomNumber: "205",
    guestName: "John Doe",
    guestEmail: "john@example.com",
    guestPhone: "+1234567890",
    specialInstructions: "No onions please",
    items: [
      {
        id: "1",
        name: "Club Sandwich",
        description: "Served with fries",
        quantity: 1,
        price: 15,
      },
      {
        id: "2",
        name: "Coffee",
        description: "Hot coffee",
        quantity: 2,
        price: 5,
      },
    ],
    totalAmount: 25,
  },
};

const mockOrderSummary = {
  orderType: "Room Service",
  deliveryTime: "asap" as const,
  roomNumber: "205",
  guestName: "John Doe",
  guestEmail: "john@example.com",
  guestPhone: "+1234567890",
  specialInstructions: "No onions please",
  items: [
    {
      id: "1",
      name: "Club Sandwich",
      description: "Served with fries",
      quantity: 1,
      price: 15,
    },
    {
      id: "2",
      name: "Coffee",
      description: "Hot coffee",
      quantity: 2,
      price: 5,
    },
  ],
  totalAmount: 25,
};

const mockCallSummary = {
  callId: "call-123",
  content: "Guest ordered club sandwich and coffee",
  timestamp: new Date(),
  roomNumber: "205",
  tenantId: "tenant-123",
};

const mockServiceRequest = {
  serviceType: "Room Service",
  requestText: "Please deliver to room 205",
  details: {
    roomNumber: "205",
    time: "asap",
    otherDetails: "Please deliver to room 205",
  },
};

const mockActiveOrder = {
  reference: "active-123",
  requestedAt: new Date(),
  estimatedTime: "30 minutes",
  status: "preparing",
};

// Test component
const TestComponent = () => {
  const {
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
    emailSentForCurrentSession,
    setEmailSentForCurrentSession,
    requestReceivedAt,
    setRequestReceivedAt,
  } = useOrder();

  return (
    <div>
      <div data-testid="order">
        {order ? JSON.stringify(order) : "No order"}
      </div>
      <div data-testid="order-summary">
        {orderSummary ? JSON.stringify(orderSummary) : "No summary"}
      </div>
      <div data-testid="call-summary">
        {callSummary ? JSON.stringify(callSummary) : "No call summary"}
      </div>
      <div data-testid="service-requests-count">{serviceRequests.length}</div>
      <div data-testid="active-orders-count">{activeOrders.length}</div>
      <div data-testid="email-sent">
        {emailSentForCurrentSession.toString()}
      </div>
      <div data-testid="request-received-at">
        {requestReceivedAt ? requestReceivedAt.toISOString() : "No time"}
      </div>

      <button onClick={() => setOrder(mockOrder)} data-testid="set-order">
        Set Order
      </button>
      <button
        onClick={() => setOrderSummary(mockOrderSummary)}
        data-testid="set-order-summary"
      >
        Set Order Summary
      </button>
      <button
        onClick={() => setCallSummary(mockCallSummary)}
        data-testid="set-call-summary"
      >
        Set Call Summary
      </button>
      <button
        onClick={() => setServiceRequests([mockServiceRequest])}
        data-testid="set-service-requests"
      >
        Set Service Requests
      </button>
      <button
        onClick={() => setActiveOrders([mockActiveOrder])}
        data-testid="set-active-orders"
      >
        Set Active Orders
      </button>
      <button
        onClick={() => addActiveOrder(mockActiveOrder)}
        data-testid="add-active-order"
      >
        Add Active Order
      </button>
      <button
        onClick={() => setEmailSentForCurrentSession(true)}
        data-testid="set-email-sent"
      >
        Set Email Sent
      </button>
      <button
        onClick={() => setRequestReceivedAt(new Date("2024-01-01T12:00:00Z"))}
        data-testid="set-request-time"
      >
        Set Request Time
      </button>
      <button onClick={() => setOrder(null)} data-testid="clear-order">
        Clear Order
      </button>
    </div>
  );
};

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <OrderProvider>{children}</OrderProvider>
);

describe("OrderContext", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
    // Clear localStorage before each test
    localStorage.clear();
  });

  it("should provide default order state", () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    expect(screen.getByTestId("order")).toHaveTextContent("No order");
    expect(screen.getByTestId("service-requests-count")).toHaveTextContent("0");
    expect(screen.getByTestId("active-orders-count")).toHaveTextContent("0");
    expect(screen.getByTestId("email-sent")).toHaveTextContent("false");
    expect(screen.getByTestId("request-received-at")).toHaveTextContent(
      "No time",
    );
  });

  it("should set and clear order", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    // Set order
    await user.click(screen.getByTestId("set-order"));
    expect(screen.getByTestId("order")).toHaveTextContent("Club Sandwich");
    expect(screen.getByTestId("order")).toHaveTextContent("order-123");

    // Clear order
    await user.click(screen.getByTestId("clear-order"));
    expect(screen.getByTestId("order")).toHaveTextContent("No order");
  });

  it("should set order summary", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    await user.click(screen.getByTestId("set-order-summary"));
    expect(screen.getByTestId("order-summary")).toHaveTextContent(
      "Club Sandwich",
    );
    expect(screen.getByTestId("order-summary")).toHaveTextContent(
      "No onions please",
    );
  });

  it("should set call summary", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    await user.click(screen.getByTestId("set-call-summary"));
    expect(screen.getByTestId("call-summary")).toHaveTextContent(
      "Guest ordered club sandwich and coffee",
    );
    expect(screen.getByTestId("call-summary")).toHaveTextContent("205");
  });

  it("should manage service requests", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    // Initially empty
    expect(screen.getByTestId("service-requests-count")).toHaveTextContent("0");

    // Set service requests
    await user.click(screen.getByTestId("set-service-requests"));
    expect(screen.getByTestId("service-requests-count")).toHaveTextContent("1");
  });

  it("should manage active orders", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    // Initially empty
    expect(screen.getByTestId("active-orders-count")).toHaveTextContent("0");

    // Set active orders
    await user.click(screen.getByTestId("set-active-orders"));
    expect(screen.getByTestId("active-orders-count")).toHaveTextContent("1");
  });

  it("should add active order", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    // Initially empty
    expect(screen.getByTestId("active-orders-count")).toHaveTextContent("0");

    // Add active order
    await user.click(screen.getByTestId("add-active-order"));
    expect(screen.getByTestId("active-orders-count")).toHaveTextContent("1");
  });

  it("should manage email sent state", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    // Initially false
    expect(screen.getByTestId("email-sent")).toHaveTextContent("false");

    // Set email sent
    await user.click(screen.getByTestId("set-email-sent"));
    expect(screen.getByTestId("email-sent")).toHaveTextContent("true");
  });

  it("should manage request received time", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    // Initially no time
    expect(screen.getByTestId("request-received-at")).toHaveTextContent(
      "No time",
    );

    // Set request time
    await user.click(screen.getByTestId("set-request-time"));
    expect(screen.getByTestId("request-received-at")).toHaveTextContent(
      "2024-01-01T12:00:00.000Z",
    );
  });

  it("should throw error when used outside provider", () => {
    // Mock console.error to prevent error output in test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useOrder must be used within an OrderProvider");

    consoleSpy.mockRestore();
  });

  it("should handle email sent state in memory", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    // Initially false
    expect(screen.getByTestId("email-sent")).toHaveTextContent("false");

    // Set email sent state
    await user.click(screen.getByTestId("set-email-sent"));

    // Should update in memory
    expect(screen.getByTestId("email-sent")).toHaveTextContent("true");
  });
});
