import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Edit, Trash2, Eye, EyeOff, CheckCircle, XCircle, RefreshCw, Globe, Key, Webhook, Database, TrendingUp, Zap, Link, BarChart3, Save, Mail, CreditCard, Shield, Search,  } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,  } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Types
interface Integration {
  id: string;
  name: string;
  type:
    | 'api'
    | 'webhook'
    | 'database'
    | 'payment'
    | 'notification'
    | 'ai'
    | 'analytics'
    | 'security';
  provider: string;
  description: string;
  status: 'active' | 'inactive' | 'error' | 'testing';
  enabled: boolean;
  config: {
    baseUrl?: string;
    apiKey?: string;
    webhookUrl?: string;
    timeout?: number;
    retryCount?: number;
    rateLimitPerMinute?: number;
    customHeaders?: Record<string, string>;
  };
  metrics: {
    totalRequests: number;
    successRate: number;
    averageResponseTime: number;
    lastRequest: string;
    uptime: number;
  };
  createdAt: string;
  updatedAt: string;
  lastSync: string;
}

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  events: string[];
  active: boolean;
  secret?: string;
  headers: Record<string, string>;
  retryPolicy: {
    enabled: boolean;
    maxRetries: number;
    retryDelay: number;
  };
  logs: WebhookLog[];
}

interface WebhookLog {
  id: string;
  timestamp: string;
  event: string;
  statusCode: number;
  responseTime: number;
  success: boolean;
  error?: string;
  payload?: any;
}

interface APICredential {
  id: string;
  name: string;
  service: string;
  type: 'api_key' | 'oauth' | 'bearer_token' | 'basic_auth';
  environment: 'production' | 'staging' | 'development';
  credentials: {
    apiKey?: string;
    accessToken?: string;
    refreshToken?: string;
    clientId?: string;
    clientSecret?: string;
    username?: string;
    password?: string;
  };
  expiresAt?: string;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockIntegrations: Integration[] = [
  {
    id: '1',
    name: 'OpenAI GPT',
    type: 'ai',
    provider: 'OpenAI',
    description: 'AI-powered chatbot and content generation',
    status: 'active',
    enabled: true,
    config: {
      baseUrl: 'https://api.openai.com/v1',
      apiKey: 'sk-...',
      timeout: 30000,
      retryCount: 3,
      rateLimitPerMinute: 60,
    },
    metrics: {
      totalRequests: 15420,
      successRate: 98.5,
      averageResponseTime: 1250,
      lastRequest: '2024-01-15T15:30:00Z',
      uptime: 99.8,
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    lastSync: '2024-01-15T15:30:00Z',
  },
  {
    id: '2',
    name: 'Stripe Payment',
    type: 'payment',
    provider: 'Stripe',
    description: 'Payment processing and billing',
    status: 'active',
    enabled: true,
    config: {
      baseUrl: 'https://api.stripe.com/v1',
      apiKey: 'sk_live_...',
      timeout: 10000,
      retryCount: 2,
      rateLimitPerMinute: 100,
    },
    metrics: {
      totalRequests: 8950,
      successRate: 99.9,
      averageResponseTime: 450,
      lastRequest: '2024-01-15T15:25:00Z',
      uptime: 99.9,
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    lastSync: '2024-01-15T15:25:00Z',
  },
  {
    id: '3',
    name: 'Twilio SMS',
    type: 'notification',
    provider: 'Twilio',
    description: 'SMS notifications and alerts',
    status: 'active',
    enabled: true,
    config: {
      baseUrl: 'https://api.twilio.com/2010-04-01',
      apiKey: 'AC...',
      timeout: 5000,
      retryCount: 3,
      rateLimitPerMinute: 200,
    },
    metrics: {
      totalRequests: 2340,
      successRate: 97.8,
      averageResponseTime: 890,
      lastRequest: '2024-01-15T14:45:00Z',
      uptime: 98.5,
    },
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    lastSync: '2024-01-15T14:45:00Z',
  },
  {
    id: '4',
    name: 'Google Places',
    type: 'api',
    provider: 'Google',
    description: 'Location data and place information',
    status: 'error',
    enabled: false,
    config: {
      baseUrl: 'https://maps.googleapis.com/maps/api/place',
      apiKey: 'AIza...',
      timeout: 8000,
      retryCount: 2,
      rateLimitPerMinute: 50,
    },
    metrics: {
      totalRequests: 1250,
      successRate: 45.2,
      averageResponseTime: 2100,
      lastRequest: '2024-01-15T13:20:00Z',
      uptime: 78.3,
    },
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-15T13:20:00Z',
    lastSync: '2024-01-15T13:20:00Z',
  },
  {
    id: '5',
    name: 'Slack Notifications',
    type: 'webhook',
    provider: 'Slack',
    description: 'Team notifications and alerts',
    status: 'active',
    enabled: true,
    config: {
      webhookUrl: 'https://hooks.slack.com/services/...',
      timeout: 3000,
      retryCount: 2,
      rateLimitPerMinute: 1,
    },
    metrics: {
      totalRequests: 450,
      successRate: 100,
      averageResponseTime: 320,
      lastRequest: '2024-01-15T15:00:00Z',
      uptime: 100,
    },
    createdAt: '2024-01-08T00:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
    lastSync: '2024-01-15T15:00:00Z',
  },
];

const mockWebhooks: WebhookEndpoint[] = [
  {
    id: '1',
    name: 'Payment Webhook',
    url: 'https://api.hotel.com/webhooks/payment',
    method: 'POST',
    events: ['payment.completed', 'payment.failed', 'payment.refunded'],
    active: true,
    secret: 'whsec_...',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Source': 'hotel-system',
    },
    retryPolicy: {
      enabled: true,
      maxRetries: 3,
      retryDelay: 1000,
    },
    logs: [
      {
        id: '1',
        timestamp: '2024-01-15T15:30:00Z',
        event: 'payment.completed',
        statusCode: 200,
        responseTime: 245,
        success: true,
      },
      {
        id: '2',
        timestamp: '2024-01-15T15:25:00Z',
        event: 'payment.failed',
        statusCode: 500,
        responseTime: 1000,
        success: false,
        error: 'Internal server error',
      },
    ],
  },
  {
    id: '2',
    name: 'Booking Webhook',
    url: 'https://api.hotel.com/webhooks/booking',
    method: 'POST',
    events: ['booking.created', 'booking.updated', 'booking.cancelled'],
    active: true,
    secret: 'whsec_...',
    headers: {
      'Content-Type': 'application/json',
    },
    retryPolicy: {
      enabled: true,
      maxRetries: 5,
      retryDelay: 2000,
    },
    logs: [],
  },
];

const mockCredentials: APICredential[] = [
  {
    id: '1',
    name: 'OpenAI Production',
    service: 'OpenAI',
    type: 'api_key',
    environment: 'production',
    credentials: {
      apiKey: 'sk-...',
    },
    lastUsed: '2024-01-15T15:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Stripe Live',
    service: 'Stripe',
    type: 'api_key',
    environment: 'production',
    credentials: {
      apiKey: 'sk_live_...',
    },
    lastUsed: '2024-01-15T15:25:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
  },
  {
    id: '3',
    name: 'Google OAuth',
    service: 'Google',
    type: 'oauth',
    environment: 'production',
    credentials: {
      clientId: '123456789-...',
      clientSecret: 'GOCSPX-...',
      accessToken: 'ya29.a0A...',
      refreshToken: '1//0G...',
    },
    expiresAt: '2024-01-16T15:30:00Z',
    lastUsed: '2024-01-15T13:20:00Z',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-15T13:20:00Z',
  },
];

// Helper functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    case 'testing':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'api':
      return <Globe className="h-4 w-4" />;
    case 'webhook':
      return <Webhook className="h-4 w-4" />;
    case 'database':
      return <Database className="h-4 w-4" />;
    case 'payment':
      return <CreditCard className="h-4 w-4" />;
    case 'notification':
      return <Mail className="h-4 w-4" />;
    case 'ai':
      return <Zap className="h-4 w-4" />;
    case 'analytics':
      return <BarChart3 className="h-4 w-4" />;
    case 'security':
      return <Shield className="h-4 w-4" />;
    default:
      return <Link className="h-4 w-4" />;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

// Integration Details Modal
const IntegrationModal = ({
  integration,
  isOpen,
  onClose,
  onSave,
}: {
  integration: Integration | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (integration: Integration) => void;
}) => {
  const [formData, setFormData] = useState<Integration | null>(integration);
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {

    setFormData(integration);
  
    // no cleanup needed
  }, [integration]);

  const handleSave = async () => {
    if (!formData) {return;}

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSave(formData);
      onClose();
    } catch (error) {
      logger.error('Failed to save integration:', 'Component', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Integration test successful!');
    } catch (error) {
      alert('Integration test failed!');
    } finally {
      setLoading(false);
    }
  };

  if (!integration || !formData) {return null;}

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeIcon(integration.type)}
            {integration.name}
          </DialogTitle>
          <DialogDescription>
            Cấu hình chi tiết cho integration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Tên</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="provider">Provider</Label>
              <Input
                id="provider"
                value={formData.provider}
                onChange={e =>
                  setFormData({ ...formData, provider: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="baseUrl">Base URL</Label>
              <Input
                id="baseUrl"
                value={formData.config.baseUrl || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, baseUrl: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="timeout">Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                value={formData.config.timeout || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    config: {
                      ...formData.config,
                      timeout: parseInt(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="apiKey">API Key</Label>
            <div className="flex gap-2">
              <Input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                value={formData.config.apiKey || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, apiKey: e.target.value },
                  })
                }
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="retryCount">Retry Count</Label>
              <Input
                id="retryCount"
                type="number"
                value={formData.config.retryCount || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    config: {
                      ...formData.config,
                      retryCount: parseInt(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="rateLimit">Rate Limit/min</Label>
              <Input
                id="rateLimit"
                type="number"
                value={formData.config.rateLimitPerMinute || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    config: {
                      ...formData.config,
                      rateLimitPerMinute: parseInt(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Kích hoạt</Label>
              <p className="text-sm text-muted-foreground">
                Bật/tắt integration này
              </p>
            </div>
            <Switch
              checked={formData.enabled}
              onCheckedChange={checked =>
                setFormData({ ...formData, enabled: checked })
              }
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleTest} disabled={loading}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Test Connection
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Add Integration Modal
const AddIntegrationModal = ({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (integration: Integration) => void;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'api' as const,
    provider: '',
    description: '',
    baseUrl: '',
    apiKey: '',
    timeout: 30000,
    retryCount: 3,
    rateLimitPerMinute: 100,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newIntegration: Integration = {
        id: Date.now().toString(),
        name: formData.name,
        type: formData.type,
        provider: formData.provider,
        description: formData.description,
        status: 'inactive',
        enabled: false,
        config: {
          baseUrl: formData.baseUrl,
          apiKey: formData.apiKey,
          timeout: formData.timeout,
          retryCount: formData.retryCount,
          rateLimitPerMinute: formData.rateLimitPerMinute,
        },
        metrics: {
          totalRequests: 0,
          successRate: 0,
          averageResponseTime: 0,
          lastRequest: '',
          uptime: 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastSync: '',
      };

      onAdd(newIntegration);
      onClose();

      // Reset form
      setFormData({
        name: '',
        type: 'api',
        provider: '',
        description: '',
        baseUrl: '',
        apiKey: '',
        timeout: 30000,
        retryCount: 3,
        rateLimitPerMinute: 100,
      });
    } catch (error) {
      logger.error('Failed to add integration:', 'Component', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thêm Integration mới</DialogTitle>
          <DialogDescription>
            Tạo integration mới với third-party service
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Tên *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Loại *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="ai">AI</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="provider">Provider *</Label>
            <Input
              id="provider"
              value={formData.provider}
              onChange={e =>
                setFormData({ ...formData, provider: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="baseUrl">Base URL *</Label>
            <Input
              id="baseUrl"
              value={formData.baseUrl}
              onChange={e =>
                setFormData({ ...formData, baseUrl: e.target.value })
              }
              placeholder="https://api.example.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="apiKey">API Key *</Label>
            <Input
              id="apiKey"
              type="password"
              value={formData.apiKey}
              onChange={e =>
                setFormData({ ...formData, apiKey: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="timeout">Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                value={formData.timeout}
                onChange={e =>
                  setFormData({
                    ...formData,
                    timeout: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="retryCount">Retry Count</Label>
              <Input
                id="retryCount"
                type="number"
                value={formData.retryCount}
                onChange={e =>
                  setFormData({
                    ...formData,
                    retryCount: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="rateLimit">Rate Limit/min</Label>
              <Input
                id="rateLimit"
                type="number"
                value={formData.rateLimitPerMinute}
                onChange={e =>
                  setFormData({
                    ...formData,
                    rateLimitPerMinute: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo Integration
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Main Integrations component
export const Integrations: React.FC = () => {
  const { user } = useAuth();
  const [integrations, setIntegrations] =
    useState<Integration[]>(mockIntegrations);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(mockWebhooks);
  const [credentials, setCredentials] =
    useState<APICredential[]>(mockCredentials);
  const [loading, setLoading] = useState(false);
  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter integrations
  const filteredIntegrations = integrations.filter(integration => {
    const matchesStatus =
      statusFilter === 'all' || integration.status === statusFilter;
    const matchesType = typeFilter === 'all' || integration.type === typeFilter;
    const matchesSearch =
      !searchQuery ||
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.provider.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  const handleEditIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowIntegrationModal(true);
  };

  const handleSaveIntegration = (updatedIntegration: Integration) => {
    setIntegrations(prev =>
      prev.map(i => (i.id === updatedIntegration.id ? updatedIntegration : i))
    );
    setSelectedIntegration(null);
  };

  const handleAddIntegration = (newIntegration: Integration) => {
    setIntegrations(prev => [...prev, newIntegration]);
  };

  const handleDeleteIntegration = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa integration này?')) {
      setIntegrations(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleToggleIntegration = (id: string) => {
    setIntegrations(prev =>
      prev.map(i =>
        i.id === id
          ? {
              ...i,
              enabled: !i.enabled,
              status: i.enabled ? 'inactive' : 'active',
            }
          : i
      )
    );
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIntegrations(mockIntegrations);
      setWebhooks(mockWebhooks);
      setCredentials(mockCredentials);
    } catch (error) {
      logger.error('Failed to fetch integrations:', 'Component', error);
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
        <span className="ml-2">Đang tải integrations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600 mt-2">
            Quản lý tích hợp với các dịch vụ bên thứ ba
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm Integration
        </Button>
      </div>

      {/* Integration Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Integrations
                </p>
                <p className="text-2xl font-bold">{integrations.length}</p>
              </div>
              <Wrench className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {integrations.filter(i => i.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-red-600">
                  {integrations.filter(i => i.status === 'error').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Avg Success Rate
                </p>
                <p className="text-2xl font-bold">
                  {(
                    integrations.reduce(
                      (sum, i) => sum + i.metrics.successRate,
                      0
                    ) / integrations.length
                  ).toFixed(1)}
                  %
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Tìm kiếm integrations..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="testing">Testing</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                      <SelectItem value="ai">AI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integrations List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIntegrations.map(integration => (
              <Card key={integration.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(integration.type)}
                      <CardTitle className="text-lg">
                        {integration.name}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(integration.status)}>
                        {integration.status.toUpperCase()}
                      </Badge>
                      <Switch
                        checked={integration.enabled}
                        onCheckedChange={() =>
                          handleToggleIntegration(integration.id)
                        }
                      />
                    </div>
                  </div>
                  <CardDescription>{integration.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Provider:</span>
                    <span className="font-medium">{integration.provider}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Success Rate:</span>
                    <span className="font-medium">
                      {integration.metrics.successRate}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Requests:</span>
                    <span className="font-medium">
                      {formatNumber(integration.metrics.totalRequests)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Avg Response:</span>
                    <span className="font-medium">
                      {integration.metrics.averageResponseTime}ms
                    </span>
                  </div>

                  <div className="text-sm">
                    <span className="text-muted-foreground">Uptime:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress
                        value={integration.metrics.uptime}
                        className="h-2"
                      />
                      <span className="font-medium">
                        {integration.metrics.uptime}%
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      Last sync:{' '}
                      {integration.lastSync
                        ? formatDate(integration.lastSync)
                        : 'Never'}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditIntegration(integration)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteIntegration(integration.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Webhook Endpoints</span>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Webhook
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map(webhook => (
                    <TableRow key={webhook.id}>
                      <TableCell className="font-medium">
                        {webhook.name}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {webhook.url}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{webhook.method}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.slice(0, 2).map((event, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {event}
                            </Badge>
                          ))}
                          {webhook.events.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{webhook.events.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            webhook.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {webhook.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
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
        </TabsContent>

        <TabsContent value="credentials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>API Credentials</span>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Credential
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Environment</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {credentials.map(credential => (
                    <TableRow key={credential.id}>
                      <TableCell className="font-medium">
                        {credential.name}
                      </TableCell>
                      <TableCell>{credential.service}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{credential.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            credential.environment === 'production'
                              ? 'bg-red-100 text-red-800'
                              : credential.environment === 'staging'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                          )}
                        >
                          {credential.environment}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {credential.expiresAt
                          ? formatDate(credential.expiresAt)
                          : 'Never'}
                      </TableCell>
                      <TableCell>
                        {credential.lastUsed
                          ? formatDate(credential.lastUsed)
                          : 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
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
        </TabsContent>
      </Tabs>

      {/* Integration Details Modal */}
      <IntegrationModal
        integration={selectedIntegration}
        isOpen={showIntegrationModal}
        onClose={() => setShowIntegrationModal(false)}
        onSave={handleSaveIntegration}
      />

      {/* Add Integration Modal */}
      <AddIntegrationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddIntegration}
      />
    </div>
  );
};
