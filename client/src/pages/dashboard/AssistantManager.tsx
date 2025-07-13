import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Settings, 
  Mic, 
  Volume2, 
  Globe, 
  Palette, 
  Save, 
  Play, 
  Pause, 
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Phone,
  MessageSquare,
  Clock,
  Activity
} from 'lucide-react';

// Mock assistant configuration
const mockAssistantConfig = {
  id: 'asst_abc123',
  name: 'Mi Nhon Hotel AI Concierge',
  personality: 'professional',
  tone: 'friendly',
  languages: ['vi', 'en', 'fr'],
  voiceId: 'jennifer',
  silenceTimeout: 30,
  maxDuration: 600,
  backgroundSound: 'hotel-lobby',
  systemPrompt: 'You are the AI concierge for Mi Nhon Hotel...',
  status: 'active',
  lastUpdated: '2024-01-15T10:30:00Z'
};

// Mock performance metrics
const mockMetrics = {
  totalCalls: 1247,
  averageRating: 4.7,
  responseTime: 1.2,
  successRate: 96.5,
  topIntents: [
    { intent: 'Room Service', count: 342, percentage: 27.4 },
    { intent: 'Hotel Information', count: 298, percentage: 23.9 },
    { intent: 'Spa Booking', count: 187, percentage: 15.0 },
    { intent: 'Restaurant Reservation', count: 156, percentage: 12.5 }
  ]
};

// Assistant configuration form
const AssistantConfigForm = () => {
  const [config, setConfig] = useState(mockAssistantConfig);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Saving configuration:', config);
    } catch (error) {
      console.error('Failed to save configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Cấu hình cơ bản
          </CardTitle>
          <CardDescription>
            Thiết lập thông tin và hành vi của AI Assistant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assistant-name">Tên Assistant</Label>
              <Input
                id="assistant-name"
                value={config.name}
                onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="voice-id">Giọng nói</Label>
              <Select 
                value={config.voiceId} 
                onValueChange={(value) => setConfig(prev => ({ ...prev, voiceId: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jennifer">Jennifer (Nữ, Tiếng Anh)</SelectItem>
                  <SelectItem value="david">David (Nam, Tiếng Anh)</SelectItem>
                  <SelectItem value="linh">Linh (Nữ, Tiếng Việt)</SelectItem>
                  <SelectItem value="duc">Đức (Nam, Tiếng Việt)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="personality">Tính cách</Label>
              <Select 
                value={config.personality} 
                onValueChange={(value) => setConfig(prev => ({ ...prev, personality: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Chuyên nghiệp</SelectItem>
                  <SelectItem value="friendly">Thân thiện</SelectItem>
                  <SelectItem value="luxurious">Sang trọng</SelectItem>
                  <SelectItem value="casual">Thoải mái</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tone">Giọng điệu</Label>
              <Select 
                value={config.tone} 
                onValueChange={(value) => setConfig(prev => ({ ...prev, tone: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Lịch sự</SelectItem>
                  <SelectItem value="friendly">Thân thiện</SelectItem>
                  <SelectItem value="warm">Ấm áp</SelectItem>
                  <SelectItem value="energetic">Năng động</SelectItem>
                  <SelectItem value="calm">Bình tĩnh</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="silence-timeout">Thời gian chờ (giây)</Label>
              <Input
                id="silence-timeout"
                type="number"
                value={config.silenceTimeout}
                onChange={(e) => setConfig(prev => ({ ...prev, silenceTimeout: parseInt(e.target.value) }))}
                className="mt-1"
                min="10"
                max="120"
              />
            </div>
            <div>
              <Label htmlFor="max-duration">Thời lượng tối đa (giây)</Label>
              <Input
                id="max-duration"
                type="number"
                value={config.maxDuration}
                onChange={(e) => setConfig(prev => ({ ...prev, maxDuration: parseInt(e.target.value) }))}
                className="mt-1"
                min="300"
                max="3600"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="background-sound">Âm thanh nền</Label>
            <Select 
              value={config.backgroundSound} 
              onValueChange={(value) => setConfig(prev => ({ ...prev, backgroundSound: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hotel-lobby">Sảnh khách sạn</SelectItem>
                <SelectItem value="office">Văn phòng</SelectItem>
                <SelectItem value="off">Tắt âm thanh nền</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            System Prompt
          </CardTitle>
          <CardDescription>
            Hướng dẫn chi tiết cho AI Assistant về cách hành xử và trả lời
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={config.systemPrompt}
            onChange={(e) => setConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
            rows={8}
            className="font-mono text-sm"
            placeholder="Nhập system prompt cho AI Assistant..."
          />
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
              Lưu cấu hình
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Assistant testing component
const AssistantTester = () => {
  const [isTestMode, setIsTestMode] = useState(false);
  const [testPhrase, setTestPhrase] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const handleTest = async () => {
    if (!testPhrase.trim()) return;
    
    setIsTesting(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestResponse(`Xin chào! Tôi là AI Assistant của Mi Nhon Hotel. Tôi có thể giúp bạn về ${testPhrase}. Bạn có cần tôi hỗ trợ gì thêm không?`);
    } catch (error) {
      setTestResponse('Đã xảy ra lỗi khi kiểm tra. Vui lòng thử lại.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Test AI Assistant
          </CardTitle>
          <CardDescription>
            Kiểm tra phản hồi của AI Assistant với các câu hỏi mẫu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="test-mode"
              checked={isTestMode}
              onCheckedChange={setIsTestMode}
            />
            <Label htmlFor="test-mode">Chế độ kiểm tra</Label>
          </div>
          
          {isTestMode && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="test-phrase">Câu hỏi thử nghiệm</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="test-phrase"
                    value={testPhrase}
                    onChange={(e) => setTestPhrase(e.target.value)}
                    placeholder="Ví dụ: Tôi muốn đặt phòng"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleTest}
                    disabled={!testPhrase.trim() || isTesting}
                  >
                    {isTesting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {testResponse && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Label className="text-sm font-medium">Phản hồi của AI:</Label>
                  <p className="text-sm text-gray-700 mt-1">{testResponse}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Mẫu câu hỏi thường gặp</CardTitle>
          <CardDescription>
            Các câu hỏi mà khách hàng thường hỏi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              'Tôi muốn đặt phòng',
              'Giờ check-in là mấy giờ?',
              'Khách sạn có dịch vụ spa không?',
              'Tôi muốn đặt bàn ăn tối',
              'Làm sao để đi sân bay?',
              'Có wifi miễn phí không?',
              'Tôi muốn gọi room service',
              'Khách sạn có hồ bơi không?'
            ].map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="justify-start text-left h-auto p-2"
                onClick={() => setTestPhrase(question)}
              >
                <MessageSquare className="w-3 h-3 mr-2 shrink-0" />
                <span className="text-xs">{question}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Performance metrics component
const PerformanceMetrics = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng cuộc gọi</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.totalCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Tháng này</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đánh giá trung bình</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.averageRating}/5</div>
            <p className="text-xs text-muted-foreground">Điểm hài lòng</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thời gian phản hồi</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.responseTime}s</div>
            <p className="text-xs text-muted-foreground">Trung bình</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ thành công</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.successRate}%</div>
            <p className="text-xs text-muted-foreground">Cuộc gọi thành công</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Ý định phổ biến</CardTitle>
          <CardDescription>
            Các yêu cầu mà khách hàng thường hỏi nhất
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockMetrics.topIntents.map((intent, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="font-medium">{intent.intent}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{intent.count}</span>
                  <Badge variant="outline">{intent.percentage}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Assistant Manager component
export const AssistantManager: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Quản lý và tùy chỉnh AI Assistant cho khách sạn
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Hoạt động
          </Badge>
        </div>
      </div>
      
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Trạng thái Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Tên Assistant</Label>
              <p className="text-sm text-gray-600">{mockAssistantConfig.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">ID Assistant</Label>
              <p className="text-sm text-gray-600 font-mono">{mockAssistantConfig.id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Cập nhật lần cuối</Label>
              <p className="text-sm text-gray-600">
                {new Date(mockAssistantConfig.lastUpdated).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs */}
      <Tabs defaultValue="config" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">Cấu hình</TabsTrigger>
          <TabsTrigger value="test">Kiểm tra</TabsTrigger>
          <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config" className="space-y-4">
          <AssistantConfigForm />
        </TabsContent>
        
        <TabsContent value="test" className="space-y-4">
          <AssistantTester />
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <PerformanceMetrics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssistantManager; 