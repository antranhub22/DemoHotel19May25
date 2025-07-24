import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import {
  ConfigurationProvider,
  useConfiguration,
} from '../ConfigurationContext';
import React from 'react';

// Mock hotel configuration data
const mockHotelConfig = {
  hotelName: 'Test Hotel',
  logoUrl: 'test-logo.png',
  primaryColor: '#1F2937',
  headerText: 'Test Hotel',
  vapiPublicKey: 'test-key',
  vapiAssistantId: 'test-assistant',
  branding: {
    logo: 'test-logo.png',
    colors: {
      primary: '#1F2937',
      secondary: '#374151',
      accent: '#E74C3C',
    },
    fonts: {
      primary: 'Poppins',
      secondary: 'Inter',
    },
  },
  features: {
    callHistory: true,
    multiLanguage: true,
    analytics: true,
    customization: true,
  },
  services: [
    { type: 'room_service', name: 'Room Service', enabled: true },
    { type: 'concierge', name: 'Concierge', enabled: true },
  ],
  supportedLanguages: ['en', 'vi'],
};

const mockTenantConfig = {
  tenantId: 'tenant-123',
  subscriptionPlan: 'premium',
  features: ['analytics', 'multi-language'],
  limits: {
    maxAssistants: 5,
    maxCalls: 1000,
  },
};

// Test component that uses ConfigurationContext
const TestComponent = () => {
  const {
    hotelConfig,
    setHotelConfig,
    tenantId,
    setTenantId,
    tenantConfig,
    setTenantConfig,
  } = useConfiguration();

  return (
    <div>
      <div data-testid="hotel-config">
        {hotelConfig ? JSON.stringify(hotelConfig) : 'No hotel config'}
      </div>
      <div data-testid="tenant-id">{tenantId || 'No tenant ID'}</div>
      <div data-testid="tenant-config">
        {tenantConfig ? JSON.stringify(tenantConfig) : 'No tenant config'}
      </div>

      <button
        onClick={() => setHotelConfig(mockHotelConfig)}
        data-testid="set-hotel-config"
      >
        Set Hotel Config
      </button>
      <button
        onClick={() => setTenantId('tenant-456')}
        data-testid="set-tenant-id"
      >
        Set Tenant ID
      </button>
      <button
        onClick={() => setTenantConfig(mockTenantConfig)}
        data-testid="set-tenant-config"
      >
        Set Tenant Config
      </button>
      <button
        onClick={() => setHotelConfig(null)}
        data-testid="clear-hotel-config"
      >
        Clear Hotel Config
      </button>
      <button onClick={() => setTenantId(null)} data-testid="clear-tenant-id">
        Clear Tenant ID
      </button>
      <button
        onClick={() => setTenantConfig(null)}
        data-testid="clear-tenant-config"
      >
        Clear Tenant Config
      </button>
    </div>
  );
};

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ConfigurationProvider>{children}</ConfigurationProvider>
);

describe('ConfigurationContext', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide default configuration state', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('hotel-config')).toHaveTextContent(
      'No hotel config'
    );
    expect(screen.getByTestId('tenant-id')).toHaveTextContent('No tenant ID');
    expect(screen.getByTestId('tenant-config')).toHaveTextContent(
      'No tenant config'
    );
  });

  it('should set hotel configuration', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await user.click(screen.getByTestId('set-hotel-config'));

    expect(screen.getByTestId('hotel-config')).toHaveTextContent('Test Hotel');
    expect(screen.getByTestId('hotel-config')).toHaveTextContent('hotel-123');
    expect(screen.getByTestId('hotel-config')).toHaveTextContent(
      'room-service'
    );
  });

  it('should set tenant ID', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await user.click(screen.getByTestId('set-tenant-id'));
    expect(screen.getByTestId('tenant-id')).toHaveTextContent('tenant-456');
  });

  it('should set tenant configuration', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await user.click(screen.getByTestId('set-tenant-config'));

    expect(screen.getByTestId('tenant-config')).toHaveTextContent('tenant-123');
    expect(screen.getByTestId('tenant-config')).toHaveTextContent('premium');
    expect(screen.getByTestId('tenant-config')).toHaveTextContent('analytics');
  });

  it('should clear hotel configuration', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // First set config
    await user.click(screen.getByTestId('set-hotel-config'));
    expect(screen.getByTestId('hotel-config')).toHaveTextContent('Test Hotel');

    // Then clear it
    await user.click(screen.getByTestId('clear-hotel-config'));
    expect(screen.getByTestId('hotel-config')).toHaveTextContent(
      'No hotel config'
    );
  });

  it('should clear tenant ID', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // First set tenant ID
    await user.click(screen.getByTestId('set-tenant-id'));
    expect(screen.getByTestId('tenant-id')).toHaveTextContent('tenant-456');

    // Then clear it
    await user.click(screen.getByTestId('clear-tenant-id'));
    expect(screen.getByTestId('tenant-id')).toHaveTextContent('No tenant ID');
  });

  it('should clear tenant configuration', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // First set config
    await user.click(screen.getByTestId('set-tenant-config'));
    expect(screen.getByTestId('tenant-config')).toHaveTextContent('premium');

    // Then clear it
    await user.click(screen.getByTestId('clear-tenant-config'));
    expect(screen.getByTestId('tenant-config')).toHaveTextContent(
      'No tenant config'
    );
  });

  it('should throw error when used outside provider', () => {
    // Mock console.error to prevent error output in test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useConfiguration must be used within a ConfigurationProvider');

    consoleSpy.mockRestore();
  });

  it('should handle multiple configuration updates', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Set hotel config
    await user.click(screen.getByTestId('set-hotel-config'));
    expect(screen.getByTestId('hotel-config')).toHaveTextContent('Test Hotel');

    // Set tenant ID
    await user.click(screen.getByTestId('set-tenant-id'));
    expect(screen.getByTestId('tenant-id')).toHaveTextContent('tenant-456');

    // Set tenant config
    await user.click(screen.getByTestId('set-tenant-config'));
    expect(screen.getByTestId('tenant-config')).toHaveTextContent('premium');

    // All should be set simultaneously
    expect(screen.getByTestId('hotel-config')).toHaveTextContent('Test Hotel');
    expect(screen.getByTestId('tenant-id')).toHaveTextContent('tenant-456');
    expect(screen.getByTestId('tenant-config')).toHaveTextContent('premium');
  });
});
