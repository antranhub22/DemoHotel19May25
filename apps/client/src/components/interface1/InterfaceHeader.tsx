import { designSystem } from '@/styles/designSystem';

interface InterfaceHeaderProps {
  title?: string;
  className?: string;
}

export const InterfaceHeader = ({ 
  title = "Speak in Multiple Languages",
  className = ""
}: InterfaceHeaderProps): JSX.Element => {
  return (
    <div className={`text-center space-y-8 ${className}`}>
      {/* Title - Hidden on mobile */}
      <h1 
        className="hidden md:block text-4xl md:text-5xl font-bold text-center text-white mb-8"
        style={{ 
          textShadow: designSystem.shadows.subtle,
          maxWidth: '800px',
          lineHeight: 1.2
        }}
      >
        {title}
      </h1>
    </div>
  );
}; 