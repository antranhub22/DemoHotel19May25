import * as React from 'react';
/**
 * Platform Admin Dashboard
 * Main dashboard for SaaS platform administration
 */

import logger from '@shared/utils/logger';
import { useState } from 'react';
import { usePlatformAdmin } from "../../hooks/usePlatformAdmin";
import { FeatureRolloutManager } from './FeatureRolloutManager.tsx';
import { MetricsOverview } from './MetricsOverview.tsx';
import { RevenueAnalytics } from './RevenueAnalytics.tsx';
import { SystemHealthMonitor } from './SystemHealthMonitor.tsx';
import { TenantManagementPanel } from './TenantManagementPanel.tsx';

type TabType = "overview" | "tenants" | "health" | "features" | "analytics";

interface Tab {
  id: TabType;
  label: string;
  icon: string;
  description: string;
}

const TABS: Tab[] = [
  {
    id: "overview",
    label: "Overview",
    icon: "📊",
    description: "Platform metrics and KPIs",
  },
  {
    id: "tenants",
    label: "Tenants",
    icon: "🏢",
    description: "Manage hotel tenants",
  },
  {
    id: "health",
    label: "System Health",
    icon: "⚡",
    description: "Monitor system status",
  },
  {
    id: "features",
    label: "Feature Flags",
    icon: "🚩",
    description: "Manage feature rollouts",
  },
  {
    id: "analytics",
    label: "Revenue Analytics",
    icon: "💰",
    description: "Financial reports and trends",
  },
];

export const PlatformAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const { error, clearError } = usePlatformAdmin();

  const handleTabChange = (tabId: TabType) => {
    logger.debug("[PlatformAdminDashboard] Tab changed to:", tabId);
    setActiveTab(tabId);
    clearError(); // Clear any previous errors when switching tabs
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <MetricsOverview />;
      case "tenants":
        return <TenantManagementPanel />;
      case "health":
        return <SystemHealthMonitor />;
      case "features":
        return <FeatureRolloutManager />;
      case "analytics":
        return <RevenueAnalytics />;
      default:
        return <MetricsOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🏰 DemoHotel Platform Admin
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                SaaS Platform Management Dashboard
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>Platform Online</span>
              </div>

              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 
                                         border border-gray-300 rounded-md hover:bg-gray-50
                                         transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Global Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <strong>Error:</strong> {error}
                </p>
              </div>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="px-6">
          <div className="flex space-x-8">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                                    group relative py-4 px-1 border-b-2 font-medium text-sm
                                    transition-all duration-200
                                    ${
                                      activeTab === tab.id
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }
                                `}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </div>

                {/* Tooltip */}
                <div
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                                              invisible group-hover:visible opacity-0 group-hover:opacity-100
                                              transition-all duration-200 z-10"
                >
                  <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    {tab.description}
                    <div
                      className="absolute top-full left-1/2 transform -translate-x-1/2 
                                                      w-0 h-0 border-l-4 border-r-4 border-t-4 
                                                      border-transparent border-t-gray-900"
                    ></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Tab Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-6 px-6">{renderTabContent()}</div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>© 2024 DemoHotel Platform</span>
              <span>•</span>
              <span>Admin Dashboard v2.0</span>
            </div>

            <div className="flex items-center space-x-4">
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
              <span>•</span>
              <a
                href="/docs/admin"
                className="text-blue-600 hover:text-blue-800"
                target="_blank"
                rel="noopener noreferrer"
              >
                📚 Documentation
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PlatformAdminDashboard;
