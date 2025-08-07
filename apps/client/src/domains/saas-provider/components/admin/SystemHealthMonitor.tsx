import * as React from "react";
/**
 * System Health Monitor
 * Monitor platform health, services, and alerts
 */

import logger from "@shared/utils/logger";
import { useState } from "react";
import { useSystemHealth } from "../../hooks/usePlatformAdmin";

export const SystemHealthMonitor: React.FC = () => {
  const { health, isLoading, acknowledgeAlert, error } = useSystemHealth();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const getStatusColor = (
    status: "operational" | "degraded" | "outage",
  ): string => {
    switch (status) {
      case "operational":
        return "text-green-600 bg-green-50";
      case "degraded":
        return "text-yellow-600 bg-yellow-50";
      case "outage":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (
    status: "operational" | "degraded" | "outage",
  ): string => {
    switch (status) {
      case "operational":
        return "✅";
      case "degraded":
        return "⚠️";
      case "outage":
        return "❌";
      default:
        return "⚪";
    }
  };

  const getAlertSeverityColor = (
    severity: "info" | "warning" | "critical",
  ): string => {
    switch (severity) {
      case "info":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getAlertIcon = (severity: "info" | "warning" | "critical"): string => {
    switch (severity) {
      case "info":
        return "ℹ️";
      case "warning":
        return "⚠️";
      case "critical":
        return "🚨";
      default:
        return "📢";
    }
  };

  const formatUptime = (uptime: number): string => {
    return `${uptime.toFixed(3)}%`;
  };

  const formatResponseTime = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId);
      logger.debug("[SystemHealthMonitor] Alert acknowledged:", alertId);
    } catch (error) {
      logger.error("[SystemHealthMonitor] Error acknowledging alert:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading system health...</span>
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
              Failed to load system health
            </h3>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl">⚡</span>
        <h3 className="text-lg font-medium text-gray-900 mt-4">
          No health data available
        </h3>
        <p className="text-gray-600 mt-2">
          System health monitoring is not available at this time.
        </p>
      </div>
    );
  }

  const unacknowledgedAlerts = health.alerts.filter(
    (alert) => !alert.acknowledged,
  );
  const criticalAlerts = unacknowledgedAlerts.filter(
    (alert) => alert.severity === "critical",
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            ⚡ System Health Monitor
          </h2>
          <p className="text-gray-600 mt-1">
            Platform infrastructure and service status
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              health.status === "operational"
                ? "bg-green-100 text-green-800"
                : health.status === "degraded"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {getStatusIcon(health.status)} {health.status.toUpperCase()}
          </div>

          <div className="text-sm text-gray-600">
            Uptime:{" "}
            <span className="font-medium">{formatUptime(health.uptime)}</span>
          </div>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-center">
            <span className="text-red-500 text-xl mr-3">🚨</span>
            <div>
              <h3 className="text-lg font-medium text-red-800">
                {criticalAlerts.length} Critical Alert
                {criticalAlerts.length !== 1 ? "s" : ""}
              </h3>
              <p className="text-red-600 mt-1">
                Immediate attention required for system stability.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Infrastructure CPU */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CPU Usage</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatPercentage(health.infrastructure.cpu)}
              </p>
            </div>
            <span className="text-2xl">🖥️</span>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  health.infrastructure.cpu > 80
                    ? "bg-red-500"
                    : health.infrastructure.cpu > 60
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }`}
                style={{ width: `${health.infrastructure.cpu}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Infrastructure Memory */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Memory Usage</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatPercentage(health.infrastructure.memory)}
              </p>
            </div>
            <span className="text-2xl">💾</span>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  health.infrastructure.memory > 80
                    ? "bg-red-500"
                    : health.infrastructure.memory > 60
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }`}
                style={{ width: `${health.infrastructure.memory}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Database */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                DB Query Latency
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatResponseTime(
                  health.infrastructure.database.queryLatency,
                )}
              </p>
            </div>
            <span className="text-2xl">🗄️</span>
          </div>
          <div className="mt-3">
            <p className="text-sm text-gray-600">
              {health.infrastructure.database.activeConnections} active
              connections
            </p>
          </div>
        </div>

        {/* Storage */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Storage Usage</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatPercentage(health.infrastructure.storage)}
              </p>
            </div>
            <span className="text-2xl">💿</span>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  health.infrastructure.storage > 80
                    ? "bg-red-500"
                    : health.infrastructure.storage > 60
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }`}
                style={{ width: `${health.infrastructure.storage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            🔧 Service Status
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(health.services).map(
              ([serviceName, serviceData]) => (
                <div
                  key={serviceName}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedService === serviceName
                      ? "ring-2 ring-blue-500"
                      : ""
                  } ${getStatusColor(serviceData.status)}`}
                  onClick={() =>
                    setSelectedService(
                      selectedService === serviceName ? null : serviceName,
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span>{getStatusIcon(serviceData.status)}</span>
                        <h4 className="font-medium capitalize">
                          {serviceName.replace(/([A-Z])/g, " $1").trim()}
                        </h4>
                      </div>
                      <p className="text-sm mt-1">
                        {formatResponseTime(serviceData.responseTime)} response
                      </p>
                      <p className="text-xs mt-1">
                        {formatPercentage(serviceData.errorRate)} error rate
                      </p>
                    </div>
                  </div>

                  {selectedService === serviceName && (
                    <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                      <p className="text-xs">
                        Last check: {serviceData.lastCheck.toLocaleTimeString()}
                      </p>
                      <p className="text-xs mt-1">
                        Status:{" "}
                        <span className="font-medium">
                          {serviceData.status}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              🚨 Active Alerts
            </h3>
            <span className="text-sm text-gray-600">
              {unacknowledgedAlerts.length} unacknowledged
            </span>
          </div>
        </div>

        {health.alerts.length === 0 ? (
          <div className="p-6 text-center">
            <span className="text-4xl">🎉</span>
            <h4 className="text-lg font-medium text-gray-900 mt-2">
              No Active Alerts
            </h4>
            <p className="text-gray-600 mt-1">
              All systems are operating normally.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {health.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-6 border-l-4 ${getAlertSeverityColor(alert.severity)} ${
                  alert.acknowledged ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span>{getAlertIcon(alert.severity)}</span>
                      <h4 className="font-medium">{alert.title}</h4>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          alert.severity === "critical"
                            ? "bg-red-100 text-red-800"
                            : alert.severity === "warning"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </div>

                    <p className="text-sm mt-1">{alert.description}</p>

                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                      <span>Service: {alert.service}</span>
                      <span>•</span>
                      <span>{alert.timestamp.toLocaleString()}</span>
                      {alert.resolvedAt && (
                        <>
                          <span>•</span>
                          <span className="text-green-600">
                            Resolved: {alert.resolvedAt.toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {!alert.acknowledged && !alert.resolvedAt && (
                    <button
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      className="ml-4 px-3 py-1 text-sm text-gray-600 border border-gray-300 
                                                     rounded hover:bg-gray-50 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemHealthMonitor;
