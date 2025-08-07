import { useAuth } from '@/context/AuthContext';
import React from 'react';
import { FrontDeskDashboard } from './dashboards/FrontDeskDashboard';
import { HotelManagerDashboard } from './dashboards/HotelManagerDashboard';
import { ITManagerDashboard } from './dashboards/ITManagerDashboard';

// Main unified dashboard home component
export const UnifiedDashboardHome: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'front-desk';

  const renderDashboardByRole = () => {
    switch (role) {
      case 'hotel-manager':
        return <HotelManagerDashboard />;
      case 'front-desk':
        return <FrontDeskDashboard />;
      case 'it-manager':
        return <ITManagerDashboard />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Chào mừng đến với Hotel Dashboard
            </h2>
            <p className="text-gray-600">
              Vai trò của bạn chưa được cấu hình. Vui lòng liên hệ quản trị
              viên.
            </p>
          </div>
        );
    }
  };

  return <div className="space-y-6">{renderDashboardByRole()}</div>;
};
