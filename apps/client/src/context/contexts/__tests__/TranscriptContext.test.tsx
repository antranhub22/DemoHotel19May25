import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TranscriptProvider, useTranscript } from "../TranscriptContext";
import React from "react";

// Mock transcript data
const mockTranscript1 = {
  role: "user" as const,
  content: "Hello, I need room service",
  callId: "call-123",
  timestamp: new Date(),
  tenantId: "tenant-123",
};

const mockTranscript2 = {
  role: "assistant" as const,
  content: "Sure! I can help you with room service.",
  callId: "call-123",
  timestamp: new Date(),
  tenantId: "tenant-123",
};

// Test component that uses TranscriptContext
const TestComponent = () => {
  const {
    transcripts,
    setTranscripts,
    addTranscript,
    modelOutput,
    setModelOutput,
    addModelOutput,
    clearTranscripts,
    clearModelOutput,
  } = useTranscript();

  return (
    <div>
      <div data-testid="transcripts-count">{transcripts.length}</div>
      <div data-testid="model-output-count">{modelOutput.length}</div>

      <div data-testid="transcripts-content">
        {transcripts.map((t, idx) => (
          <div key={idx}>{t.content}</div>
        ))}
      </div>

      <div data-testid="model-output-content">
        {modelOutput.map((output, idx) => (
          <div key={idx}>{output}</div>
        ))}
      </div>

      <button
        onClick={() => setTranscripts([mockTranscript1, mockTranscript2])}
        data-testid="set-transcripts"
      >
        Set Transcripts
      </button>

      <button
        onClick={() => addTranscript(mockTranscript1)}
        data-testid="add-transcript"
      >
        Add Transcript
      </button>

      <button
        onClick={() => setModelOutput(["Output 1", "Output 2"])}
        data-testid="set-model-output"
      >
        Set Model Output
      </button>

      <button
        onClick={() => addModelOutput("New output")}
        data-testid="add-model-output"
      >
        Add Model Output
      </button>

      <button onClick={clearTranscripts} data-testid="clear-transcripts">
        Clear Transcripts
      </button>

      <button onClick={clearModelOutput} data-testid="clear-model-output">
        Clear Model Output
      </button>
    </div>
  );
};

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TranscriptProvider>{children}</TranscriptProvider>
);

describe("TranscriptContext", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  it("should provide default transcript state", () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    expect(screen.getByTestId("transcripts-count")).toHaveTextContent("0");
    expect(screen.getByTestId("model-output-count")).toHaveTextContent("0");
  });

  it("should set transcripts", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    await user.click(screen.getByTestId("set-transcripts"));

    expect(screen.getByTestId("transcripts-count")).toHaveTextContent("2");
    expect(screen.getByTestId("transcripts-content")).toHaveTextContent(
      "Hello, I need room service",
    );
    expect(screen.getByTestId("transcripts-content")).toHaveTextContent(
      "Sure! I can help you with room service.",
    );
  });

  it("should add individual transcript", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    // Initially empty
    expect(screen.getByTestId("transcripts-count")).toHaveTextContent("0");

    // Add transcript
    await user.click(screen.getByTestId("add-transcript"));

    expect(screen.getByTestId("transcripts-count")).toHaveTextContent("1");
    expect(screen.getByTestId("transcripts-content")).toHaveTextContent(
      "Hello, I need room service",
    );
  });

  it("should set model output", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    await user.click(screen.getByTestId("set-model-output"));

    expect(screen.getByTestId("model-output-count")).toHaveTextContent("2");
    expect(screen.getByTestId("model-output-content")).toHaveTextContent(
      "Output 1",
    );
    expect(screen.getByTestId("model-output-content")).toHaveTextContent(
      "Output 2",
    );
  });

  it("should add individual model output", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    // Initially empty
    expect(screen.getByTestId("model-output-count")).toHaveTextContent("0");

    // Add output
    await user.click(screen.getByTestId("add-model-output"));

    expect(screen.getByTestId("model-output-count")).toHaveTextContent("1");
    expect(screen.getByTestId("model-output-content")).toHaveTextContent(
      "New output",
    );
  });

  it("should clear transcripts", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    // First add some transcripts
    await user.click(screen.getByTestId("set-transcripts"));
    expect(screen.getByTestId("transcripts-count")).toHaveTextContent("2");

    // Then clear them
    await user.click(screen.getByTestId("clear-transcripts"));
    expect(screen.getByTestId("transcripts-count")).toHaveTextContent("0");
  });

  it("should clear model output", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    // First add some output
    await user.click(screen.getByTestId("set-model-output"));
    expect(screen.getByTestId("model-output-count")).toHaveTextContent("2");

    // Then clear it
    await user.click(screen.getByTestId("clear-model-output"));
    expect(screen.getByTestId("model-output-count")).toHaveTextContent("0");
  });

  it("should throw error when used outside provider", () => {
    // Mock console.error to prevent error output in test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useTranscript must be used within a TranscriptProvider");

    consoleSpy.mockRestore();
  });

  it("should handle multiple transcript additions", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    // Add first transcript
    await user.click(screen.getByTestId("add-transcript"));
    expect(screen.getByTestId("transcripts-count")).toHaveTextContent("1");

    // Add second transcript
    await user.click(screen.getByTestId("add-transcript"));
    expect(screen.getByTestId("transcripts-count")).toHaveTextContent("2");
  });

  it("should handle multiple model output additions", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    // Add first output
    await user.click(screen.getByTestId("add-model-output"));
    expect(screen.getByTestId("model-output-count")).toHaveTextContent("1");

    // Add second output
    await user.click(screen.getByTestId("add-model-output"));
    expect(screen.getByTestId("model-output-count")).toHaveTextContent("2");
  });
});
