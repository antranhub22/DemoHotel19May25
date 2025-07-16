import { forwardRef } from 'react';
import { ServiceGrid } from '../interface1/ServiceGrid';

interface ServiceGridContainerProps {
  className?: string;
}

export const ServiceGridContainer = forwardRef<HTMLDivElement, ServiceGridContainerProps>(
  ({ className = "" }, ref) => {
    return (
      <div ref={ref} className={`w-full max-w-full ${className}`}>
        <ServiceGrid />
      </div>
    );
  }
);

ServiceGridContainer.displayName = 'ServiceGridContainer'; 