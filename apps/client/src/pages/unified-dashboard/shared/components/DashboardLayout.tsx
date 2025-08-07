import React from 'react';
import type { DashboardLayoutProps } from '../types/dashboard';

export const DashboardLayout: React.FC<DashboardLayout> = ({ title, subtitle, gradientFrom, gradientTo, loading = false, children }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div
          className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white p-6 rounded-lg`}
        >
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="opacity-90">Đang tải dữ liệu...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="h-24 bg-gray-200 animate-pulse rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div
        className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white p-6 rounded-lg`}
      >
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="opacity-90">{subtitle}</p>
      </div>

      {/* Content */}
      {children}
    </div>
  );
};
