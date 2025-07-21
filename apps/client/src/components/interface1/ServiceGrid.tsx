import React from 'react';
import { SERVICE_CATEGORIES } from '@/types/interface1.types';
import { designSystem } from '@/styles/designSystem';
import { logger } from '@shared/utils/logger';

export const ServiceGrid: React.FC = () => {
  return (
    <div className="w-full max-w-full">
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
                  <div className="text-sm text-gray-300 mt-1">
                    {category.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop View - Fixed grid layout to prevent cutting */}
      <div className="hidden md:block w-full max-w-6xl mx-auto px-6 py-8">
        {/* First row - 5 items */}
        <div className="grid grid-cols-5 gap-4 mb-4">
          {SERVICE_CATEGORIES.slice(0, 5).map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={index}
                className="relative group w-full h-32 flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: designSystem.shadows.card,
                }}
              >
                {/* Icon */}
                <div className="text-white mb-2">
                  <Icon size={28} />
                </div>

                {/* Text */}
                <div className="text-white text-center text-sm font-medium">
                  {category.name}
                </div>

                {/* Hover Overlay with Description */}
                {category.description && (
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-white text-xs text-center rounded-xl">
                    {category.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Second row - remaining items */}
        {SERVICE_CATEGORIES.length > 5 && (
          <div className="grid grid-cols-5 gap-4">
            {SERVICE_CATEGORIES.slice(5).map((category, index) => {
              const Icon = category.icon;
              return (
                <div
                  key={index + 5}
                  className="relative group w-full h-32 flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: designSystem.shadows.card,
                  }}
                >
                  {/* Icon */}
                  <div className="text-white mb-2">
                    <Icon size={28} />
                  </div>

                  {/* Text */}
                  <div className="text-white text-center text-sm font-medium">
                    {category.name}
                  </div>

                  {/* Hover Overlay with Description */}
                  {category.description && (
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-white text-xs text-center rounded-xl">
                      {category.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
