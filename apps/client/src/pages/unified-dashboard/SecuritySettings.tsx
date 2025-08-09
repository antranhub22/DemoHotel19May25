import * as React from 'react';
import {
  Shield,
  Lock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Eye,
  HardDrive,
  Save,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
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
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import logger from '@shared/utils/logger';

// Types
interface SecurityConfig {
  firewall: {
    enabled: boolean;
    rules: FirewallRule[];
    allowedPorts: number[];
    blockedIPs: string[];
    ddosProtection: boolean;
    rateLimiting: boolean;
  };
  ssl: {
    enabled: boolean;
    certificates: SSLCertificate[];
    forceHttps: boolean;
    hstsEnabled: boolean;
    cipherSuites: string[];
  };
  authentication: {
    mfaEnabled: boolean;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
      expirationDays: number;
    };
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
  monitoring: {
    logLevel: 'debug' | 'info' | 'warning' | 'error';
    alertsEnabled: boolean;
    alertThresholds: {
      failedLogins: number;
      diskUsage: number;
      memoryUsage: number;
      cpuUsage: number;
    };
    retentionPeriod: number;
  };
  backup: {
    enabled: boolean;
    schedule: string;
    retention: number;
    encryption: boolean;
    location: string;
    lastBackup: string;
    status: 'success' | 'failed' | 'running';
  };
  compliance: {
    gdprCompliant: boolean;
    pciCompliant: boolean;
    iso27001: boolean;
    auditEnabled: boolean;
    dataRetentionDays: number;
  };
}

interface FirewallRule {
  id: string;
  name: string;
  source: string;
  destination: string;
  port: number;
  protocol: 'tcp' | 'udp' | 'icmp';
  action: 'allow' | 'deny';
  enabled: boolean;
  createdAt: string;
}

interface SSLCertificate {
  id: string;
  domain: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  status: 'valid' | 'expired' | 'expiring';
  type: 'ssl' | 'wildcard' | 'ev';
}

interface SecurityAlert {
  id: string;
  type: 'authentication' | 'firewall' | 'ssl' | 'system' | 'intrusion';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
  details: string;
}

interface SecurityLog {
  id: string;
  timestamp: string;
  source: string;
  event: string;
  severity: 'info' | 'warning' | 'error';
  details: string;
  ip: string;
  user?: string;
}

// Mock data
const mockSecurityConfig: SecurityConfig = {
  firewall: {
    enabled: true,
    rules: [
      {
        id: '1',
        name: 'Allow HTTP',
        source: 'any',
        destination: 'server',
        port: 80,
        protocol: 'tcp',
        action: 'allow',
        enabled: true,
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'Allow HTTPS',
        source: 'any',
        destination: 'server',
        port: 443,
        protocol: 'tcp',
        action: 'allow',
        enabled: true,
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '3',
        name: 'Block Suspicious IP',
        source: '192.168.1.100',
        destination: 'any',
        port: 0,
        protocol: 'tcp',
        action: 'deny',
        enabled: true,
        createdAt: '2024-01-10T10:00:00Z',
      },
    ],
    allowedPorts: [80, 443, 22, 25, 587],
    blockedIPs: ['192.168.1.100', '10.0.0.50'],
    ddosProtection: true,
    rateLimiting: true,
  },
  ssl: {
    enabled: true,
    certificates: [
      {
        id: '1',
        domain: 'minhhonghotel.com',
        issuer: "Let's Encrypt",
        validFrom: '2024-01-01T00:00:00Z',
        validTo: '2024-04-01T00:00:00Z',
        status: 'valid',
        type: 'ssl',
      },
      {
        id: '2',
        domain: '*.minhhonghotel.com',
        issuer: 'DigiCert',
        validFrom: '2023-12-01T00:00:00Z',
        validTo: '2024-12-01T00:00:00Z',
        status: 'valid',
        type: 'wildcard',
      },
    ],
    forceHttps: true,
    hstsEnabled: true,
    cipherSuites: ['TLS_AES_256_GCM_SHA384', 'TLS_CHACHA20_POLY1305_SHA256'],
  },
  authentication: {
    mfaEnabled: true,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: true,
      expirationDays: 90,
    },
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
  },
  monitoring: {
    logLevel: 'info',
    alertsEnabled: true,
    alertThresholds: {
      failedLogins: 10,
      diskUsage: 85,
      memoryUsage: 90,
      cpuUsage: 95,
    },
    retentionPeriod: 90,
  },
  backup: {
    enabled: true,
    schedule: '0 2 * * *',
    retention: 30,
    encryption: true,
    location: 'AWS S3',
    lastBackup: '2024-01-15T02:00:00Z',
    status: 'success',
  },
  compliance: {
    gdprCompliant: true,
    pciCompliant: false,
    iso27001: true,
    auditEnabled: true,
    dataRetentionDays: 365,
  },
};

const mockSecurityAlerts: SecurityAlert[] = [
  {
    id: '1',
    type: 'authentication',
    severity: 'high',
    message: 'Multiple failed login attempts detected',
    timestamp: '2024-01-15T14:30:00Z',
    resolved: false,
    details:
      'User attempted to login with incorrect credentials 8 times from IP 192.168.1.100',
  },
  {
    id: '2',
    type: 'ssl',
    severity: 'medium',
    message: 'SSL certificate expiring soon',
    timestamp: '2024-01-15T10:00:00Z',
    resolved: false,
    details: 'Certificate for minhhonghotel.com will expire in 30 days',
  },
  {
    id: '3',
    type: 'firewall',
    severity: 'low',
    message: 'Port scan detected',
    timestamp: '2024-01-15T08:15:00Z',
    resolved: true,
    details: 'Port scan from 10.0.0.50 was blocked by firewall',
  },
];

const mockSecurityLogs: SecurityLog[] = [
  {
    id: '1',
    timestamp: '2024-01-15T15:00:00Z',
    source: 'auth',
    event: 'LOGIN_SUCCESS',
    severity: 'info',
    details: 'User logged in successfully',
    ip: '192.168.1.50',
    user: 'admin',
  },
  {
    id: '2',
    timestamp: '2024-01-15T14:45:00Z',
    source: 'firewall',
    event: 'BLOCKED_IP',
    severity: 'warning',
    details: 'Blocked connection from suspicious IP',
    ip: '192.168.1.100',
  },
  {
    id: '3',
    timestamp: '2024-01-15T14:30:00Z',
    source: 'auth',
    event: 'LOGIN_FAILED',
    severity: 'error',
    details: 'Failed login attempt',
    ip: '192.168.1.100',
    user: 'admin',
  },
];

// Helper functions
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'valid':
      return 'text-green-600';
    case 'expired':
      return 'text-red-600';
    case 'expiring':
      return 'text-orange-600';
    case 'success':
      return 'text-green-600';
    case 'failed':
      return 'text-red-600';
    case 'running':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Firewall Management Tab
const FirewallTab = ({
  config,
  onUpdate,
}: {
  config: SecurityConfig['firewall'];
  onUpdate: (updates: Partial<SecurityConfig['firewall']>) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [showAddRule, setShowAddRule] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Save configuration
    } catch (error) {
      logger.error('Failed to save firewall config:', 'Component', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Cấu hình Firewall
          </CardTitle>
          <CardDescription>Quản lý tường lửa và bảo mật mạng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">
                Kích hoạt Firewall
              </Label>
              <p className="text-sm text-muted-foreground">
                Bật/tắt tường lửa cho hệ thống
              </p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={checked => onUpdate({ enabled: checked })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>DDoS Protection</Label>
              <Switch
                checked={config.ddosProtection}
                onCheckedChange={checked =>
                  onUpdate({ ddosProtection: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Rate Limiting</Label>
              <Switch
                checked={config.rateLimiting}
                onCheckedChange={checked => onUpdate({ rateLimiting: checked })}
              />
            </div>
          </div>

          <div>
            <Label>Blocked IPs</Label>
            <Textarea
              value={config.blockedIPs.join('\n')}
              onChange={e =>
                onUpdate({
                  blockedIPs: e.target.value
                    .split('\n')
                    .filter(ip => ip.trim()),
                })
              }
              placeholder="192.168.1.100&#10;10.0.0.50"
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu cấu hình
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Firewall Rules</span>
            <Button size="sm" onClick={() => setShowAddRule(!showAddRule)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm Rule
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Port</TableHead>
                <TableHead>Protocol</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {config.rules.map(rule => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>{rule.source}</TableCell>
                  <TableCell>{rule.destination}</TableCell>
                  <TableCell>{rule.port}</TableCell>
                  <TableCell>{rule.protocol.toUpperCase()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        rule.action === 'allow' ? 'default' : 'destructive'
                      }
                    >
                      {rule.action.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                      {rule.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// SSL/TLS Management Tab
const SSLTab = ({
  config,
  onUpdate,
}: {
  config: SecurityConfig['ssl'];
  onUpdate: (updates: Partial<SecurityConfig['ssl']>) => void;
}) => {
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Save configuration
    } catch (error) {
      logger.error('Failed to save SSL config:', 'Component', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Cấu hình SSL/TLS
          </CardTitle>
          <CardDescription>
            Quản lý chứng chỉ SSL và cấu hình TLS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Kích hoạt SSL</Label>
              <Switch
                checked={config.enabled}
                onCheckedChange={checked => onUpdate({ enabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Force HTTPS</Label>
              <Switch
                checked={config.forceHttps}
                onCheckedChange={checked => onUpdate({ forceHttps: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>HSTS Enabled</Label>
              <Switch
                checked={config.hstsEnabled}
                onCheckedChange={checked => onUpdate({ hstsEnabled: checked })}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu cấu hình
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>SSL Certificates</span>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Thêm Certificate
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Issuer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Valid From</TableHead>
                <TableHead>Valid To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {config.certificates.map(cert => (
                <TableRow key={cert.id}>
                  <TableCell className="font-medium">{cert.domain}</TableCell>
                  <TableCell>{cert.issuer}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{cert.type.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(cert.validFrom)}</TableCell>
                  <TableCell>{formatDate(cert.validTo)}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        cert.status === 'valid'
                          ? 'bg-green-100 text-green-800'
                          : cert.status === 'expired'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-orange-100 text-orange-800'
                      )}
                    >
                      {cert.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// Security Alerts Tab
const SecurityAlertsTab = ({ alerts }: { alerts: SecurityAlert[] }) => {
  const [filter, setFilter] = useState('all');

  const filteredAlerts = alerts.filter(
    alert => filter === 'all' || alert.severity === filter
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Cảnh báo bảo mật
          </CardTitle>
          <CardDescription>
            Theo dõi và xử lý các cảnh báo bảo mật
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Tất cả ({alerts.length})
              </Button>
              <Button
                variant={filter === 'critical' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('critical')}
              >
                Critical ({alerts.filter(a => a.severity === 'critical').length}
                )
              </Button>
              <Button
                variant={filter === 'high' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('high')}
              >
                High ({alerts.filter(a => a.severity === 'high').length})
              </Button>
            </div>
            <Button size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="space-y-4">
            {filteredAlerts.map(alert => (
              <Card
                key={alert.id}
                className={cn(
                  'border-l-4',
                  alert.severity === 'critical'
                    ? 'border-l-red-500'
                    : alert.severity === 'high'
                      ? 'border-l-orange-500'
                      : alert.severity === 'medium'
                        ? 'border-l-yellow-500'
                        : 'border-l-blue-500'
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{alert.type}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(alert.timestamp)}
                        </span>
                      </div>
                      <h4 className="font-medium">{alert.message}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {alert.details}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!alert.resolved && (
                        <Button size="sm" variant="outline">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Resolve
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Security Logs Tab
const SecurityLogsTab = ({ logs }: { logs: SecurityLog[] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      !searchQuery ||
      log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip.includes(searchQuery);

    const matchesSeverity =
      severityFilter === 'all' || log.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Security Logs
          </CardTitle>
          <CardDescription>
            Nhật ký hoạt động bảo mật của hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm logs..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map(log => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">
                    {formatDate(log.timestamp)}
                  </TableCell>
                  <TableCell>{log.source}</TableCell>
                  <TableCell className="font-medium">{log.event}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        log.severity === 'error'
                          ? 'bg-red-100 text-red-800'
                          : log.severity === 'warning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                      )}
                    >
                      {log.severity.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{log.ip}</TableCell>
                  <TableCell>{log.user || '-'}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {log.details}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// Backup & Recovery Tab
const BackupTab = ({
  config,
  onUpdate,
}: {
  config: SecurityConfig['backup'];
  onUpdate: (updates: Partial<SecurityConfig['backup']>) => void;
}) => {
  const [loading, setLoading] = useState(false);

  const handleBackupNow = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      onUpdate({
        lastBackup: new Date().toISOString(),
        status: 'success',
      });
    } catch (error) {
      logger.error('Backup failed:', 'Component', error);
      onUpdate({ status: 'failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Backup & Recovery
          </CardTitle>
          <CardDescription>
            Quản lý sao lưu và khôi phục dữ liệu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Kích hoạt backup tự động</Label>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={checked => onUpdate({ enabled: checked })}
                />
              </div>

              <div>
                <Label htmlFor="schedule">Lịch backup (Cron)</Label>
                <Input
                  id="schedule"
                  value={config.schedule}
                  onChange={e => onUpdate({ schedule: e.target.value })}
                  placeholder="0 2 * * *"
                />
              </div>

              <div>
                <Label htmlFor="retention">Thời gian lưu trữ (ngày)</Label>
                <Input
                  id="retention"
                  type="number"
                  value={config.retention}
                  onChange={e =>
                    onUpdate({ retention: parseInt(e.target.value) })
                  }
                />
              </div>

              <div>
                <Label htmlFor="location">Vị trí lưu trữ</Label>
                <Select
                  value={config.location}
                  onValueChange={value => onUpdate({ location: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AWS S3">AWS S3</SelectItem>
                    <SelectItem value="Google Cloud">Google Cloud</SelectItem>
                    <SelectItem value="Azure">Azure</SelectItem>
                    <SelectItem value="Local">Local Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Mã hóa backup</Label>
                <Switch
                  checked={config.encryption}
                  onCheckedChange={checked => onUpdate({ encryption: checked })}
                />
              </div>

              <div>
                <Label>Backup cuối cùng</Label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm">
                    {config.lastBackup
                      ? formatDate(config.lastBackup)
                      : 'Chưa có backup'}
                  </span>
                  <Badge
                    className={cn(
                      'ml-2',
                      config.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : config.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                    )}
                  >
                    {config.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Dung lượng backup</Label>
                <div className="mt-1">
                  <Progress value={65} className="h-2" />
                  <span className="text-sm text-muted-foreground">
                    2.1 GB / 5 GB
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleBackupNow} disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Đang backup...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Backup ngay
                    </>
                  )}
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Khôi phục
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Security Settings component
export const SecuritySettings: React.FC = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<SecurityConfig>(mockSecurityConfig);
  const [alerts, setAlerts] = useState<SecurityAlert[]>(mockSecurityAlerts);
  const [logs, setLogs] = useState<SecurityLog[]>(mockSecurityLogs);
  const [loading, setLoading] = useState(false);

  const updateConfig = (section: keyof SecurityConfig, updates: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates,
      },
    }));
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConfig(mockSecurityConfig);
      setAlerts(mockSecurityAlerts);
      setLogs(mockSecurityLogs);
    } catch (error) {
      logger.error('Failed to fetch security data:', 'Component', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // no cleanup needed
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2">Đang tải cấu hình bảo mật...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt bảo mật</h1>
        <p className="text-gray-600 mt-2">
          Quản lý tường lửa, SSL, cảnh báo bảo mật và sao lưu hệ thống
        </p>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Firewall</p>
                <p className="text-2xl font-bold text-green-600">
                  {config.firewall.enabled ? 'ON' : 'OFF'}
                </p>
              </div>
              <Shield
                className={cn(
                  'h-8 w-8',
                  config.firewall.enabled ? 'text-green-500' : 'text-gray-400'
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">SSL</p>
                <p className="text-2xl font-bold text-green-600">
                  {config.ssl.enabled ? 'ACTIVE' : 'INACTIVE'}
                </p>
              </div>
              <Lock
                className={cn(
                  'h-8 w-8',
                  config.ssl.enabled ? 'text-green-500' : 'text-gray-400'
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cảnh báo</p>
                <p className="text-2xl font-bold text-orange-600">
                  {alerts.filter(a => !a.resolved).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Backup</p>
                <p className="text-2xl font-bold text-blue-600">
                  {config.backup.status === 'success' ? 'OK' : 'FAILED'}
                </p>
              </div>
              <HardDrive
                className={cn(
                  'h-8 w-8',
                  config.backup.status === 'success'
                    ? 'text-blue-500'
                    : 'text-red-500'
                )}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="firewall" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="firewall" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Firewall
          </TabsTrigger>
          <TabsTrigger value="ssl" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            SSL/TLS
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Cảnh báo
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            Backup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="firewall">
          <FirewallTab
            config={config.firewall}
            onUpdate={updates => updateConfig('firewall', updates)}
          />
        </TabsContent>

        <TabsContent value="ssl">
          <SSLTab
            config={config.ssl}
            onUpdate={updates => updateConfig('ssl', updates)}
          />
        </TabsContent>

        <TabsContent value="alerts">
          <SecurityAlertsTab alerts={alerts} />
        </TabsContent>

        <TabsContent value="logs">
          <SecurityLogsTab logs={logs} />
        </TabsContent>

        <TabsContent value="backup">
          <BackupTab
            config={config.backup}
            onUpdate={updates => updateConfig('backup', updates)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
