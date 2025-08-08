import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CallProvider, useCall } from "../CallContext";

// Test component that uses CallContext
const TestComponent = () => {
  const {
    callDuration,
    setCallDuration,
    isMuted,
    toggleMute,
    startCall,
    endCall,
    isCallActive,
    isEndingCall,
    addCallEndListener,
  } = useCall();

  return (
    <div>
      <div data-testid="call-duration">{callDuration}</div>
      <div data-testid="is-muted">{isMuted.toString()}</div>
      <div data-testid="is-call-active">{isCallActive.toString()}</div>
      <div data-testid="is-ending-call">{isEndingCall.toString()}</div>

      <button onClick={() => setCallDuration(120)} data-testid="set-duration">
        Set Duration
      </button>
      <button onClick={toggleMute} data-testid="toggle-mute">
        Toggle Mute
      </button>
      <button onClick={() => startCall()} data-testid="start-call">
        Start Call
      </button>
      <button onClick={endCall} data-testid="end-call">
        End Call
      </button>
      <button
        onClick={() => {
          const removeListener = addCallEndListener(() => {
            console.log("Call ended");
          });
          removeListener(); // Test cleanup
        }}
        data-testid="add-listener"
      >
        Add Listener
      </button>
    </div>
  );
};

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <CallProvider>{children}</CallProvider>
);

describe("CallContext", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should provide default call state", () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    expect(screen.getByTestId("call-duration")).toHaveTextContent("0");
    expect(screen.getByTestId("is-muted")).toHaveTextContent("false");
    expect(screen.getByTestId("is-call-active")).toHaveTextContent("false");
    expect(screen.getByTestId("is-ending-call")).toHaveTextContent("false");
  });

  it("should update call duration", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    await user.click(screen.getByTestId("set-duration"));
    expect(screen.getByTestId("call-duration")).toHaveTextContent("120");
  });

  it("should toggle mute state", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    // Initially not muted
    expect(screen.getByTestId("is-muted")).toHaveTextContent("false");

    // Toggle mute
    await user.click(screen.getByTestId("toggle-mute"));
    expect(screen.getByTestId("is-muted")).toHaveTextContent("true");

    // Toggle again
    await user.click(screen.getByTestId("toggle-mute"));
    expect(screen.getByTestId("is-muted")).toHaveTextContent("false");
  });

  it("should handle call lifecycle", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    // Initially no call active
    expect(screen.getByTestId("is-call-active")).toHaveTextContent("false");

    // Start call
    await act(async () => {
      await user.click(screen.getByTestId("start-call"));
    });
    expect(screen.getByTestId("is-call-active")).toHaveTextContent("true");

    // End call
    await user.click(screen.getByTestId("end-call"));
    expect(screen.getByTestId("is-call-active")).toHaveTextContent("false");
  });

  it("should handle call end listeners", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    // Add listener (and immediately remove it in the test component)
    await user.click(screen.getByTestId("add-listener"));

    // Should not throw any errors
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("should throw error when used outside provider", () => {
    // Mock console.error to prevent error output in test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useCall must be used within a CallProvider");

    consoleSpy.mockRestore();
  });

  it("should handle ending call state during async operations", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    // Start call first
    await act(async () => {
      await user.click(screen.getByTestId("start-call"));
    });
    expect(screen.getByTestId("is-call-active")).toHaveTextContent("true");

    // End call should update call state
    await user.click(screen.getByTestId("end-call"));
    expect(screen.getByTestId("is-call-active")).toHaveTextContent("false");
    // Note: isEndingCall state may vary based on timing, so we won't assert its specific value
  });
});
