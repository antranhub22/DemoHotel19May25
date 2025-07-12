import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Volume2,
  RefreshCw,
  ExternalLink,
  Phone,
  MapPin,
  Clock,
  Star,
  Users,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Waves,
  ShieldCheck,
  XCircle,
  ChevronRight,
  ChevronDown,
  Info
} from 'lucide-react';

// Import API service and types
import { 
  dashboardApi, 
  HotelData, 
  AssistantCustomization, 
  ApiError,
  PERSONALITY_OPTIONS,
  TONE_OPTIONS,
  LANGUAGE_OPTIONS,
  BACKGROUND_SOUND_OPTIONS,
  validateHotelData,
  validateAssistantCustomization
} from '@/services/dashboardApi';

// ============================================
// Types & Interfaces
// ============================================

interface SetupWizardState {
  currentStep: number;
  hotelData: HotelData | null;
  customization: AssistantCustomization;
  isLoading: boolean;
  error: ApiError | null;
  isResearching: boolean;
  isGenerating: boolean;
  assistantId: string | null;
  retryCount: number;
  formData: {
    hotelName: string;
    location: string;
    researchTier: 'basic' | 'advanced';
  };
  validation: {
    hotelName: string | null;
    languages: string | null;
  };
}

interface StepProps {
  state: SetupWizardState;
  onNext: (data?: any) => void;
  onBack: () => void;
  onError: (error: ApiError) => void;
  onUpdateState: (updates: Partial<SetupWizardState>) => void;
}

// ============================================
// Step 1: Hotel Search Component
// ============================================

const HotelSearchStep: React.FC<StepProps> = ({ state, onNext, onError, onUpdateState }) => {
  const handleInputChange = (field: string, value: string) => {
    onUpdateState({
      formData: { ...state.formData, [field]: value },
      validation: { ...state.validation, [field]: null }
    });
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    
    if (!state.formData.hotelName.trim()) {
      errors.hotelName = 'Tên khách sạn là bắt buộc';
    } else if (state.formData.hotelName.length < 2) {
      errors.hotelName = 'Tên khách sạn phải có ít nhất 2 ký tự';
    }

    onUpdateState({ validation: { ...state.validation, ...errors } });
    return Object.keys(errors).length === 0;
  };

  const handleSearch = async () => {
    if (!validateForm()) return;

    onUpdateState({ isResearching: true, error: null });
    
    try {
      const response = await dashboardApi.researchHotel({
        hotelName: state.formData.hotelName,
        location: state.formData.location || undefined,
        researchTier: state.formData.researchTier
      });

      if (response.success && validateHotelData(response.hotelData)) {
        onNext(response.hotelData);
      } else {
        onError({ error: 'Dữ liệu khách sạn không hợp lệ' });
      }
    } catch (error) {
      onError(error as ApiError);
    } finally {
      onUpdateState({ isResearching: false });
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
              value={state.formData.hotelName}
              onChange={(e) => handleInputChange('hotelName', e.target.value)}
              className={`mt-1 ${state.validation.hotelName ? 'border-red-500' : ''}`}
            />
            {state.validation.hotelName && (
              <p className="text-sm text-red-500 mt-1">{state.validation.hotelName}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="location">Địa điểm (không bắt buộc)</Label>
            <Input
              id="location"
              placeholder="Ví dụ: Ho Chi Minh City, Vietnam"
              value={state.formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="research-tier">Mức độ nghiên cứu</Label>
            <Select 
              value={state.formData.researchTier} 
              onValueChange={(value: any) => handleInputChange('researchTier', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Cơ bản (Miễn phí)</SelectItem>
                <SelectItem value="advanced">Nâng cao (Premium)</SelectItem>
              </SelectContent>
            </Select>
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
            {state.formData.researchTier === 'advanced' && (
              <>
                <li>• Dữ liệu mạng xã hội</li>
                <li>• Phân tích đánh giá khách hàng</li>
                <li>• Thông tin đối thủ cạnh tranh</li>
              </>
            )}
          </ul>
        </div>

        {state.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {state.error.error}
              {state.error.upgradeRequired && (
                <div className="mt-2">
                  <Button variant="outline" size="sm">
                    Nâng cấp gói dịch vụ
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={handleSearch}
          disabled={!state.formData.hotelName.trim() || state.isResearching}
          className="w-full"
          size="lg"
        >
          {state.isResearching ? (
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

// ============================================
// Step 2: Review Hotel Data Component
// ============================================

const ReviewDataStep: React.FC<StepProps> = ({ state, onNext, onBack, onError, onUpdateState }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<HotelData | null>(state.hotelData);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing && editedData) {
      // Save changes
      onUpdateState({ hotelData: editedData });
    }
  };

  const handleNext = () => {
    if (state.hotelData) {
      onNext();
    }
  };

  if (!state.hotelData) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p>Không tìm thấy dữ liệu khách sạn. Vui lòng thử lại.</p>
          <Button onClick={onBack} className="mt-4">
            Quay lại
          </Button>
        </CardContent>
      </Card>
    );
  }

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

      <div className="flex justify-center gap-2 mb-6">
        <Button
          variant={isEditing ? "default" : "outline"}
          onClick={handleEdit}
          size="sm"
        >
          <Settings className="w-4 h-4 mr-2" />
          {isEditing ? 'Lưu thay đổi' : 'Chỉnh sửa'}
        </Button>
        <Button variant="outline" onClick={onBack} size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tìm kiếm lại
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader 
            className="cursor-pointer"
            onClick={() => toggleSection('basic')}
          >
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hotel className="h-5 w-5" />
                Thông tin cơ bản
              </div>
              {expandedSections.has('basic') ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              }
            </CardTitle>
          </CardHeader>
          {expandedSections.has('basic') && (
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Tên khách sạn</Label>
                <p className="font-medium">{state.hotelData.name}</p>
              </div>
              <div className="space-y-2">
                <Label>Địa chỉ</Label>
                <p className="text-sm text-gray-600">{state.hotelData.address}</p>
              </div>
              {state.hotelData.phone && (
                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <p className="text-sm">{state.hotelData.phone}</p>
                </div>
              )}
              {state.hotelData.website && (
                <div className="space-y-2">
                  <Label>Website</Label>
                  <a 
                    href={state.hotelData.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                  >
                    {state.hotelData.website}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {state.hotelData.rating && (
                <div className="space-y-2">
                  <Label>Đánh giá</Label>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{state.hotelData.rating}</span>
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Services */}
        <Card>
          <CardHeader 
            className="cursor-pointer"
            onClick={() => toggleSection('services')}
          >
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Dịch vụ ({state.hotelData.services.length})
              </div>
              {expandedSections.has('services') ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              }
            </CardTitle>
          </CardHeader>
          {expandedSections.has('services') && (
            <CardContent>
              <div className="space-y-2">
                {state.hotelData.services.map((service, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded">
                    <div className="font-medium text-sm">{service.name}</div>
                    <div className="text-xs text-gray-600">{service.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader 
            className="cursor-pointer"
            onClick={() => toggleSection('amenities')}
          >
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                Tiện nghi ({state.hotelData.amenities.length})
              </div>
              {expandedSections.has('amenities') ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              }
            </CardTitle>
          </CardHeader>
          {expandedSections.has('amenities') && (
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {state.hotelData.amenities.map((amenity, index) => (
                  <Badge key={index} variant="secondary">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Room Types */}
        <Card>
          <CardHeader 
            className="cursor-pointer"
            onClick={() => toggleSection('rooms')}
          >
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Loại phòng ({state.hotelData.roomTypes.length})
              </div>
              {expandedSections.has('rooms') ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              }
            </CardTitle>
          </CardHeader>
          {expandedSections.has('rooms') && (
            <CardContent>
              <div className="space-y-3">
                {state.hotelData.roomTypes.map((room, index) => (
                  <div key={index} className="p-3 border rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{room.name}</div>
                        <div className="text-sm text-gray-600">{room.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {room.price.toLocaleString()} VND
                        </div>
                        <div className="text-xs text-gray-500">/ đêm</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Policies */}
        <Card>
          <CardHeader 
            className="cursor-pointer"
            onClick={() => toggleSection('policies')}
          >
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Chính sách
              </div>
              {expandedSections.has('policies') ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              }
            </CardTitle>
          </CardHeader>
          {expandedSections.has('policies') && (
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Check-in:</span>
                <span className="font-medium">{state.hotelData.policies.checkIn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Check-out:</span>
                <span className="font-medium">{state.hotelData.policies.checkOut}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Hủy phòng:</span>
                <span className="font-medium">{state.hotelData.policies.cancellation}</span>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Local Attractions */}
        <Card>
          <CardHeader 
            className="cursor-pointer"
            onClick={() => toggleSection('attractions')}
          >
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Điểm tham quan ({state.hotelData.localAttractions.length})
              </div>
              {expandedSections.has('attractions') ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              }
            </CardTitle>
          </CardHeader>
          {expandedSections.has('attractions') && (
            <CardContent>
              <div className="space-y-2">
                {state.hotelData.localAttractions.map((attraction, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded">
                    <div className="font-medium text-sm">{attraction.name}</div>
                    <div className="text-xs text-gray-600">{attraction.description}</div>
                    {attraction.distance && (
                      <div className="text-xs text-blue-600 mt-1">
                        Cách {attraction.distance}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <Button onClick={handleNext} size="lg">
          Tiếp tục
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

// ============================================
// Step 3: Customize Assistant Component
// ============================================

const CustomizeAssistantStep: React.FC<StepProps> = ({ state, onNext, onBack, onError, onUpdateState }) => {
  const updateCustomization = (field: string, value: any) => {
    onUpdateState({
      customization: { ...state.customization, [field]: value },
      validation: { ...state.validation, [field]: null }
    });
  };

  const handleLanguageChange = (language: string, checked: boolean) => {
    let newLanguages = [...state.customization.languages];
    if (checked) {
      newLanguages.push(language);
    } else {
      newLanguages = newLanguages.filter(lang => lang !== language);
    }
    updateCustomization('languages', newLanguages);
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    
    if (state.customization.languages.length === 0) {
      errors.languages = 'Vui lòng chọn ít nhất một ngôn ngữ';
    }

    onUpdateState({ validation: { ...state.validation, ...errors } });
    return Object.keys(errors).length === 0;
  };

  const handleGenerate = async () => {
    if (!validateForm() || !state.hotelData) return;

    if (!validateAssistantCustomization(state.customization)) {
      onError({ error: 'Cấu hình Assistant không hợp lệ' });
      return;
    }

    onUpdateState({ isGenerating: true, error: null });
    
    try {
      const response = await dashboardApi.generateAssistant({
        hotelData: state.hotelData,
        customization: state.customization
      });

      if (response.success) {
        onNext(response.assistantId);
      } else {
        onError({ error: 'Không thể tạo Assistant' });
      }
    } catch (error) {
      onError(error as ApiError);
    } finally {
      onUpdateState({ isGenerating: false });
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
              value={state.customization.personality} 
              onValueChange={(value) => updateCustomization('personality', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERSONALITY_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
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
              Chọn cách thức giao tiếp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              value={state.customization.tone} 
              onValueChange={(value) => updateCustomization('tone', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Languages */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Ngôn ngữ hỗ trợ
            </CardTitle>
            <CardDescription>
              Chọn các ngôn ngữ mà AI Assistant có thể giao tiếp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {LANGUAGE_OPTIONS.map(language => (
                <div key={language.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={language.value}
                    checked={state.customization.languages.includes(language.value)}
                    onCheckedChange={(checked) => 
                      handleLanguageChange(language.value, checked as boolean)
                    }
                  />
                  <Label htmlFor={language.value} className="flex items-center gap-2 cursor-pointer">
                    <span>{language.flag}</span>
                    <span>{language.label}</span>
                  </Label>
                </div>
              ))}
            </div>
            {state.validation.languages && (
              <p className="text-sm text-red-500 mt-2">{state.validation.languages}</p>
            )}
          </CardContent>
        </Card>

        {/* Voice Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Cài đặt giọng nói
            </CardTitle>
            <CardDescription>
              Điều chỉnh thời gian và âm thanh
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Thời gian chờ (giây)</Label>
              <Input
                type="number"
                min="10"
                max="120"
                value={state.customization.silenceTimeout || 30}
                onChange={(e) => updateCustomization('silenceTimeout', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Thời gian tối đa (giây)</Label>
              <Input
                type="number"
                min="300"
                max="3600"
                value={state.customization.maxDuration || 1800}
                onChange={(e) => updateCustomization('maxDuration', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Background Sound */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Âm thanh nền
            </CardTitle>
            <CardDescription>
              Chọn âm thanh nền cho cuộc gọi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              value={state.customization.backgroundSound} 
              onValueChange={(value) => updateCustomization('backgroundSound', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BACKGROUND_SOUND_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {state.error.error}
            {state.error.upgradeRequired && (
              <div className="mt-2">
                <Button variant="outline" size="sm">
                  Nâng cấp gói dịch vụ
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <Button 
          onClick={handleGenerate}
          disabled={state.customization.languages.length === 0 || state.isGenerating}
          size="lg"
        >
          {state.isGenerating ? (
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

// ============================================
// Step 4: Success Component
// ============================================

const SuccessStep: React.FC<StepProps> = ({ state, onUpdateState }) => {
  const [, setLocation] = useLocation();

  const handleFinish = () => {
    setLocation('/dashboard');
  };

  const handleTestAssistant = () => {
    // Navigate to test page or open assistant
    setLocation('/dashboard/assistant');
  };

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

        {state.assistantId && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Thông tin Assistant:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <div>ID: <code className="bg-blue-100 px-1 rounded">{state.assistantId}</code></div>
              <div>Tính cách: <span className="capitalize">{state.customization.personality}</span></div>
              <div>Ngôn ngữ: {state.customization.languages.join(', ')}</div>
            </div>
          </div>
        )}
        
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Bạn có thể bắt đầu sử dụng AI Assistant ngay bây giờ hoặc tùy chỉnh thêm trong cài đặt.
          </p>
          <div className="flex gap-3">
            <Button onClick={handleTestAssistant} variant="outline" className="flex-1">
              <Phone className="w-4 h-4 mr-2" />
              Kiểm tra Assistant
            </Button>
            <Button onClick={handleFinish} size="lg" className="flex-1">
              Đi tới Dashboard
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// Main Setup Wizard Component
// ============================================

export const SetupWizard: React.FC = () => {
  const [state, setState] = useState<SetupWizardState>({
    currentStep: 1,
    hotelData: null,
    customization: {
      personality: 'professional',
      tone: 'friendly',
      languages: ['vi'],
      backgroundSound: 'hotel-lobby'
    },
    isLoading: false,
    error: null,
    isResearching: false,
    isGenerating: false,
    assistantId: null,
    retryCount: 0,
    formData: {
      hotelName: '',
      location: '',
      researchTier: 'basic'
    },
    validation: {
      hotelName: null,
      languages: null
    }
  });

  const totalSteps = 4;
  const progress = (state.currentStep / totalSteps) * 100;

  const updateState = (updates: Partial<SetupWizardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleNext = (data?: any) => {
    if (state.currentStep === 1 && data) {
      // Hotel research completed
      updateState({ 
        hotelData: data, 
        currentStep: 2,
        error: null 
      });
    } else if (state.currentStep === 2) {
      // Hotel data reviewed
      updateState({ 
        currentStep: 3,
        error: null 
      });
    } else if (state.currentStep === 3 && data) {
      // Assistant generated
      updateState({ 
        assistantId: data, 
        currentStep: 4,
        error: null 
      });
    }
  };

  const handleBack = () => {
    if (state.currentStep > 1) {
      updateState({ 
        currentStep: state.currentStep - 1,
        error: null 
      });
    }
  };

  const handleError = (error: ApiError) => {
    updateState({ error });
  };

  const handleRetry = () => {
    updateState({ 
      error: null, 
      retryCount: state.retryCount + 1 
    });
  };

  const stepProps: StepProps = {
    state,
    onNext: handleNext,
    onBack: handleBack,
    onError: handleError,
    onUpdateState: updateState
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Bước {state.currentStep} / {totalSteps}</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Global Error */}
        {state.error && (
          <div className="max-w-2xl mx-auto mb-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{state.error.error}</span>
                <Button variant="outline" size="sm" onClick={handleRetry}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Thử lại
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Steps */}
        {state.currentStep === 1 && <HotelSearchStep {...stepProps} />}
        {state.currentStep === 2 && <ReviewDataStep {...stepProps} />}
        {state.currentStep === 3 && <CustomizeAssistantStep {...stepProps} />}
        {state.currentStep === 4 && <SuccessStep {...stepProps} />}
      </div>
    </div>
  );
};

export default SetupWizard; 