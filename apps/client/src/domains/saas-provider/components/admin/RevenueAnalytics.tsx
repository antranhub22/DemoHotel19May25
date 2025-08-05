/**
 * Revenue Analytics Component
 * Financial metrics, trends, and reports
 */

import { logger } from "@shared/utils/logger";
import React, { useState } from "react";
import { usePlatformAdmin } from "../../hooks/usePlatformAdmin";

type ReportPeriod = "7d" | "30d" | "90d" | "1y" | "custom";

export const RevenueAnalytics: React.FC = () => {
  const {
    revenueReport,
    isLoadingReport,
    generateRevenueReport,
    exportData,
    error,
  } = usePlatformAdmin();

  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>("30d");
  const [customPeriod, setCustomPeriod] = useState({
    start: "",
    end: "",
  });
  const [isExporting, setIsExporting] = useState(false);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const getPeriodDates = (
    period: ReportPeriod,
  ): { start: Date; end: Date } | null => {
    const now = new Date();
    const end = new Date(now);
    let start: Date;

    switch (period) {
      case "7d":
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case "custom":
        if (!customPeriod.start || !customPeriod.end) return null;
        return {
          start: new Date(customPeriod.start),
          end: new Date(customPeriod.end),
        };
      default:
        return null;
    }

    return { start, end };
  };

  const handleGenerateReport = async () => {
    const dates = getPeriodDates(selectedPeriod);
    if (!dates) {
      logger.error(
        "[RevenueAnalytics] Invalid date range for report generation",
      );
      return;
    }

    try {
      await generateRevenueReport(dates);
      logger.debug("[RevenueAnalytics] Revenue report generated successfully");
    } catch (error) {
      logger.error(
        "[RevenueAnalytics] Error generating revenue report:",
        error,
      );
    }
  };

  const handleExport = async (format: "csv" | "json") => {
    setIsExporting(true);
    try {
      await exportData("revenue", format);
      logger.debug("[RevenueAnalytics] Data exported successfully:", format);
    } catch (error) {
      logger.error("[RevenueAnalytics] Error exporting data:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const getChangeColor = (value: number): string => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getChangeIcon = (value: number): string => {
    if (value > 0) return "📈";
    if (value < 0) return "📉";
    return "➡️";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            💰 Revenue Analytics
          </h2>
          <p className="text-gray-600 mt-1">
            Financial metrics, trends, and revenue reports
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleExport("csv")}
            disabled={isExporting || !revenueReport}
            className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md 
                                 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            📊 Export CSV
          </button>

          <button
            onClick={() => handleExport("json")}
            disabled={isExporting || !revenueReport}
            className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md 
                                 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            📄 Export JSON
          </button>
        </div>
      </div>

      {/* Period Selection & Report Generation */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📈 Generate Revenue Report
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) =>
                setSelectedPeriod(e.target.value as ReportPeriod)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none 
                                     focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
              <option value="custom">Custom range</option>
            </select>
          </div>

          {selectedPeriod === "custom" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customPeriod.start}
                  onChange={(e) =>
                    setCustomPeriod((prev) => ({
                      ...prev,
                      start: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none 
                                             focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={customPeriod.end}
                  onChange={(e) =>
                    setCustomPeriod((prev) => ({
                      ...prev,
                      end: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none 
                                             focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-4">
          <button
            onClick={handleGenerateReport}
            disabled={
              isLoadingReport ||
              (selectedPeriod === "custom" &&
                (!customPeriod.start || !customPeriod.end))
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                                 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isLoadingReport ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>📊</span>
                <span>Generate Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingReport && (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Generating revenue report...</span>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <span className="text-red-500 text-xl mr-3">⚠️</span>
            <div>
              <h3 className="text-lg font-medium text-red-800">
                Failed to load revenue data
              </h3>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Report */}
      {revenueReport && !isLoadingReport && (
        <div className="space-y-6">
          {/* Report Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Revenue Report
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {revenueReport.period.start.toLocaleDateString()} -{" "}
                  {revenueReport.period.end.toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(revenueReport.totalRevenue)}
                </p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    New Revenue
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {formatCurrency(revenueReport.newRevenue)}
                  </p>
                </div>
                <span className="text-2xl">💰</span>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expansion</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {formatCurrency(revenueReport.expansion)}
                  </p>
                </div>
                <span className="text-2xl">📈</span>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Churned</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {formatCurrency(revenueReport.churned)}
                  </p>
                </div>
                <span className="text-2xl">📉</span>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Net Revenue
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(
                      revenueReport.newRevenue +
                        revenueReport.expansion -
                        revenueReport.churned,
                    )}
                  </p>
                </div>
                <span className="text-2xl">💵</span>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown by Plan */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Revenue by Subscription Plan
            </h3>

            <div className="space-y-4">
              {revenueReport.breakdown.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        item.plan === "enterprise"
                          ? "bg-orange-500"
                          : item.plan === "premium"
                            ? "bg-purple-500"
                            : item.plan === "basic"
                              ? "bg-green-500"
                              : "bg-blue-500"
                      }`}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {item.plan}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.subscribers} subscribers
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(item.revenue)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {(
                        (item.revenue / revenueReport.totalRevenue) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cohort Analysis */}
          {revenueReport.cohortAnalysis.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                👥 Cohort Analysis
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-600">
                        Cohort
                      </th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">
                        Month 0
                      </th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">
                        Month 1
                      </th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">
                        Month 2
                      </th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">
                        Month 3
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueReport.cohortAnalysis
                      .slice(0, 6)
                      .map((cohort, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 px-3 font-medium text-gray-900">
                            {cohort.cohort}
                          </td>
                          {cohort.retention
                            .slice(0, 4)
                            .map((retention, monthIndex) => (
                              <td
                                key={monthIndex}
                                className="py-2 px-3 text-right"
                              >
                                <span
                                  className={`
                                                            px-2 py-1 rounded text-xs font-medium
                                                            ${
                                                              retention >= 80
                                                                ? "bg-green-100 text-green-800"
                                                                : retention >=
                                                                    60
                                                                  ? "bg-yellow-100 text-yellow-800"
                                                                  : retention >=
                                                                      40
                                                                    ? "bg-orange-100 text-orange-800"
                                                                    : "bg-red-100 text-red-800"
                                                            }
                                                        `}
                                >
                                  {retention.toFixed(0)}%
                                </span>
                              </td>
                            ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Data State */}
      {!revenueReport && !isLoadingReport && !error && (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="text-center">
            <span className="text-6xl">📊</span>
            <h3 className="text-lg font-medium text-gray-900 mt-4">
              No revenue report generated
            </h3>
            <p className="text-gray-600 mt-2">
              Select a period and generate your first revenue report.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueAnalytics;
