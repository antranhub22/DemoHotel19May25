import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Bot, 
  Settings, 
  ArrowRight, 
  ArrowLeft,
  Hotel,
  Globe,
  Mic,
  Palette,
  Volume2
} from 'lucide-react';

// Types
interface HotelData {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  amenities: string[];
  services: string[];
  policies: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
  };
  roomTypes: Array<{
    name: string;
    price: number;
    description: string;
  }>;
  localAttractions: string[];
}

interface AssistantCustomization {
  personality: 'professional' | 'friendly' | 'luxurious' | 'casual';
  tone: 'formal' | 'friendly' | 'warm' | 'energetic' | 'calm';
  languages: string[];
  voiceId?: string;
  silenceTimeout?: number;
  maxDuration?: number;
  backgroundSound: 'office' | 'off' | 'hotel-lobby';
}

// Mock hotel data for demonstration
const mockHotelData: HotelData = {
  name: "Grand Hotel Saigon",
  address: "123 Nguyen Hue Street, District 1, Ho Chi Minh City",
  phone: "+84 28 3829 2999",
  website: "https://grandhotelsaigon.com",
  amenities: ["WiFi miễn phí", "Hồ bơi", "Spa", "Phòng gym", "Nhà hàng", "Bar", "Dịch vụ phòng 24/7"],
  services: ["Concierge", "Valet parking", "Laundry", "Room service", "Airport shuttle"],
  policies: {
    checkIn: "14:00",
    checkOut: "12:00",
    cancellation: "Miễn phí hủy trước 24h"
  },
  roomTypes: [
    { name: "Phòng Deluxe", price: 150, description: "Phòng tiêu chuẩn với view thành phố" },
    { name: "Phòng Superior", price: 200, description: "Phòng rộng rãi với ban công" },
    { name: "Suite Junior", price: 350, description: "Phòng suite với phòng khách riêng" }
  ],
  localAttractions: ["Chợ Bến Thành", "Nhà hát Thành phố", "Dinh Độc Lập", "Bưu điện TP.HCM"]
};

// Step 1: Hotel Search
const HotelSearchStep = ({ 
  onNext, 
  isLoading 
}: { 
  onNext: (hotelName: string, location?: string) => void;
  isLoading: boolean;
}) => {
  const [hotelName, setHotelName] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = () => {
    if (hotelName.trim()) {
      onNext(hotelName, location || undefined);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Search className="h-6 w-6" />
          </div>
        </div>
        <CardTitle className="text-2xl">Tìm kiếm thông tin khách sạn</CardTitle>
        <CardDescription>
          Chúng tôi sẽ tự động nghiên cứu và thu thập thông tin về khách sạn của bạn
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="hotel-name">Tên khách sạn *</Label>
            <Input
              id="hotel-name"
              placeholder="Ví dụ: Grand Hotel Saigon"
              value={hotelName}
              onChange={(e) => setHotelName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="location">Địa điểm (không bắt buộc)</Label>
            <Input
              id="location"
              placeholder="Ví dụ: Ho Chi Minh City, Vietnam"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Thông tin sẽ được thu thập:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Thông tin cơ bản (địa chỉ, số điện thoại, website)</li>
            <li>• Dịch vụ và tiện nghi</li>
            <li>• Các loại phòng và giá cả</li>
            <li>• Chính sách check-in/check-out</li>
            <li>• Các điểm tham quan gần đó</li>
          </ul>
        </div>
        
        <Button 
          onClick={handleSearch}
          disabled={!hotelName.trim() || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang tìm kiếm...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Tìm kiếm khách sạn
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

// Step 2: Review Hotel Data
const ReviewDataStep = ({ 
  hotelData, 
  onNext, 
  onBack,
  onEdit 
}: { 
  hotelData: HotelData;
  onNext: () => void;
  onBack: () => void;
  onEdit: () => void;
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">Xác nhận thông tin khách sạn</h2>
        <p className="text-gray-600 mt-2">
          Vui lòng kiểm tra và xác nhận thông tin đã thu thập
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hotel className="h-5 w-5" />
              Thông tin cơ bản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Tên khách sạn</Label>
              <p className="text-sm text-gray-600">{hotelData.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Địa chỉ</Label>
              <p className="text-sm text-gray-600">{hotelData.address}</p>
            </div>
            {hotelData.phone && (
              <div>
                <Label className="text-sm font-medium">Điện thoại</Label>
                <p className="text-sm text-gray-600">{hotelData.phone}</p>
              </div>
            )}
            {hotelData.website && (
              <div>
                <Label className="text-sm font-medium">Website</Label>
                <p className="text-sm text-blue-600 hover:underline">
                  <a href={hotelData.website} target="_blank" rel="noopener noreferrer">
                    {hotelData.website}
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Services & Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Dịch vụ & Tiện nghi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Tiện nghi</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {hotelData.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Dịch vụ</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {hotelData.services.map((service, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Policies */}
        <Card>
          <CardHeader>
            <CardTitle>Chính sách</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Check-in</Label>
              <p className="text-sm text-gray-600">{hotelData.policies.checkIn}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Check-out</Label>
              <p className="text-sm text-gray-600">{hotelData.policies.checkOut}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Hủy phòng</Label>
              <p className="text-sm text-gray-600">{hotelData.policies.cancellation}</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Room Types */}
        <Card>
          <CardHeader>
            <CardTitle>Loại phòng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hotelData.roomTypes.map((room, index) => (
                <div key={index} className="border-b pb-2 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{room.name}</p>
                      <p className="text-xs text-gray-600">{room.description}</p>
                    </div>
                    <Badge variant="outline">${room.price}/đêm</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <div className="space-x-3">
          <Button variant="outline" onClick={onEdit}>
            Chỉnh sửa
          </Button>
          <Button onClick={onNext}>
            Xác nhận và tiếp tục
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Step 3: Customize Assistant
const CustomizeAssistantStep = ({ 
  onNext, 
  onBack,
  isGenerating 
}: { 
  onNext: (customization: AssistantCustomization) => void;
  onBack: () => void;
  isGenerating: boolean;
}) => {
  const [customization, setCustomization] = useState<AssistantCustomization>({
    personality: 'professional',
    tone: 'friendly',
    languages: ['vi'],
    backgroundSound: 'hotel-lobby'
  });

  const handleLanguageChange = (language: string, checked: boolean) => {
    if (checked) {
      setCustomization(prev => ({
        ...prev,
        languages: [...prev.languages, language]
      }));
    } else {
      setCustomization(prev => ({
        ...prev,
        languages: prev.languages.filter(lang => lang !== language)
      }));
    }
  };

  const handleGenerate = () => {
    if (customization.languages.length > 0) {
      onNext(customization);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
            <Bot className="h-6 w-6" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">Tùy chỉnh AI Assistant</h2>
        <p className="text-gray-600 mt-2">
          Cá nhân hóa AI Assistant theo phong cách khách sạn của bạn
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personality */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Tính cách
            </CardTitle>
            <CardDescription>
              Chọn phong cách giao tiếp của AI Assistant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              value={customization.personality} 
              onValueChange={(value: any) => setCustomization(prev => ({ ...prev, personality: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Chuyên nghiệp</SelectItem>
                <SelectItem value="friendly">Thân thiện</SelectItem>
                <SelectItem value="luxurious">Sang trọng</SelectItem>
                <SelectItem value="casual">Thoải mái</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        
        {/* Tone */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Giọng điệu
            </CardTitle>
            <CardDescription>
              Cách AI Assistant thể hiện trong cuộc trò chuyện
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              value={customization.tone} 
              onValueChange={(value: any) => setCustomization(prev => ({ ...prev, tone: value }))}
            >
              <SelectTrigger>
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
          </CardContent>
        </Card>
        
        {/* Languages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Ngôn ngữ hỗ trợ
            </CardTitle>
            <CardDescription>
              Chọn các ngôn ngữ AI Assistant có thể giao tiếp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { code: 'vi', name: 'Tiếng Việt' },
              { code: 'en', name: 'English' },
              { code: 'fr', name: 'Français' },
              { code: 'ko', name: '한국어' },
              { code: 'zh', name: '中文' }
            ].map((lang) => (
              <div key={lang.code} className="flex items-center space-x-2">
                <Checkbox
                  id={lang.code}
                  checked={customization.languages.includes(lang.code)}
                  onCheckedChange={(checked) => handleLanguageChange(lang.code, checked as boolean)}
                />
                <Label htmlFor={lang.code} className="text-sm font-medium">
                  {lang.name}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>
        
        {/* Background Sound */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Âm thanh nền
            </CardTitle>
            <CardDescription>
              Chọn âm thanh nền cho cuộc gọi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              value={customization.backgroundSound} 
              onValueChange={(value: any) => setCustomization(prev => ({ ...prev, backgroundSound: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hotel-lobby">Sảnh khách sạn</SelectItem>
                <SelectItem value="office">Văn phòng</SelectItem>
                <SelectItem value="off">Tắt âm thanh nền</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <Button 
          onClick={handleGenerate}
          disabled={customization.languages.length === 0 || isGenerating}
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang tạo Assistant...
            </>
          ) : (
            <>
              <Bot className="w-4 h-4 mr-2" />
              Tạo AI Assistant
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Step 4: Success
const SuccessStep = ({ onFinish }: { onFinish: () => void }) => {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
        </div>
        <CardTitle className="text-2xl">AI Assistant đã sẵn sàng!</CardTitle>
        <CardDescription className="text-base">
          Khách sạn của bạn đã được thiết lập thành công. AI Assistant hiện có thể phục vụ khách hàng 24/7.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">Những gì đã được thiết lập:</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>✓ Thông tin khách sạn đã được lưu trữ</li>
            <li>✓ Knowledge base đã được tạo</li>
            <li>✓ AI Assistant đã được cấu hình</li>
            <li>✓ Voice API đã được kích hoạt</li>
            <li>✓ Dashboard đã sẵn sàng sử dụng</li>
          </ul>
        </div>
        
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Bạn có thể bắt đầu sử dụng AI Assistant ngay bây giờ hoặc tùy chỉnh thêm trong cài đặt.
          </p>
          <Button onClick={onFinish} size="lg" className="w-full">
            Đi tới Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Setup Wizard Component
export const SetupWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [hotelData, setHotelData] = useState<HotelData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleHotelSearch = async (hotelName: string, location?: string) => {
    setIsSearching(true);
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setHotelData(mockHotelData);
      setCurrentStep(2);
    } catch (error) {
      console.error('Hotel search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGenerateAssistant = async (customization: AssistantCustomization) => {
    setIsGenerating(true);
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      setCurrentStep(4);
    } catch (error) {
      console.error('Assistant generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinish = () => {
    // Navigate to dashboard
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Bước {currentStep} / {totalSteps}</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps */}
        {currentStep === 1 && (
          <HotelSearchStep
            onNext={handleHotelSearch}
            isLoading={isSearching}
          />
        )}
        
        {currentStep === 2 && hotelData && (
          <ReviewDataStep
            hotelData={hotelData}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
            onEdit={() => setCurrentStep(1)}
          />
        )}
        
        {currentStep === 3 && (
          <CustomizeAssistantStep
            onNext={handleGenerateAssistant}
            onBack={() => setCurrentStep(2)}
            isGenerating={isGenerating}
          />
        )}
        
        {currentStep === 4 && (
          <SuccessStep onFinish={handleFinish} />
        )}
      </div>
    </div>
  );
};

export default SetupWizard; 