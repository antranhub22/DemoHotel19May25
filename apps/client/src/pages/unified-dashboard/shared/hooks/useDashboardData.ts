import { useWebSocketDashboard } from '@/hooks/useWebSocketDashboard';
import { dashboardLogger } from '@/utils/dashboardLogger';
import { useEffect, useState } from 'react';
import type { DashboardData } from '../types/dashboard';

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({
    calls: { total: 0, today: 0, answered: 0, avgDuration: '0 min' },
    requests: { pending: 0, inProgress: 0, completed: 0, totalToday: 0 },
    satisfaction: { rating: 0, responses: 0, trend: '+0.0' },
    system: { uptime: 99.9, responseTime: 0, errors: 0 },
  });
  const [loading, setLoading] = useState(true);

  // ✅ ENHANCEMENT: WebSocket integration with automatic fallback (MEDIUM RISK)
  const {
    status: wsStatus,
    data: wsData,
    forceReconnect: wsReconnect,
    enableFallback: wsEnableFallback,
  } = useWebSocketDashboard({
    enableWebSocket: true, // Enable WebSocket by default
    fallbackPollingInterval: 30000, // 30s polling as fallback
  });

  const fetchDashboardData = async () => {
    // ✅ ENHANCEMENT: Performance tracking (ZERO RISK - just monitoring)
    const fetchStartTime = performance.now();
    let calculationStartTime: number;

    try {
      setLoading(true);

      // ✅ ENHANCEMENT: Log fetch attempt
      const requestStartTime = performance.now();

      // Fetch requests data (EXISTING LOGIC UNCHANGED)
      const requestsResponse = await fetch('/api/staff/requests', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const requestEndTime = performance.now();
      const fetchDuration = requestEndTime - requestStartTime;

      if (requestsResponse.ok) {
        const requests = await requestsResponse.json();

        // ✅ ENHANCEMENT: Track calculation performance
        calculationStartTime = performance.now();

        // Calculate real statistics (EXISTING LOGIC UNCHANGED)
        const today = new Date().toDateString();
        const requestsToday = requests.filter(
          (req: any) => new Date(req.createdAt).toDateString() === today
        );

        const pending = requests.filter(
          (req: any) => req.status === 'Đã ghi nhận'
        ).length;

        const inProgress = requests.filter(
          (req: any) => req.status === 'Đang thực hiện'
        ).length;

        const completed = requests.filter(
          (req: any) => req.status === 'Hoàn thiện'
        ).length;

        const calculationEndTime = performance.now();
        const calculationDuration = calculationEndTime - calculationStartTime;

        // Set data (EXISTING LOGIC UNCHANGED)
        setData({
          calls: {
            total: requests.length,
            today: requestsToday.length,
            answered: requests.length,
            avgDuration: '2.3 min',
          },
          requests: {
            pending,
            inProgress,
            completed,
            totalToday: requestsToday.length,
          },
          satisfaction: {
            rating: 4.7,
            responses: requests.length,
            trend: '+0.2',
          },
          system: { uptime: 99.9, responseTime: 150, errors: 0 },
        });

        // ✅ ENHANCEMENT: Log successful fetch (ZERO RISK)
        dashboardLogger.logDataFetch({
          endpoint: '/api/staff/requests',
          responseTime: fetchDuration,
          dataPoints: requests.length,
          success: true,
          timestamp: new Date().toISOString(),
          userId: localStorage.getItem('userId') || undefined,
        });

        // ✅ ENHANCEMENT: Log performance metrics (ZERO RISK)
        dashboardLogger.logPerformance({
          fetchDuration,
          calculationDuration,
          totalDataPoints: requests.length,
          requestsCount: requests.length,
        });
      } else {
        // ✅ ENHANCEMENT: Log API error response (ZERO RISK)
        dashboardLogger.logDataFetch({
          endpoint: '/api/staff/requests',
          responseTime: fetchDuration,
          dataPoints: 0,
          success: false,
          timestamp: new Date().toISOString(),
          errorDetails: `HTTP ${requestsResponse.status}: ${requestsResponse.statusText}`,
        });

        console.error('Failed to fetch dashboard data: API response not OK', {
          status: requestsResponse.status,
          statusText: requestsResponse.statusText,
        });
      }
    } catch (error) {
      const totalDuration = performance.now() - fetchStartTime;

      // ✅ ENHANCEMENT: Enhanced error logging (ZERO RISK)
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      dashboardLogger.logDataFetch({
        endpoint: '/api/staff/requests',
        responseTime: totalDuration,
        dataPoints: 0,
        success: false,
        timestamp: new Date().toISOString(),
        errorDetails: errorMessage,
      });

      // Keep existing error handling
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ENHANCEMENT: WebSocket data integration (MEDIUM RISK with fallback)
  useEffect(() => {
    // Use WebSocket data when available
    if (wsData && wsStatus.transport !== 'fallback') {
      console.log('📊 Using WebSocket data for dashboard');
      setData(wsData);
      setLoading(false);

      dashboardLogger.logDataFetch({
        endpoint: 'websocket',
        responseTime: 0, // Real-time
        dataPoints: 1,
        success: true,
        timestamp: new Date().toISOString(),
        userId: localStorage.getItem('userId') || undefined,
      });

      return; // Don't fall through to API fetch
    }

    // WebSocket not available or using fallback - use original logic
    if (wsStatus.transport === 'fallback' || !wsStatus.connected) {
      console.log('🔄 WebSocket not available, using API fallback');
      fetchDashboardData();
    }
  }, [wsData, wsStatus.connected, wsStatus.transport]);

  // ✅ ENHANCEMENT: Fallback polling only when WebSocket fails
  useEffect(() => {
    // Only start polling if WebSocket is not working
    if (
      wsStatus.transport === 'fallback' ||
      wsStatus.connectionState === 'failed'
    ) {
      // Start with immediate fetch
      fetchDashboardData();

      // Set up polling interval for fallback
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [wsStatus.transport, wsStatus.connectionState]);

  // ✅ ENHANCEMENT: Initial load regardless of WebSocket status
  useEffect(() => {
    // Always fetch initial data to ensure dashboard works
    fetchDashboardData();
  }, []);

  // ✅ ENHANCEMENT: Enhanced return with WebSocket status and controls
  return {
    data,
    loading,
    refresh: fetchDashboardData,
    // WebSocket status and controls
    websocket: {
      status: wsStatus,
      reconnect: wsReconnect,
      enableFallback: wsEnableFallback,
      isRealTime: wsStatus.connected && wsStatus.transport !== 'fallback',
    },
  };
};
