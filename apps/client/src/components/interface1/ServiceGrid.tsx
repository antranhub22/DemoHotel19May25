import React from 'react';
import { SERVICE_CATEGORIES } from '@/types/interface1.types';
import { designSystem } from '@/styles/designSystem';

export const ServiceGrid: React.FC = () => {
  return (
    <div 
      className="hidden md:grid w-full max-w-7xl mx-auto"
      style={{ 
        gridTemplateColumns: 'repeat(5, minmax(280px, 1fr))',
        gridTemplateRows: 'repeat(2, 180px)',
        gap: '24px',
        padding: '32px 24px',
        transformOrigin: 'top center',
        marginTop: '2rem',
        position: 'relative',
        left: '50%',
        transform: 'translateX(-50%) scale(0.65)',
        width: '180%',
        maxWidth: 'none',
        placeItems: 'center'
      }}
    >
      {SERVICE_CATEGORIES.map((category, index) => (
        <div
          key={index}
          className="relative group w-full h-full"
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
            className="text-white group-hover:scale-110 transition-transform"
            style={{
              fontSize: '3rem',
              marginBottom: '12px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {category.icon}
          </div>

          {/* Text Container */}
          <div 
            className="text-white text-center"
            style={{
              fontSize: '18px',
              fontWeight: '500',
              lineHeight: '1.4',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 8px'
            }}
          >
            {category.name}
          </div>

          {/* Description Tooltip */}
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
      ))}
    </div>
  );
}; 