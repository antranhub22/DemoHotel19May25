import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon, 
  Hotel, 
  Bot, 
  Bell, 
  Shield, 
  Key, 
  Save, 
  RefreshCw, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  // Basic settings state
  const [generalSettings, setGeneralSettings] = useState({
    hotelName: 'Minh Hồng Hotel',
    description: 'Premium hotel with AI-powered guest services',
    address: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
    phone: '+84 28 3823 4567',
    email: 'info@minhhonghotel.com',
    website: 'https://minhhonghotel.com',
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'vi',
    currency: 'VND'
  });

  const [aiSettings, setAiSettings] = useState({
    enabled: true,
    name: 'Minh Hồng Assistant',
    language: 'vi',
    responseDelay: 500,
    enableSmallTalk: true,
    enableTranscription: true,
    confidenceThreshold: 0.8,
    customInstructions: 'Bạn là trợ lý AI của khách sạn Minh Hồng. Luôn lịch sự, nhiệt tình và chuyên nghiệp.'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    newRequestAlert: true,
    systemAlerts: true,
    dailyReports: true
  });

  const handleSave = async () => {
    setLoading(true);
    setSaveStatus('saving');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Đang tải cài đặt...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
        <p className="text-gray-600 mt-2">
          Quản lý cấu hình khách sạn, AI Assistant và các tính năng khác
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Hotel className="h-4 w-4" />
            Chung
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Thông báo
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Bảo mật
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="h-5 w-5" />
                Cài đặt chung
              </CardTitle>
              <CardDescription>
                Thông tin cơ bản về khách sạn và cấu hình hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hotelName">Tên khách sạn</Label>
                    <Input
                      id="hotelName"
                      value={generalSettings.hotelName}
                      onChange={(e) => setGeneralSettings({...generalSettings, hotelName: e.target.value})}
                      placeholder="Tên khách sạn"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      value={generalSettings.phone}
                      onChange={(e) => setGeneralSettings({...generalSettings, phone: e.target.value})}
                      placeholder="+84 28 3823 4567"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={generalSettings.email}
                      onChange={(e) => setGeneralSettings({...generalSettings, email: e.target.value})}
                      placeholder="info@hotel.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={generalSettings.website}
                      onChange={(e) => setGeneralSettings({...generalSettings, website: e.target.value})}
                      placeholder="https://hotel.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea
                      id="description"
                      value={generalSettings.description}
                      onChange={(e) => setGeneralSettings({...generalSettings, description: e.target.value})}
                      placeholder="Mô tả về khách sạn..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Textarea
                      id="address"
                      value={generalSettings.address}
                      onChange={(e) => setGeneralSettings({...generalSettings, address: e.target.value})}
                      placeholder="Địa chỉ đầy đủ"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {saveStatus === 'success' && (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Đã lưu thành công</span>
                    </>
                  )}
                  {saveStatus === 'error' && (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">Lỗi khi lưu</span>
                    </>
                  )}
                </div>
                
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Cài đặt AI Assistant
              </CardTitle>
              <CardDescription>
                Cấu hình trợ lý AI cho dịch vụ khách hàng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">AI Assistant</h3>
                  <p className="text-sm text-muted-foreground">
                    Kích hoạt trợ lý AI cho dịch vụ khách hàng
                  </p>
                </div>
                <Switch
                  checked={aiSettings.enabled}
                  onCheckedChange={(checked) => setAiSettings({...aiSettings, enabled: checked})}
                />
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="assistantName">Tên trợ lý</Label>
                    <Input
                      id="assistantName"
                      value={aiSettings.name}
                      onChange={(e) => setAiSettings({...aiSettings, name: e.target.value})}
                      placeholder="Tên trợ lý AI"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="responseDelay">Độ trễ phản hồi (ms)</Label>
                    <Input
                      id="responseDelay"
                      type="number"
                      value={aiSettings.responseDelay}
                      onChange={(e) => setAiSettings({...aiSettings, responseDelay: parseInt(e.target.value)})}
                      min="0"
                      max="5000"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confidenceThreshold">Ngưỡng tin cậy</Label>
                    <Input
                      id="confidenceThreshold"
                      type="number"
                      step="0.1"
                      value={aiSettings.confidenceThreshold}
                      onChange={(e) => setAiSettings({...aiSettings, confidenceThreshold: parseFloat(e.target.value)})}
                      min="0"
                      max="1"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enableSmallTalk">Kích hoạt trò chuyện phiếm</Label>
                      <Switch
                        id="enableSmallTalk"
                        checked={aiSettings.enableSmallTalk}
                        onCheckedChange={(checked) => setAiSettings({...aiSettings, enableSmallTalk: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enableTranscription">Kích hoạt chuyển đổi văn bản</Label>
                      <Switch
                        id="enableTranscription"
                        checked={aiSettings.enableTranscription}
                        onCheckedChange={(checked) => setAiSettings({...aiSettings, enableTranscription: checked})}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="customInstructions">Hướng dẫn tùy chỉnh</Label>
                <Textarea
                  id="customInstructions"
                  value={aiSettings.customInstructions}
                  onChange={(e) => setAiSettings({...aiSettings, customInstructions: e.target.value})}
                  placeholder="Hướng dẫn chi tiết cho AI về cách phục vụ khách hàng..."
                  rows={4}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {saveStatus === 'success' && (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Đã lưu thành công</span>
                    </>
                  )}
                  {saveStatus === 'error' && (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">Lỗi khi lưu</span>
                    </>
                  )}
                </div>
                
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
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Cài đặt thông báo
              </CardTitle>
              <CardDescription>
                Quản lý cách thức nhận thông báo và cảnh báo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3">Kênh thông báo</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Email notifications</Label>
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) => setNotificationSettings({
                            ...notificationSettings, 
                            emailNotifications: checked
                          })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label>SMS notifications</Label>
                        <Switch
                          checked={notificationSettings.smsNotifications}
                          onCheckedChange={(checked) => setNotificationSettings({
                            ...notificationSettings, 
                            smsNotifications: checked
                          })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label>Push notifications</Label>
                        <Switch
                          checked={notificationSettings.pushNotifications}
                          onCheckedChange={(checked) => setNotificationSettings({
                            ...notificationSettings, 
                            pushNotifications: checked
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3">Loại thông báo</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Yêu cầu mới</Label>
                        <Switch
                          checked={notificationSettings.newRequestAlert}
                          onCheckedChange={(checked) => setNotificationSettings({
                            ...notificationSettings, 
                            newRequestAlert: checked
                          })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label>Cảnh báo hệ thống</Label>
                        <Switch
                          checked={notificationSettings.systemAlerts}
                          onCheckedChange={(checked) => setNotificationSettings({
                            ...notificationSettings, 
                            systemAlerts: checked
                          })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label>Báo cáo hàng ngày</Label>
                        <Switch
                          checked={notificationSettings.dailyReports}
                          onCheckedChange={(checked) => setNotificationSettings({
                            ...notificationSettings, 
                            dailyReports: checked
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {saveStatus === 'success' && (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Đã lưu thành công</span>
                    </>
                  )}
                  {saveStatus === 'error' && (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">Lỗi khi lưu</span>
                    </>
                  )}
                </div>
                
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Lưu cài đặt
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Cài đặt bảo mật
              </CardTitle>
              <CardDescription>
                Quản lý bảo mật tài khoản và hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Cài đặt bảo mật
                </h3>
                <p className="text-gray-600">
                  Các tùy chọn bảo mật nâng cao sẽ sớm ra mắt
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 