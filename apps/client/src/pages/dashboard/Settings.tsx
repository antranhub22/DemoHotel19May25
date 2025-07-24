import React, { useState } from 'react';
import { logger } from '@shared/utils/logger';
import {
  Hotel,
  Bell,
  Shield,
  Key,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Phone,
  Database,
  Bot,
  Mail,
  Globe,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock hotel settings data
const mockHotelSettings = {
  basicInfo: {
    name: 'Mi Nhon Hotel',
    address: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
    phone: '+84 28 3829 2999',
    email: 'info@minhonhotel.com',
    website: 'https://minhonhotel.com',
    description:
      'Khách sạn 4 sao sang trọng tại trung tâm thành phố với view biển tuyệt đẹp và dịch vụ chuyên nghiệp.',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    currency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    dailyReports: true,
    weeklyReports: true,
    monthlyReports: true,
    alertOnErrors: true,
    alertOnLowRating: true,
  },
  privacy: {
    recordCalls: true,
    dataRetentionDays: 90,
    shareAnalytics: false,
    allowDataExport: true,
    gdprCompliance: true,
  },
  api: {
    webhookUrl: 'https://minhonhotel.com/webhook',
    apiKeys: {
      vapi: 'vapi_***************',
      openai: 'sk-***************',
    },
  },
};

// Hotel information form
const HotelInfoForm = () => {
  const [settings, setSettings] = useState(mockHotelSettings.basicInfo);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      logger.debug('Saving hotel settings:', 'Component', settings);
    } catch (error) {
      logger.error('Failed to save settings:', 'Component', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hotel className="h-5 w-5" />
            Thông tin cơ bản
          </CardTitle>
          <CardDescription>
            Cập nhật thông tin chi tiết về khách sạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hotel-name">Tên khách sạn</Label>
              <Input
                id="hotel-name"
                value={settings.name}
                onChange={e =>
                  setSettings(prev => ({ ...prev, name: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={e =>
                  setSettings(prev => ({ ...prev, phone: e.target.value }))
                }
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              value={settings.address}
              onChange={e =>
                setSettings(prev => ({ ...prev, address: e.target.value }))
              }
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={e =>
                  setSettings(prev => ({ ...prev, email: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={settings.website}
                onChange={e =>
                  setSettings(prev => ({ ...prev, website: e.target.value }))
                }
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Mô tả khách sạn</Label>
            <Textarea
              id="description"
              value={settings.description}
              onChange={e =>
                setSettings(prev => ({ ...prev, description: e.target.value }))
              }
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="check-in">Giờ check-in</Label>
              <Input
                id="check-in"
                type="time"
                value={settings.checkInTime}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    checkInTime: e.target.value,
                  }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="check-out">Giờ check-out</Label>
              <Input
                id="check-out"
                type="time"
                value={settings.checkOutTime}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    checkOutTime: e.target.value,
                  }))
                }
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currency">Đơn vị tiền tệ</Label>
              <Input
                id="currency"
                value={settings.currency}
                onChange={e =>
                  setSettings(prev => ({ ...prev, currency: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="timezone">Múi giờ</Label>
              <Input
                id="timezone"
                value={settings.timezone}
                onChange={e =>
                  setSettings(prev => ({ ...prev, timezone: e.target.value }))
                }
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Lưu thay đổi
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Notification settings form
const NotificationForm = () => {
  const [settings, setSettings] = useState(mockHotelSettings.notifications);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      logger.debug('Saving notification settings:', 'Component', settings);
    } catch (error) {
      logger.error('Failed to save settings:', 'Component', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Cài đặt thông báo
          </CardTitle>
          <CardDescription>Tùy chọn thông báo và báo cáo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium">Phương thức thông báo</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Email notifications</div>
                  <div className="text-sm text-gray-600">
                    Nhận thông báo qua email
                  </div>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={() => handleToggle('emailNotifications')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">SMS notifications</div>
                  <div className="text-sm text-gray-600">
                    Nhận thông báo qua SMS
                  </div>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={() => handleToggle('smsNotifications')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Push notifications</div>
                  <div className="text-sm text-gray-600">
                    Thông báo đẩy trên trình duyệt
                  </div>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={() => handleToggle('pushNotifications')}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Báo cáo định kỳ</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Báo cáo hàng ngày</div>
                  <div className="text-sm text-gray-600">
                    Tóm tắt hoạt động hàng ngày
                  </div>
                </div>
                <Switch
                  checked={settings.dailyReports}
                  onCheckedChange={() => handleToggle('dailyReports')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Báo cáo hàng tuần</div>
                  <div className="text-sm text-gray-600">Thống kê tuần</div>
                </div>
                <Switch
                  checked={settings.weeklyReports}
                  onCheckedChange={() => handleToggle('weeklyReports')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Báo cáo hàng tháng</div>
                  <div className="text-sm text-gray-600">Tổng quan tháng</div>
                </div>
                <Switch
                  checked={settings.monthlyReports}
                  onCheckedChange={() => handleToggle('monthlyReports')}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Cảnh báo</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Cảnh báo lỗi</div>
                  <div className="text-sm text-gray-600">
                    Thông báo khi có lỗi hệ thống
                  </div>
                </div>
                <Switch
                  checked={settings.alertOnErrors}
                  onCheckedChange={() => handleToggle('alertOnErrors')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Cảnh báo điểm thấp</div>
                  <div className="text-sm text-gray-600">
                    Thông báo khi điểm hài lòng thấp
                  </div>
                </div>
                <Switch
                  checked={settings.alertOnLowRating}
                  onCheckedChange={() => handleToggle('alertOnLowRating')}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Lưu cài đặt
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Privacy settings form
const PrivacyForm = () => {
  const [settings, setSettings] = useState(mockHotelSettings.privacy);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      logger.debug('Saving privacy settings:', 'Component', settings);
    } catch (error) {
      logger.error('Failed to save settings:', 'Component', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Quyền riêng tư & Bảo mật
          </CardTitle>
          <CardDescription>
            Cấu hình bảo mật và quyền riêng tư dữ liệu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Ghi âm cuộc gọi</div>
                <div className="text-sm text-gray-600">
                  Lưu trữ cuộc gọi để cải thiện chất lượng
                </div>
              </div>
              <Switch
                checked={settings.recordCalls}
                onCheckedChange={() => handleToggle('recordCalls')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Chia sẻ dữ liệu phân tích</div>
                <div className="text-sm text-gray-600">
                  Giúp cải thiện sản phẩm (dữ liệu ẩn danh)
                </div>
              </div>
              <Switch
                checked={settings.shareAnalytics}
                onCheckedChange={() => handleToggle('shareAnalytics')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Cho phép xuất dữ liệu</div>
                <div className="text-sm text-gray-600">
                  Khách hàng có thể yêu cầu xuất dữ liệu
                </div>
              </div>
              <Switch
                checked={settings.allowDataExport}
                onCheckedChange={() => handleToggle('allowDataExport')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Tuân thủ GDPR</div>
                <div className="text-sm text-gray-600">
                  Bảo vệ quyền riêng tư theo chuẩn EU
                </div>
              </div>
              <Switch
                checked={settings.gdprCompliance}
                onCheckedChange={() => handleToggle('gdprCompliance')}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Lưu trữ dữ liệu</h4>
            <div>
              <Label htmlFor="retention-days">Thời gian lưu trữ (ngày)</Label>
              <Input
                id="retention-days"
                type="number"
                value={settings.dataRetentionDays}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    dataRetentionDays: parseInt(e.target.value),
                  }))
                }
                className="mt-1 max-w-xs"
                min="30"
                max="365"
              />
              <div className="text-sm text-gray-600 mt-1">
                Dữ liệu sẽ được tự động xóa sau {settings.dataRetentionDays}{' '}
                ngày
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Lưu cài đặt
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// API settings form
const APIForm = () => {
  const [settings, setSettings] = useState(mockHotelSettings.api);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      logger.debug('Saving API settings:', 'Component', settings);
    } catch (error) {
      logger.error('Failed to save settings:', 'Component', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Cấu hình API
          </CardTitle>
          <CardDescription>Quản lý API keys và webhook</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              value={settings.webhookUrl}
              onChange={e =>
                setSettings(prev => ({ ...prev, webhookUrl: e.target.value }))
              }
              className="mt-1"
              placeholder="https://yourhotel.com/webhook"
            />
            <div className="text-sm text-gray-600 mt-1">
              URL để nhận thông báo về các sự kiện
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">API Keys</h4>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">
                  Lưu ý bảo mật
                </span>
              </div>
              <p className="text-sm text-yellow-700">
                Không chia sẻ API keys với người khác. Thay đổi ngay nếu bị lộ.
              </p>
            </div>

            <div>
              <Label htmlFor="vapi-key">Vapi API Key</Label>
              <Input
                id="vapi-key"
                type="password"
                value={settings.apiKeys.vapi}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    apiKeys: { ...prev.apiKeys, vapi: e.target.value },
                  }))
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="openai-key">OpenAI API Key</Label>
              <Input
                id="openai-key"
                type="password"
                value={settings.apiKeys.openai}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    apiKeys: { ...prev.apiKeys, openai: e.target.value },
                  }))
                }
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Lưu cài đặt
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// System status component
const SystemStatus = () => {
  const systemChecks = [
    { name: 'Database Connection', status: 'healthy', icon: Database },
    { name: 'Vapi API', status: 'healthy', icon: Phone },
    { name: 'OpenAI API', status: 'healthy', icon: Bot },
    { name: 'Email Service', status: 'healthy', icon: Mail },
    { name: 'Webhook Endpoint', status: 'warning', icon: Globe },
    { name: 'SSL Certificate', status: 'healthy', icon: Shield },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>;
      case 'warning':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Cảnh báo</Badge>
        );
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Lỗi</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Trạng thái hệ thống
        </CardTitle>
        <CardDescription>Kiểm tra tình trạng các dịch vụ</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {systemChecks.map((check, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <check.icon
                  className={`h-5 w-5 ${getStatusColor(check.status)}`}
                />
                <span className="font-medium">{check.name}</span>
              </div>
              {getStatusBadge(check.status)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Settings component
export const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Cài đặt
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Quản lý thông tin khách sạn và cấu hình hệ thống
        </p>
      </div>

      {/* System Status */}
      <SystemStatus />

      {/* Settings Tabs */}
      <Tabs defaultValue="hotel" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hotel">Khách sạn</TabsTrigger>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
          <TabsTrigger value="privacy">Quyền riêng tư</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="hotel" className="space-y-4">
          <HotelInfoForm />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationForm />
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <PrivacyForm />
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <APIForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
