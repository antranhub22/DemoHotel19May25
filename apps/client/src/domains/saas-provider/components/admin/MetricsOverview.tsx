import * as React from 'react';
/**
 * Metrics Overview Component
 * Platform KPIs and metrics overview
 */

import logger from '@shared/utils/logger';
import { useState } from 'react';
import { usePlatformMetrics } from "../../hooks/usePlatformAdmin";
import { PlatformMetrics } from "../../types/saasProvider.types";

interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  icon: string;
  color: "blue" | "green" | "purple" | "orange" | "red";
  description: string;
}

export const MetricsOverview: React.FC = () => {
  const { metrics, isLoading, fetchGrowthTrends, error } = usePlatformMetrics();
  const [selectedPeriod, setSelectedPeriod] = useState<
    "7d" | "30d" | "90d" | "1y"
  >("30d");

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const getMetricCards = (data: PlatformMetrics): MetricCard[] => [
    {
      title: "Total Tenants",
      value: formatNumber(data.totalTenants),
      change: data.growthRate,
      icon: "🏢",
      color: "blue",
      description: `${data.activeTenants} active, ${data.trialTenants} on trial`,
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(data.monthlyRecurringRevenue),
      change: 12.5, // This would come from growth calculation
      icon: "💰",
      color: "green",
      description: `${formatCurrency(data.totalRevenue)} total revenue`,
    },
    {
      title: "Average Revenue Per User",
      value: formatCurrency(data.averageRevenuePerUser),
      change: 3.2,
      icon: "📈",
      color: "purple",
      description: "Monthly ARPU across all tenants",
    },
    {
      title: "Churn Rate",
      value: `${data.churnRate.toFixed(1)}%`,
      change: -data.churnRate * 0.1, // Negative change is good for churn
      icon: "📉",
      color: data.churnRate > 5 ? "red" : "green",
      description: "Monthly customer churn rate",
    },
    {
      title: "API Calls",
      value: formatNumber(data.totalApiCalls),
      icon: "🔌",
      color: "blue",
      description: "Total API calls this month",
    },
    {
      title: "Voice Calls",
      value: formatNumber(data.totalVoiceCalls),
      icon: "📞",
      color: "orange",
      description: `${formatNumber(data.totalMinutes)} total minutes`,
    },
    {
      title: "System Uptime",
      value: `${data.systemUptime.toFixed(2)}%`,
      icon: "⚡",
      color:
        data.systemUptime >= 99.9
          ? "green"
          : data.systemUptime >= 99
            ? "orange"
            : "red",
      description: "Platform availability this month",
    },
  ];

  const handlePeriodChange = async (period: "7d" | "30d" | "90d" | "1y") => {
    setSelectedPeriod(period);
    try {
      await fetchGrowthTrends(period);
      logger.debug(
        "[MetricsOverview] Growth trends updated for period:",
        period,
      );
    } catch (error) {
      logger.error("[MetricsOverview] Error fetching growth trends:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading platform metrics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <span className="text-red-500 text-xl mr-3">⚠️</span>
          <div>
            <h3 className="text-lg font-medium text-red-800">
              Failed to load metrics
            </h3>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl">📊</span>
        <h3 className="text-lg font-medium text-gray-900 mt-4">
          No metrics available
        </h3>
        <p className="text-gray-600 mt-2">
          Metrics data is not available at this time.
        </p>
      </div>
    );
  }

  const metricCards = getMetricCards(metrics);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            📊 Platform Overview
          </h2>
          <p className="text-gray-600 mt-1">
            Key performance indicators and platform health
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Period:</span>
          <div className="flex rounded-md shadow-sm">
            {(["7d", "30d", "90d", "1y"] as const).map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`
                                    px-3 py-1.5 text-sm font-medium border
                                    ${period === "7d" ? "rounded-l-md" : ""}
                                    ${period === "1y" ? "rounded-r-md" : ""}
                                    ${period !== "7d" ? "border-l-0" : ""}
                                    ${
                                      selectedPeriod === period
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    }
                                    transition-colors
                                `}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {metricCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md 
                                 transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{card.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {card.value}
                  </p>
                </div>
              </div>
            </div>

            {/* Change indicator */}
            {card.change !== undefined && (
              <div className="mt-3">
                <span
                  className={`
                                        inline-flex items-center text-sm font-medium
                                        ${card.change >= 0 ? "text-green-600" : "text-red-600"}
                                    `}
                >
                  {card.change >= 0 ? "↗️" : "↘️"}
                  {formatPercentage(Math.abs(card.change))}
                </span>
                <span className="text-gray-500 text-sm ml-1">
                  vs last period
                </span>
              </div>
            )}

            {/* Description */}
            <p className="text-sm text-gray-500 mt-2">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Feature Adoption */}
      {metrics.featureAdoption &&
        Object.keys(metrics.featureAdoption).length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🎯 Feature Adoption
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(metrics.featureAdoption).map(
                ([feature, data]) => (
                  <div key={feature} className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="transparent"
                          className="text-gray-200"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 28}`}
                          strokeDashoffset={`${2 * Math.PI * 28 * (1 - data.percentage / 100)}`}
                          className="text-blue-600"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-900">
                          {data.percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {feature.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {data.totalUsers} users
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🚀 Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            className="flex items-center justify-center p-4 border border-gray-300 
                                     rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-center">
              <span className="text-2xl block mb-2">👥</span>
              <span className="text-sm font-medium">View Tenants</span>
            </div>
          </button>

          <button
            className="flex items-center justify-center p-4 border border-gray-300 
                                     rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-center">
              <span className="text-2xl block mb-2">📊</span>
              <span className="text-sm font-medium">Generate Report</span>
            </div>
          </button>

          <button
            className="flex items-center justify-center p-4 border border-gray-300 
                                     rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-center">
              <span className="text-2xl block mb-2">⚙️</span>
              <span className="text-sm font-medium">System Health</span>
            </div>
          </button>

          <button
            className="flex items-center justify-center p-4 border border-gray-300 
                                     rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-center">
              <span className="text-2xl block mb-2">🎛️</span>
              <span className="text-sm font-medium">Feature Flags</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetricsOverview;
