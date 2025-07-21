import { forwardRef } from 'react';
import { ServiceGrid } from '../interface1/ServiceGrid';
import { logger } from '@shared/utils/logger';

interface ServiceGridContainerProps {
  className?: string;
}

export const ServiceGridContainer = forwardRef<
  HTMLDivElement,
  ServiceGridContainerProps
>(({ className = '' }, ref) => {
  return (
    <div ref={ref} className={`w-full max-w-full hidden md:block ${className}`}>
      <ServiceGrid />
    </div>
  );
});

ServiceGridContainer.displayName = 'ServiceGridContainer';
