import { forwardRef } from 'react';
import { ServiceGrid } from './ServiceGrid';
import { ServiceItem } from '@/types/interface1.types';

interface ServiceGridContainerProps {
  className?: string;
  onServiceSelect?: (service: ServiceItem) => void;
  onVoiceServiceRequest?: (service: ServiceItem) => Promise<void>;
}

export const ServiceGridContainer = forwardRef<
  HTMLDivElement,
  ServiceGridContainerProps
>(({ className = '', onServiceSelect, onVoiceServiceRequest }, ref) => {
  return (
    <div ref={ref} className={`w-full max-w-full ${className}`}>
      <ServiceGrid
        onServiceSelect={onServiceSelect}
        onVoiceServiceRequest={onVoiceServiceRequest}
      />
    </div>
  );
});

ServiceGridContainer.displayName = 'ServiceGridContainer';
