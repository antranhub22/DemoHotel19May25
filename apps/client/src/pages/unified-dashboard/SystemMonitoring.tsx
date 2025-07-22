import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import {
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  Database,
  Server,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Globe,
  Shield,
  RefreshCw,
  Download,
  Bell,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Info,
  Terminal,
  Eye,
  Settings,
} from 'lucide-react';
import { logger } from '@shared/utils/logger';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Types
interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
    processes: number;
  };
  memory: {
    used: number;
    total: number;
    available: number;
    usage: number;
  };
  disk: {
    used: number;
    total: number;
    available: number;
    usage: number;
  };
  network: {
    downloadSpeed: number;
    uploadSpeed: number;
    latency: number;
    status: string;
  };
  database: {
    connections: number;
    queries: number;
    responseTime: number;
    status: string;
  };
  services: {
    name: string;
    status: 'running' | 'stopped' | 'error';
    uptime: string;
    memory: number;
    cpu: number;
  }[];
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  service: string;
  message: string;
  details?: string;
}

// Mock data
const mockMetrics: SystemMetrics = {
  cpu: {
    usage: 45.2,
    cores: 4,
    temperature: 62,
    processes: 156,
  },
  memory: {
    used: 6.8,
    total: 16,
    available: 9.2,
    usage: 42.5,
  },
  disk: {
    used: 85.4,
    total: 500,
    available: 414.6,
    usage: 17.1,
  },
  network: {
    downloadSpeed: 125.5,
    uploadSpeed: 25.2,
    latency: 12,
    status: 'connected',
  },
  database: {
    connections: 15,
    queries: 1250,
    responseTime: 45,
    status: 'healthy',
  },
  services: [
    {
      name: 'Hotel API',
      status: 'running',
      uptime: '15d 4h 23m',
      memory: 256,
      cpu: 12.5,
    },
    {
      name: 'Database',
      status: 'running',
      uptime: '15d 4h 23m',
      memory: 512,
      cpu: 8.2,
    },
    {
      name: 'Web Server',
      status: 'running',
      uptime: '15d 4h 23m',
      memory: 128,
      cpu: 5.1,
    },
    {
      name: 'Socket Server',
      status: 'running',
      uptime: '15d 4h 23m',
      memory: 64,
      cpu: 3.8,
    },
    {
      name: 'Email Service',
      status: 'error',
      uptime: '0d 0h 0m',
      memory: 0,
      cpu: 0,
    },
  ],
};

const mockAlerts: SystemAlert[] = [
  {
    id: '1',
    type: 'error',
    title: 'Email Service Down',
    message: 'Email service has been down for 2 hours',
    timestamp: '2024-01-15T10:30:00Z',
    resolved: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'High Memory Usage',
    message: 'System memory usage is above 80%',
    timestamp: '2024-01-15T09:15:00Z',
    resolved: false,
  },
  {
    id: '3',
    type: 'info',
    title: 'Database Backup Completed',
    message: 'Daily database backup completed successfully',
    timestamp: '2024-01-15T02:00:00Z',
    resolved: true,
  },
];

const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: '2024-01-15T10:35:22Z',
    level: 'ERROR',
    service: 'EmailService',
    message: 'Failed to connect to SMTP server',
    details: 'Connection timeout after 30 seconds',
  },
  {
    id: '2',
    timestamp: '2024-01-15T10:30:15Z',
    level: 'WARN',
    service: 'HotelAPI',
    message: 'High response time detected',
    details: 'Average response time: 2.5s (threshold: 1s)',
  },
  {
    id: '3',
    timestamp: '2024-01-15T10:25:08Z',
    level: 'INFO',
    service: 'Database',
    message: 'Query executed successfully',
    details: 'SELECT * FROM requests - 156 rows returned',
  },
  {
    id: '4',
    timestamp: '2024-01-15T10:20:03Z',
    level: 'DEBUG',
    service: 'WebServer',
    message: 'Static file served',
    details: 'GET /assets/logo.png - 200 OK',
  },
];

// Performance data for charts
const performanceData = [
  { time: '00:00', cpu: 35, memory: 40, disk: 15 },
  { time: '04:00', cpu: 28, memory: 35, disk: 15 },
  { time: '08:00', cpu: 45, memory: 50, disk: 18 },
  { time: '12:00', cpu: 65, memory: 60, disk: 22 },
  { time: '16:00', cpu: 55, memory: 58, disk: 20 },
  { time: '20:00', cpu: 42, memory: 45, disk: 17 },
  { time: '24:00', cpu: 35, memory: 40, disk: 15 },
];

// System status component
const SystemStatus = ({ metrics }: { metrics: SystemMetrics }) => {
  const getStatusColor = (usage: number) => {
    if (usage < 50) {return 'text-green-600';}
    if (usage < 80) {return 'text-yellow-600';}
    return 'text-red-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
      case 'connected':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'stopped':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* CPU */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-blue-500" />
              <span className="font-medium">CPU</span>
            </div>
            <span
              className={cn(
                'text-lg font-bold',
                getStatusColor(metrics.cpu.usage)
              )}
            >
              {metrics.cpu.usage}%
            </span>
          </div>
          <div className="text-sm text-gray-500 space-y-1">
            <div>Cores: {metrics.cpu.cores}</div>
            <div>Temperature: {metrics.cpu.temperature}°C</div>
            <div>Processes: {metrics.cpu.processes}</div>
          </div>
        </CardContent>
      </Card>

      {/* Memory */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-green-500" />
              <span className="font-medium">Memory</span>
            </div>
            <span
              className={cn(
                'text-lg font-bold',
                getStatusColor(metrics.memory.usage)
              )}
            >
              {metrics.memory.usage}%
            </span>
          </div>
          <div className="text-sm text-gray-500 space-y-1">
            <div>Used: {metrics.memory.used}GB</div>
            <div>Total: {metrics.memory.total}GB</div>
            <div>Available: {metrics.memory.available}GB</div>
          </div>
        </CardContent>
      </Card>

      {/* Disk */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-purple-500" />
              <span className="font-medium">Disk</span>
            </div>
            <span
              className={cn(
                'text-lg font-bold',
                getStatusColor(metrics.disk.usage)
              )}
            >
              {metrics.disk.usage}%
            </span>
          </div>
          <div className="text-sm text-gray-500 space-y-1">
            <div>Used: {metrics.disk.used}GB</div>
            <div>Total: {metrics.disk.total}GB</div>
            <div>Available: {metrics.disk.available}GB</div>
          </div>
        </CardContent>
      </Card>

      {/* Network */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Network</span>
            </div>
            {getStatusIcon(metrics.network.status)}
          </div>
          <div className="text-sm text-gray-500 space-y-1">
            <div>Download: {metrics.network.downloadSpeed} Mbps</div>
            <div>Upload: {metrics.network.uploadSpeed} Mbps</div>
            <div>Latency: {metrics.network.latency}ms</div>
          </div>
        </CardContent>
      </Card>

      {/* Database */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-500" />
              <span className="font-medium">Database</span>
            </div>
            {getStatusIcon(metrics.database.status)}
          </div>
          <div className="text-sm text-gray-500 space-y-1">
            <div>Connections: {metrics.database.connections}</div>
            <div>Queries: {metrics.database.queries}</div>
            <div>Response: {metrics.database.responseTime}ms</div>
          </div>
        </CardContent>
      </Card>

      {/* Services Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-orange-500" />
              <span className="font-medium">Services</span>
            </div>
            <span className="text-lg font-bold text-green-600">
              {metrics.services.filter(s => s.status === 'running').length}/
              {metrics.services.length}
            </span>
          </div>
          <div className="text-sm text-gray-500 space-y-1">
            <div>
              Running:{' '}
              {metrics.services.filter(s => s.status === 'running').length}
            </div>
            <div>
              Stopped:{' '}
              {metrics.services.filter(s => s.status === 'stopped').length}
            </div>
            <div>
              Error: {metrics.services.filter(s => s.status === 'error').length}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Alerts component
const SystemAlerts = ({ alerts }: { alerts: SystemAlert[] }) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const unresolvedAlerts = alerts.filter(alert => !alert.resolved);

  return (
    <div className="space-y-3">
      {unresolvedAlerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
          <p>Không có cảnh báo nào</p>
        </div>
      ) : (
        unresolvedAlerts.map(alert => (
          <div
            key={alert.id}
            className={cn('border rounded-lg p-4', getAlertColor(alert.type))}
          >
            <div className="flex items-start gap-3">
              {getAlertIcon(alert.type)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium">{alert.title}</h4>
                  <span className="text-sm text-gray-500">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{alert.message}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// Services component
const ServicesTable = ({
  services,
}: {
  services: SystemMetrics['services'];
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-green-100 text-green-800">Running</Badge>;
      case 'stopped':
        return <Badge className="bg-gray-100 text-gray-800">Stopped</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3">Service</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Uptime</th>
            <th className="text-left p-3">Memory</th>
            <th className="text-left p-3">CPU</th>
            <th className="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service, index) => (
            <tr key={index} className="border-b hover:bg-gray-50">
              <td className="p-3 font-medium">{service.name}</td>
              <td className="p-3">{getStatusBadge(service.status)}</td>
              <td className="p-3 text-sm text-gray-600">{service.uptime}</td>
              <td className="p-3 text-sm">{service.memory}MB</td>
              <td className="p-3 text-sm">{service.cpu}%</td>
              <td className="p-3">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Logs component
const SystemLogs = ({ logs }: { logs: LogEntry[] }) => {
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      case 'WARN':
        return 'bg-yellow-100 text-yellow-800';
      case 'INFO':
        return 'bg-blue-100 text-blue-800';
      case 'DEBUG':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-2">
      {logs.map(log => (
        <div key={log.id} className="border rounded-lg p-3 hover:bg-gray-50">
          <div className="flex items-start gap-3">
            <Badge
              variant="outline"
              className={cn('text-xs', getLevelColor(log.level))}
            >
              {log.level}
            </Badge>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{log.service}</span>
                <span className="text-xs text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-700">{log.message}</p>
              {log.details && (
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  {log.details}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Main System Monitoring component
export const SystemMonitoring: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SystemMetrics>(mockMetrics);
  const [alerts, setAlerts] = useState<SystemAlert[]>(mockAlerts);
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch system metrics
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setMetrics(mockMetrics);
        setAlerts(mockAlerts);
        setLogs(mockLogs);
        setLoading(false);
      }, 1000);
    } catch (error) {
      logger.error('Failed to fetch metrics:', 'Component', error);
      setLoading(false);
    }
  };

  // Auto refresh metrics every 30 seconds
  useEffect(() => {
    fetchMetrics();

    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Giám sát hệ thống</h1>
          <p className="text-gray-600">
            Theo dõi hiệu suất, trạng thái và logs hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50' : ''}
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Auto ON' : 'Auto OFF'}
          </Button>
          <Button variant="outline" onClick={fetchMetrics} disabled={loading}>
            <RefreshCw
              className={cn('h-4 w-4 mr-2', loading && 'animate-spin')}
            />
            Làm mới
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* System Status Cards */}
      <SystemStatus metrics={metrics} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
          <TabsTrigger value="alerts">Cảnh báo</TabsTrigger>
          <TabsTrigger value="services">Dịch vụ</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hiệu suất hệ thống 24h</CardTitle>
              <CardDescription>CPU, Memory và Disk usage</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="cpu"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="memory"
                    stroke="#82ca9d"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="disk"
                    stroke="#ffc658"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Cảnh báo hệ thống
              </CardTitle>
              <CardDescription>
                {alerts.filter(a => !a.resolved).length} cảnh báo chưa xử lý
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemAlerts alerts={alerts} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dịch vụ hệ thống</CardTitle>
              <CardDescription>
                Trạng thái và hiệu suất các dịch vụ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ServicesTable services={metrics.services} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                System Logs
              </CardTitle>
              <CardDescription>Logs hệ thống gần đây</CardDescription>
            </CardHeader>
            <CardContent>
              <SystemLogs logs={logs} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
