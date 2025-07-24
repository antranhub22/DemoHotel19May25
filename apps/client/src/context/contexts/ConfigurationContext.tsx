import React, { createContext, useContext, useState } from 'react';
import { HotelConfiguration } from '@/hooks/useHotelConfiguration';
import { logger } from '@shared/utils/logger';

export interface ConfigurationContextType {
  // Hotel configuration
  hotelConfig: HotelConfiguration | null;
  setHotelConfig: (config: HotelConfiguration | null) => void;

  // Multi-tenant support
  tenantId: string | null;
  setTenantId: (tenantId: string | null) => void;
  tenantConfig: any | null;
  setTenantConfig: (config: any | null) => void;
}

const ConfigurationContext = createContext<
  ConfigurationContextType | undefined
>(undefined);

export function ConfigurationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  logger.debug('[ConfigurationProvider] Initializing...', 'Component');

  const [hotelConfig, setHotelConfig] = useState<HotelConfiguration | null>(
    null
  );
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tenantConfig, setTenantConfig] = useState<any | null>(null);

  const value: ConfigurationContextType = {
    hotelConfig,
    setHotelConfig,
    tenantId,
    setTenantId,
    tenantConfig,
    setTenantConfig,
  };

  return (
    <ConfigurationContext.Provider value={value}>
      {children}
    </ConfigurationContext.Provider>
  );
}

export function useConfiguration() {
  const context = useContext(ConfigurationContext);
  if (context === undefined) {
    throw new Error(
      'useConfiguration must be used within a ConfigurationProvider'
    );
  }
  return context;
}
