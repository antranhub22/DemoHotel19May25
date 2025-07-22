import { ServiceGrid } from '../interface1/ServiceGrid';
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
