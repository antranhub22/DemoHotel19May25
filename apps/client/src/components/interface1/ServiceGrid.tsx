import React from 'react';
import { SERVICE_CATEGORIES } from '@/types/interface1.types';
import { designSystem } from '@/styles/designSystem';

export const ServiceGrid: React.FC = () => {
  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Mobile View - Vertical scroll list */}
      <div className="block md:hidden space-y-4 px-4 py-6">
        {SERVICE_CATEGORIES.map((category, index) => {
          const Icon = category.icon;
          return (
            <div
              key={index}
              className="flex items-center space-x-4 p-4 rounded-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: designSystem.transitions.normal,
                cursor: 'pointer',
                boxShadow: designSystem.shadows.card,
              }}
            >
              <div className="text-white flex-shrink-0">
                <Icon size={32} />
              </div>
              <div className="text-white">
                <div className="font-medium text-lg">{category.name}</div>
                {category.description && (
                  <div className="text-sm text-gray-300 mt-1">{category.description}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop View - Responsive grid */}
      <div 
        className="hidden md:grid w-full mx-auto gap-6 p-6"
        style={{ 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          maxWidth: '1400px'
        }}
      >
        {SERVICE_CATEGORIES.map((category, index) => {
          const Icon = category.icon;
          return (
            <div
              key={index}
              className="relative group aspect-square min-h-[160px]"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: designSystem.borderRadius.xl,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: designSystem.transitions.normal,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px',
                boxShadow: designSystem.shadows.card,
                overflow: 'hidden'
              }}
            >
              {/* Icon Container */}
              <div 
                className="text-white group-hover:scale-110 transition-transform mb-3"
                style={{
                  fontSize: '2.5rem',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon size={40} />
              </div>

              {/* Text Container */}
              <div 
                className="text-white text-center"
                style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  lineHeight: '1.4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 8px'
                }}
              >
                {category.name}
              </div>

              {/* Hover Overlay with Description */}
              {category.description && (
                <div 
                  className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 text-white text-sm text-center"
                  style={{
                    borderRadius: designSystem.borderRadius.xl,
                    transition: designSystem.transitions.normal
                  }}
                >
                  {category.description}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}; 