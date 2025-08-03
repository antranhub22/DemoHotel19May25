import {
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Server,
  Database,
  Globe,
  Shield,
  FileText,
  Activity,
  TrendingUp,
  BarChart3,
  Eye,
  Monitor,
  HardDrive,
  Wifi,
  Zap,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { logger } from '@shared/utils/logger';

// Types
interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  module: string;
  message: string;
  details?: string;
  requestId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  duration?: number;
  statusCode?: number;
  endpoint?: string;
}

interface LogStats {
  total: number;
  byLevel: Record<string, number>;
  byModule: Record<string, number>;
  recentErrors: number;
  averageResponseTime: number;
  errorRate: number;
}

interface LogFilter {
  level: string;
  module: string;
  startTime: string;
  endTime: string;
  search: string;
  requestId: string;
  userId: string;
  ip: string;
}

// Mock data
const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: '2024-01-15T15:30:25.123Z',
    level: 'info',
    module: 'auth',
    message: 'User login successful',
    details: 'User authenticated successfully with email',
    requestId: 'req_123456',
    userId: 'user_001',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    duration: 125,
    statusCode: 200,
    endpoint: '/api/auth/login',
  },
  {
    id: '2',
    timestamp: '2024-01-15T15:29:45.456Z',
    level: 'error',
    module: 'database',
    message: 'Connection timeout',
    details:
      'Database connection pool exhausted, unable to acquire connection within timeout',
    requestId: 'req_123455',
    ip: '192.168.1.101',
    duration: 5000,
    statusCode: 500,
    endpoint: '/api/staff/requests',
  },
  {
    id: '3',
    timestamp: '2024-01-15T15:28:15.789Z',
    level: 'warn',
    module: 'api',
    message: 'Rate limit exceeded',
    details: 'Client has exceeded rate limit of 100 requests per minute',
    requestId: 'req_123454',
    ip: '192.168.1.102',
    duration: 1,
    statusCode: 429,
    endpoint: '/api/staff/requests',
  },
  {
    id: '4',
    timestamp: '2024-01-15T15:27:30.012Z',
    level: 'debug',
    module: 'websocket',
    message: 'WebSocket connection established',
    details: 'New WebSocket connection from client',
    requestId: 'ws_123453',
    ip: '192.168.1.103',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  },
  {
    id: '5',
    timestamp: '2024-01-15T15:26:45.345Z',
    level: 'info',
    module: 'email',
    message: 'Email notification sent',
    details: 'Daily report email sent to admin@hotel.com',
    requestId: 'email_123452',
    duration: 890,
    statusCode: 200,
  },
  {
    id: '6',
    timestamp: '2024-01-15T15:25:20.678Z',
    level: 'error',
    module: 'ai',
    message: 'OpenAI API call failed',
    details: 'OpenAI API returned 503 Service Unavailable',
    requestId: 'req_123451',
    ip: '192.168.1.100',
    duration: 2000,
    statusCode: 503,
    endpoint: '/api/ai/chat',
  },
  {
    id: '7',
    timestamp: '2024-01-15T15:24:55.901Z',
    level: 'info',
    module: 'backup',
    message: 'Backup completed successfully',
    details: 'Database backup completed, size: 2.1GB',
    duration: 45000,
    statusCode: 200,
  },
  {
    id: '8',
    timestamp: '2024-01-15T15:23:10.234Z',
    level: 'warn',
    module: 'security',
    message: 'Failed login attempt',
    details: 'User attempted login with incorrect credentials',
    requestId: 'req_123450',
    userId: 'user_002',
    ip: '192.168.1.104',
    userAgent: 'curl/7.68.0',
    duration: 100,
    statusCode: 401,
    endpoint: '/api/auth/login',
  },
];

const mockStats: LogStats = {
  total: 15420,
  byLevel: {
    debug: 3240,
    info: 8950,
    warn: 2100,
    error: 1050,
    fatal: 80,
  },
  byModule: {
    auth: 2340,
    api: 4560,
    database: 1890,
    websocket: 890,
    email: 1200,
    ai: 890,
    backup: 340,
    security: 1450,
    system: 1860,
  },
  recentErrors: 25,
  averageResponseTime: 245,
  errorRate: 6.8,
};

// Helper functions
const getLevelColor = (level: string) => {
  switch (level) {
    case 'debug':
      return 'bg-blue-100 text-blue-800';
    case 'info':
      return 'bg-green-100 text-green-800';
    case 'warn':
      return 'bg-yellow-100 text-yellow-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    case 'fatal':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getLevelIcon = (level: string) => {
  switch (level) {
    case 'debug':
      return <Info className="h-4 w-4" />;
    case 'info':
      return <CheckCircle className="h-4 w-4" />;
    case 'warn':
      return <AlertTriangle className="h-4 w-4" />;
    case 'error':
      return <XCircle className="h-4 w-4" />;
    case 'fatal':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

const getModuleIcon = (module: string) => {
  switch (module) {
    case 'auth':
      return <Shield className="h-4 w-4" />;
    case 'api':
      return <Globe className="h-4 w-4" />;
    case 'database':
      return <Database className="h-4 w-4" />;
    case 'websocket':
      return <Wifi className="h-4 w-4" />;
    case 'email':
      return <FileText className="h-4 w-4" />;
    case 'ai':
      return <Zap className="h-4 w-4" />;
    case 'backup':
      return <HardDrive className="h-4 w-4" />;
    case 'security':
      return <Shield className="h-4 w-4" />;
    case 'system':
      return <Server className="h-4 w-4" />;
    default:
      return <Monitor className="h-4 w-4" />;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    // ✅ FIXED: Remove fractionalSecondDigits as it's not supported in all browsers
    // fractionalSecondDigits: 3,
  } as any); // ✅ FIXED: Use any to bypass type conflicts
};

const formatDuration = (duration?: number) => {
  if (!duration) {
    return '-';
  }
  if (duration < 1000) {
    return `${duration}ms`;
  }
  return `${(duration / 1000).toFixed(2)}s`;
};

// Log Details Modal
const LogDetailsModal = ({
  log,
  isOpen,
  onClose,
}: {
  log: LogEntry | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!log) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
        isOpen ? 'block' : 'hidden'
      )}
    >
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Log Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XCircle className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Timestamp</Label>
              <p className="text-sm font-mono">{formatDate(log.timestamp)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Level</Label>
              <div className="flex items-center gap-2">
                {getLevelIcon(log.level)}
                <Badge className={getLevelColor(log.level)}>
                  {log.level.toUpperCase()}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Module</Label>
              <div className="flex items-center gap-2">
                {getModuleIcon(log.module)}
                <span className="text-sm">{log.module}</span>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Request ID</Label>
              <p className="text-sm font-mono">{log.requestId || '-'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">User ID</Label>
              <p className="text-sm font-mono">{log.userId || '-'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">IP Address</Label>
              <p className="text-sm font-mono">{log.ip || '-'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Duration</Label>
              <p className="text-sm">{formatDuration(log.duration)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status Code</Label>
              <p className="text-sm">{log.statusCode || '-'}</p>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Message</Label>
            <p className="text-sm bg-gray-50 p-3 rounded border">
              {log.message}
            </p>
          </div>

          {log.details && (
            <div>
              <Label className="text-sm font-medium">Details</Label>
              <p className="text-sm bg-gray-50 p-3 rounded border whitespace-pre-wrap">
                {log.details}
              </p>
            </div>
          )}

          {log.userAgent && (
            <div>
              <Label className="text-sm font-medium">User Agent</Label>
              <p className="text-sm bg-gray-50 p-3 rounded border break-all">
                {log.userAgent}
              </p>
            </div>
          )}

          {log.endpoint && (
            <div>
              <Label className="text-sm font-medium">Endpoint</Label>
              <p className="text-sm bg-gray-50 p-3 rounded border font-mono">
                {log.endpoint}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main System Logs component
export const SystemLogs: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs);
  const [stats, setStats] = useState<LogStats>(mockStats);
  const [loading, setLoading] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [showLogDetails, setShowLogDetails] = useState(false);

  // Filter states
  const [filter, setFilter] = useState<LogFilter>({
    level: 'all',
    module: 'all',
    startTime: '',
    endTime: '',
    search: '',
    requestId: '',
    userId: '',
    ip: '',
  });

  // Apply filters
  const filteredLogs = logs.filter(log => {
    const matchesLevel = filter.level === 'all' || log.level === filter.level;
    const matchesModule =
      filter.module === 'all' || log.module === filter.module;
    const matchesSearch =
      !filter.search ||
      log.message.toLowerCase().includes(filter.search.toLowerCase()) ||
      log.details?.toLowerCase().includes(filter.search.toLowerCase());
    const matchesRequestId =
      !filter.requestId || log.requestId?.includes(filter.requestId);
    const matchesUserId = !filter.userId || log.userId?.includes(filter.userId);
    const matchesIp = !filter.ip || log.ip?.includes(filter.ip);

    // Time filtering
    let matchesTime = true;
    if (filter.startTime) {
      matchesTime =
        matchesTime && new Date(log.timestamp) >= new Date(filter.startTime);
    }
    if (filter.endTime) {
      matchesTime =
        matchesTime && new Date(log.timestamp) <= new Date(filter.endTime);
    }

    return (
      matchesLevel &&
      matchesModule &&
      matchesSearch &&
      matchesRequestId &&
      matchesUserId &&
      matchesIp &&
      matchesTime
    );
  });

  const handleViewLog = (log: LogEntry) => {
    setSelectedLog(log);
    setShowLogDetails(true);
  };

  const handleExportLogs = async () => {
    setLoading(true);
    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create CSV content
      const csvContent = filteredLogs
        .map(
          log =>
            `${log.timestamp},${log.level},${log.module},"${log.message}",${log.requestId || ''},${log.userId || ''},${log.ip || ''},${log.statusCode || ''}`
        )
        .join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system_logs_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      logger.error('Export failed:', 'Component', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLogs(mockLogs);
      setStats(mockStats);
    } catch (error) {
      logger.error('Failed to fetch logs:', 'Component', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilter({
      level: 'all',
      module: 'all',
      startTime: '',
      endTime: '',
      search: '',
      requestId: '',
      userId: '',
      ip: '',
    });
  };

  useEffect(() => {
    fetchLogs();

    // no cleanup needed
  }, []);

  // Real-time log streaming simulation
  useEffect(() => {
    if (!realTimeEnabled) {
      return;
    }

    const interval = setInterval(() => {
      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        level: ['debug', 'info', 'warn', 'error'][
          Math.floor(Math.random() * 4)
        ] as any,
        module: ['auth', 'api', 'database', 'websocket'][
          Math.floor(Math.random() * 4)
        ],
        message: `Real-time log entry ${Date.now()}`,
        details: 'Generated for real-time demonstration',
        requestId: `req_${Date.now()}`,
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
      };

      setLogs(prev => [newLog, ...prev.slice(0, 99)]);
    }, 3000);

    return () => clearInterval(interval);
  }, [realTimeEnabled]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
          <p className="text-gray-600 mt-2">
            Theo dõi và phân tích logs hệ thống
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={realTimeEnabled}
              onCheckedChange={setRealTimeEnabled}
            />
            <Label className="text-sm">Real-time</Label>
          </div>
          <Button onClick={fetchLogs} disabled={loading}>
            <RefreshCw
              className={cn('h-4 w-4 mr-2', loading && 'animate-spin')}
            />
            Refresh
          </Button>
          <Button onClick={handleExportLogs} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Log Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Logs</p>
                <p className="text-2xl font-bold">
                  {stats.total.toLocaleString()}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recent Errors</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.recentErrors}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Avg Response Time
                </p>
                <p className="text-2xl font-bold">
                  {stats.averageResponseTime}ms
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Error Rate</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.errorRate}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="level">Log Level</Label>
                  <Select
                    value={filter.level}
                    onValueChange={value =>
                      setFilter({ ...filter, level: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="fatal">Fatal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="module">Module</Label>
                  <Select
                    value={filter.module}
                    onValueChange={value =>
                      setFilter({ ...filter, module: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modules</SelectItem>
                      <SelectItem value="auth">Auth</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="websocket">WebSocket</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="ai">AI</SelectItem>
                      <SelectItem value="backup">Backup</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search logs..."
                      value={filter.search}
                      onChange={e =>
                        setFilter({ ...filter, search: e.target.value })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={filter.startTime}
                    onChange={e =>
                      setFilter({ ...filter, startTime: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={filter.endTime}
                    onChange={e =>
                      setFilter({ ...filter, endTime: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="requestId">Request ID</Label>
                  <Input
                    id="requestId"
                    placeholder="Filter by request ID..."
                    value={filter.requestId}
                    onChange={e =>
                      setFilter({ ...filter, requestId: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>System Logs</span>
                <div className="flex items-center gap-2">
                  {realTimeEnabled && (
                    <Badge variant="outline" className="text-green-600">
                      <Activity className="h-3 w-3 mr-1" />
                      Live
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    Showing {filteredLogs.length} of {logs.length} logs
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Timestamp</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {formatDate(log.timestamp)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getLevelIcon(log.level)}
                            <Badge className={getLevelColor(log.level)}>
                              {log.level.toUpperCase()}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getModuleIcon(log.module)}
                            {log.module}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={log.message}>
                            {log.message}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.requestId && (
                            <span className="text-blue-600 cursor-pointer hover:underline">
                              {log.requestId}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{formatDuration(log.duration)}</TableCell>
                        <TableCell>
                          {log.statusCode && (
                            <Badge
                              variant={
                                log.statusCode >= 400
                                  ? 'destructive'
                                  : 'default'
                              }
                            >
                              {log.statusCode}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewLog(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Logs by Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.byLevel).map(([level, count]) => (
                    <div
                      key={level}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {getLevelIcon(level)}
                        <span className="capitalize">{level}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Logs by Module</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.byModule).map(([module, count]) => (
                    <div
                      key={module}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {getModuleIcon(module)}
                        <span className="capitalize">{module}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Log Details Modal */}
      <LogDetailsModal
        log={selectedLog}
        isOpen={showLogDetails}
        onClose={() => setShowLogDetails(false)}
      />
    </div>
  );
};
