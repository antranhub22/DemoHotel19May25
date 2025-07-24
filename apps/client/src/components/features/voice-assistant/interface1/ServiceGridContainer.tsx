import { forwardRef } from 'react';
import { ServiceItem } from '@/types/interface1.types';
import { ServiceGrid } from './ServiceGrid';

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
