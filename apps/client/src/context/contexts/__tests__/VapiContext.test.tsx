import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { VapiProvider, useVapi } from '../VapiContext';
import React from 'react';

// Mock the dynamic imports
vi.mock('@/lib/vapiClient', () => ({
  initVapi: vi.fn().mockResolvedValue({
    on: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    setMuted: vi.fn(),
  }),
  getVapiInstance: vi.fn().mockReturnValue({
    start: vi.fn().mockResolvedValue({}),
    stop: vi.fn().mockResolvedValue({}),
    setMuted: vi.fn(),
    on: vi.fn(),
  }),
}));

vi.mock('@/hooks/useHotelConfiguration', () => ({
  getVapiPublicKeyByLanguage: vi.fn().mockReturnValue('pk-test-key'),
  getVapiAssistantIdByLanguage: vi.fn().mockReturnValue('asst_test-id'), // Fix format
}));

// Mock call details data
const mockCallDetails = {
  id: 'call-123',
  roomNumber: '205',
  duration: 120,
  status: 'completed' as const,
  timestamp: new Date(),
};

// Test component that uses VapiContext
const TestComponent = () => {
  const {
    micLevel,
    callDetails,
    setCallDetails,
    initializeVapi,
    startVapiCall,
    stopVapi,
    setMuted,
  } = useVapi();

  const handleInitialize = async () => {
    try {
      await initializeVapi('en');
    } catch (error) {
      console.error('Initialize failed:', error);
    }
  };

  const handleStartCall = async () => {
    try {
      await startVapiCall('asst_test-id');
    } catch (error) {
      console.error('Start call failed:', error);
    }
  };

  const handleStopCall = async () => {
    try {
      await stopVapi();
    } catch (error) {
      console.error('Stop call failed:', error);
    }
  };

  const handleSetMuted = async (muted: boolean) => {
    try {
      await setMuted(muted);
    } catch (error) {
      console.error('Set muted failed:', error);
    }
  };

  return (
    <div>
      <div data-testid="mic-level">{micLevel}</div>
      <div data-testid="call-details">
        {callDetails ? JSON.stringify(callDetails) : 'No call details'}
      </div>

      <button
        onClick={() => setCallDetails(mockCallDetails)}
        data-testid="set-call-details"
      >
        Set Call Details
      </button>
      <button
        onClick={() => setCallDetails(null)}
        data-testid="clear-call-details"
      >
        Clear Call Details
      </button>
      <button onClick={handleInitialize} data-testid="initialize-vapi">
        Initialize Vapi
      </button>
      <button onClick={handleStartCall} data-testid="start-call">
        Start Call
      </button>
      <button onClick={handleStopCall} data-testid="stop-call">
        Stop Call
      </button>
      <button onClick={() => handleSetMuted(true)} data-testid="mute">
        Mute
      </button>
      <button onClick={() => handleSetMuted(false)} data-testid="unmute">
        Unmute
      </button>
    </div>
  );
};

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <VapiProvider>{children}</VapiProvider>
);

describe('VapiContext', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide default vapi state', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('mic-level')).toHaveTextContent('0');
    expect(screen.getByTestId('call-details')).toHaveTextContent(
      'No call details'
    );
  });

  it('should set call details', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await user.click(screen.getByTestId('set-call-details'));

    expect(screen.getByTestId('call-details')).toHaveTextContent('call-123');
    expect(screen.getByTestId('call-details')).toHaveTextContent('205');
    expect(screen.getByTestId('call-details')).toHaveTextContent('120');
  });

  it('should clear call details', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // First set call details
    await user.click(screen.getByTestId('set-call-details'));
    expect(screen.getByTestId('call-details')).toHaveTextContent('call-123');

    // Then clear them
    await user.click(screen.getByTestId('clear-call-details'));
    expect(screen.getByTestId('call-details')).toHaveTextContent(
      'No call details'
    );
  });

  it('should handle vapi initialization', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Should not throw errors when initializing
    await user.click(screen.getByTestId('initialize-vapi'));

    // Should not have logged any errors
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should handle start call', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Should not throw errors when starting call
    await user.click(screen.getByTestId('start-call'));

    // Should not have logged any errors
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should handle stop call', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Should not throw errors when stopping call
    await user.click(screen.getByTestId('stop-call'));

    // Should not have logged any errors
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should handle mute/unmute', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Should not throw errors when muting
    await user.click(screen.getByTestId('mute'));
    expect(consoleSpy).not.toHaveBeenCalled();

    // Should not throw errors when unmuting
    await user.click(screen.getByTestId('unmute'));
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should throw error when used outside provider', () => {
    // Mock console.error to prevent error output in test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useVapi must be used within a VapiProvider');

    consoleSpy.mockRestore();
  });

  it('should handle multiple operations in sequence', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Test sequence of operations
    await user.click(screen.getByTestId('initialize-vapi'));
    await user.click(screen.getByTestId('set-call-details'));
    await user.click(screen.getByTestId('start-call'));
    await user.click(screen.getByTestId('mute'));
    await user.click(screen.getByTestId('unmute'));
    await user.click(screen.getByTestId('stop-call'));
    await user.click(screen.getByTestId('clear-call-details'));

    // Should not have logged any errors
    expect(consoleSpy).not.toHaveBeenCalled();

    // Call details should be cleared
    expect(screen.getByTestId('call-details')).toHaveTextContent(
      'No call details'
    );

    consoleSpy.mockRestore();
  });
});
