import { forwardRef } from 'react';
import { ServiceGrid } from '@/components/interface1/ServiceGrid';
import { ServiceCategory } from '@/types/interface1.types';

interface ServiceGridContainerProps {
  className?: string;
  onServiceSelect?: (service: ServiceCategory) => void;
  onVoiceServiceRequest?: (service: ServiceCategory) => Promise<void>;
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
