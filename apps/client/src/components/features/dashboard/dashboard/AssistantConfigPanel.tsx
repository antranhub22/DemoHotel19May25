import {
  Bot,
  Settings,
  Save,
  RefreshCw,
  Play,
  AlertCircle,
  Loader2,
  MessageSquare,
  Palette,
  Headphones,
  Languages,
} from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { logger } from '@shared/utils/logger';

// Types
interface AssistantConfig {
  id?: string;
  name: string;
  personality: 'professional' | 'friendly' | 'luxurious' | 'casual';
  tone: 'formal' | 'friendly' | 'warm' | 'energetic' | 'calm';
  languages: string[];
  voiceSettings: {
    voiceId: string;
    speed: number;
    pitch: number;
    volume: number;
  };
  behaviorSettings: {
    silenceTimeout: number;
    maxCallDuration: number;
    interruptible: boolean;
    backgroundSound: 'office' | 'off' | 'hotel-lobby';
  };
  conversationSettings: {
    greeting: string;
    fallbackMessage: string;
    endCallMessage: string;
    transferMessage: string;
  };
  systemPrompt: string;
  features: {
    voiceCloning: boolean;
    multilingual: boolean;
    sentimentAnalysis: boolean;
    callRecording: boolean;
    realTimeTranscription: boolean;
  };
  status: 'active' | 'inactive' | 'testing';
  lastUpdated?: string;
}

interface AssistantConfigPanelProps {
  config: AssistantConfig | null;
  isLoading: boolean;
  isSaving: boolean;
  error?: string | null;
  onSave: (config: AssistantConfig) => Promise<void>;
  onTest: (config: AssistantConfig) => Promise<void>;
  onReset: () => void;
  className?: string;
  disabled?: boolean;
}

// Available voices
const AVAILABLE_VOICES = [
  {
    id: 'jennifer',
    name: 'Jennifer',
    gender: 'Nữ',
    language: 'English',
    sample: 'Hello, welcome to our hotel.',
  },
  {
    id: 'david',
    name: 'David',
    gender: 'Nam',
    language: 'English',
    sample: 'Good morning, how can I help you?',
  },
  {
    id: 'linh',
    name: 'Linh',
    gender: 'Nữ',
    language: 'Tiếng Việt',
    sample: 'Xin chào, tôi có thể giúp gì?',
  },
  {
    id: 'duc',
    name: 'Đức',
    gender: 'Nam',
    language: 'Tiếng Việt',
    sample: 'Chào bạn, cần hỗ trợ gì không?',
  },
  {
    id: 'marie',
    name: 'Marie',
    gender: 'Nữ',
    language: 'Français',
    sample: 'Bonjour, comment puis-je vous aider?',
  },
];

// Available languages
const AVAILABLE_LANGUAGES = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

// Personality options
const PERSONALITY_OPTIONS = [
  {
    value: 'professional',
    label: 'Chuyên nghiệp',
    description: 'Lịch sự, trang trọng, chuyên nghiệp',
  },
  {
    value: 'friendly',
    label: 'Thân thiện',
    description: 'Gần gũi, nhiệt tình, dễ tiếp cận',
  },
  {
    value: 'luxurious',
    label: 'Sang trọng',
    description: 'Lịch lãm, tinh tế, đẳng cấp',
  },
  {
    value: 'casual',
    label: 'Thoải mái',
    description: 'Tự nhiên, không gò bó, thân mật',
  },
];

// Tone options
const TONE_OPTIONS = [
  {
    value: 'formal',
    label: 'Lịch sự',
    description: 'Trang trọng và chính thức',
  },
  { value: 'friendly', label: 'Thân thiện', description: 'Ấm áp và gần gũi' },
  { value: 'warm', label: 'Ấm áp', description: 'Chân tình và quan tâm' },
  {
    value: 'energetic',
    label: 'Năng động',
    description: 'Nhiệt huyết và tích cực',
  },
  { value: 'calm', label: 'Bình tĩnh', description: 'Điềm tĩnh và tin cậy' },
];

// Loading skeleton
const ConfigSkeleton = () => (
  <div className="space-y-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    ))}
  </div>
);

// Voice selector component
const VoiceSelector = ({
  selectedVoice,
  onVoiceChange,
  onTest,
}: {
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
  onTest: (voiceId: string) => void;
}) => {
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  const handleTest = async (voiceId: string) => {
    setIsPlaying(voiceId);
    try {
      await onTest(voiceId);
    } finally {
      setIsPlaying(null);
    }
  };

  return (
    <div className="space-y-3">
      {AVAILABLE_VOICES.map(voice => (
        <div
          key={voice.id}
          className={cn(
            'border rounded-lg p-3 cursor-pointer transition-colors',
            selectedVoice === voice.id
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-gray-300'
          )}
          onClick={() => onVoiceChange(voice.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-3 h-3 rounded-full border-2',
                  selectedVoice === voice.id
                    ? 'bg-primary border-primary'
                    : 'border-gray-300'
                )}
              />
              <div>
                <div className="font-medium">{voice.name}</div>
                <div className="text-sm text-muted-foreground">
                  {voice.gender} • {voice.language}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                handleTest(voice.id);
              }}
              disabled={isPlaying === voice.id}
            >
              {isPlaying === voice.id ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </Button>
          </div>
          <div className="mt-2 text-sm text-muted-foreground italic">
            "{voice.sample}"
          </div>
        </div>
      ))}
    </div>
  );
};

// Language selector component
const LanguageSelector = ({
  selectedLanguages,
  onLanguageChange,
}: {
  selectedLanguages: string[];
  onLanguageChange: (languages: string[]) => void;
}) => {
  const handleToggle = (languageCode: string) => {
    if (selectedLanguages.includes(languageCode)) {
      onLanguageChange(selectedLanguages.filter(lang => lang !== languageCode));
    } else {
      onLanguageChange([...selectedLanguages, languageCode]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {AVAILABLE_LANGUAGES.map(language => (
        <div key={language.code} className="flex items-center space-x-3">
          <Checkbox
            id={language.code}
            checked={selectedLanguages.includes(language.code)}
            onCheckedChange={() => handleToggle(language.code)}
          />
          <Label
            htmlFor={language.code}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="text-lg">{language.flag}</span>
            <span>{language.name}</span>
          </Label>
        </div>
      ))}
    </div>
  );
};

// Main Assistant Config Panel component
export const AssistantConfigPanel: React.FC<AssistantConfigPanelProps> = ({
  config,
  isLoading,
  isSaving,
  error,
  onSave,
  onTest,
  onReset,
  className,
  disabled = false,
}) => {
  const [editConfig, setEditConfig] = useState<AssistantConfig | null>(config);
  const [hasChanges, setHasChanges] = useState(false);

  React.useEffect(() => {
    if (config) {
      setEditConfig(config);
      setHasChanges(false);
    }
  }, [config]);

  const handleConfigChange = (updates: Partial<AssistantConfig>) => {
    if (!editConfig) {
      return;
    }

    const newConfig = { ...editConfig, ...updates };
    setEditConfig(newConfig);
    setHasChanges(JSON.stringify(newConfig) !== JSON.stringify(config));
  };

  const handleSave = async () => {
    if (!editConfig || !hasChanges) {
      return;
    }

    try {
      await onSave(editConfig);
      setHasChanges(false);
    } catch (error) {
      logger.error('Failed to save config:', 'Component', error);
    }
  };

  const handleTest = async () => {
    if (!editConfig) {
      return;
    }

    try {
      await onTest(editConfig);
    } catch (error) {
      logger.error('Failed to test assistant:', 'Component', error);
    }
  };

  if (isLoading) {
    return <ConfigSkeleton />;
  }

  if (!editConfig) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Không có cấu hình AI Assistant
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cấu hình AI Assistant</h2>
          <p className="text-muted-foreground">
            Tùy chỉnh hành vi và tính cách của AI Assistant
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={editConfig.status === 'active' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {editConfig.status === 'active'
              ? 'Hoạt động'
              : editConfig.status === 'testing'
                ? 'Đang test'
                : 'Tạm dừng'}
          </Badge>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Lỗi cấu hình</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Basic Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Thông tin cơ bản
          </CardTitle>
          <CardDescription>
            Tên và thông tin nhận dạng của AI Assistant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="assistant-name">Tên Assistant</Label>
            <Input
              id="assistant-name"
              value={editConfig.name}
              onChange={e => handleConfigChange({ name: e.target.value })}
              disabled={disabled}
              placeholder="Ví dụ: Mi Nhon Hotel AI Concierge"
            />
          </div>
        </CardContent>
      </Card>

      {/* Personality & Tone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Tính cách & Giọng điệu
          </CardTitle>
          <CardDescription>
            Cấu hình cách AI Assistant giao tiếp với khách hàng
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-base font-medium">Tính cách</Label>
              <div className="space-y-3 mt-3">
                {PERSONALITY_OPTIONS.map(option => (
                  <div key={option.value} className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full border-2 mt-0.5',
                        editConfig.personality === option.value
                          ? 'bg-primary border-primary'
                          : 'border-gray-300'
                      )}
                    />
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() =>
                        handleConfigChange({ personality: option.value as any })
                      }
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Giọng điệu</Label>
              <div className="space-y-3 mt-3">
                {TONE_OPTIONS.map(option => (
                  <div key={option.value} className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full border-2 mt-0.5',
                        editConfig.tone === option.value
                          ? 'bg-primary border-primary'
                          : 'border-gray-300'
                      )}
                    />
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() =>
                        handleConfigChange({ tone: option.value as any })
                      }
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            Cài đặt giọng nói
          </CardTitle>
          <CardDescription>
            Chọn giọng nói và điều chỉnh thông số âm thanh
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-3 block">
              Chọn giọng nói
            </Label>
            <VoiceSelector
              selectedVoice={editConfig.voiceSettings.voiceId}
              onVoiceChange={voiceId =>
                handleConfigChange({
                  voiceSettings: { ...editConfig.voiceSettings, voiceId },
                })
              }
              onTest={async voiceId => {
                // Test voice implementation
                logger.debug('Testing voice:', 'Component', voiceId);
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-sm font-medium">
                Tốc độ nói ({editConfig.voiceSettings.speed}x)
              </Label>
              <Slider
                value={[editConfig.voiceSettings.speed]}
                onValueChange={([speed]) =>
                  handleConfigChange({
                    voiceSettings: { ...editConfig.voiceSettings, speed },
                  })
                }
                min={0.5}
                max={2.0}
                step={0.1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">
                Độ cao ({editConfig.voiceSettings.pitch})
              </Label>
              <Slider
                value={[editConfig.voiceSettings.pitch]}
                onValueChange={([pitch]) =>
                  handleConfigChange({
                    voiceSettings: { ...editConfig.voiceSettings, pitch },
                  })
                }
                min={-20}
                max={20}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">
                Âm lượng ({editConfig.voiceSettings.volume}%)
              </Label>
              <Slider
                value={[editConfig.voiceSettings.volume]}
                onValueChange={([volume]) =>
                  handleConfigChange({
                    voiceSettings: { ...editConfig.voiceSettings, volume },
                  })
                }
                min={0}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Ngôn ngữ hỗ trợ
          </CardTitle>
          <CardDescription>
            Chọn các ngôn ngữ mà AI Assistant có thể giao tiếp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LanguageSelector
            selectedLanguages={editConfig.languages}
            onLanguageChange={languages => handleConfigChange({ languages })}
          />
        </CardContent>
      </Card>

      {/* Behavior Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Cài đặt hành vi
          </CardTitle>
          <CardDescription>
            Cấu hình các thông số về thời gian và hành vi cuộc gọi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="silence-timeout">
                Thời gian chờ im lặng (giây)
              </Label>
              <Input
                id="silence-timeout"
                type="number"
                value={editConfig.behaviorSettings.silenceTimeout}
                onChange={e =>
                  handleConfigChange({
                    behaviorSettings: {
                      ...editConfig.behaviorSettings,
                      silenceTimeout: parseInt(e.target.value),
                    },
                  })
                }
                min={5}
                max={120}
                disabled={disabled}
              />
            </div>

            <div>
              <Label htmlFor="max-duration">
                Thời lượng cuộc gọi tối đa (giây)
              </Label>
              <Input
                id="max-duration"
                type="number"
                value={editConfig.behaviorSettings.maxCallDuration}
                onChange={e =>
                  handleConfigChange({
                    behaviorSettings: {
                      ...editConfig.behaviorSettings,
                      maxCallDuration: parseInt(e.target.value),
                    },
                  })
                }
                min={60}
                max={3600}
                disabled={disabled}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">
                  Cho phép ngắt lời
                </Label>
                <p className="text-sm text-muted-foreground">
                  Khách hàng có thể ngắt lời AI khi đang nói
                </p>
              </div>
              <Switch
                checked={editConfig.behaviorSettings.interruptible}
                onCheckedChange={interruptible =>
                  handleConfigChange({
                    behaviorSettings: {
                      ...editConfig.behaviorSettings,
                      interruptible,
                    },
                  })
                }
                disabled={disabled}
              />
            </div>

            <div>
              <Label htmlFor="background-sound">Âm thanh nền</Label>
              <Select
                value={editConfig.behaviorSettings.backgroundSound}
                onValueChange={(backgroundSound: any) =>
                  handleConfigChange({
                    behaviorSettings: {
                      ...editConfig.behaviorSettings,
                      backgroundSound,
                    },
                  })
                }
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
          </div>
        </CardContent>
      </Card>

      {/* Conversation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Tin nhắn mẫu
          </CardTitle>
          <CardDescription>
            Cấu hình các tin nhắn chuẩn của AI Assistant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="greeting">Lời chào</Label>
            <Textarea
              id="greeting"
              value={editConfig.conversationSettings.greeting}
              onChange={e =>
                handleConfigChange({
                  conversationSettings: {
                    ...editConfig.conversationSettings,
                    greeting: e.target.value,
                  },
                })
              }
              placeholder="Ví dụ: Xin chào! Tôi là AI Assistant của khách sạn..."
              disabled={disabled}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="fallback">Tin nhắn dự phòng</Label>
            <Textarea
              id="fallback"
              value={editConfig.conversationSettings.fallbackMessage}
              onChange={e =>
                handleConfigChange({
                  conversationSettings: {
                    ...editConfig.conversationSettings,
                    fallbackMessage: e.target.value,
                  },
                })
              }
              placeholder="Khi không hiểu yêu cầu..."
              disabled={disabled}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="end-call">Tin nhắn kết thúc</Label>
            <Textarea
              id="end-call"
              value={editConfig.conversationSettings.endCallMessage}
              onChange={e =>
                handleConfigChange({
                  conversationSettings: {
                    ...editConfig.conversationSettings,
                    endCallMessage: e.target.value,
                  },
                })
              }
              placeholder="Cảm ơn bạn đã liên hệ..."
              disabled={disabled}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Prompt */}
      <Card>
        <CardHeader>
          <CardTitle>System Prompt</CardTitle>
          <CardDescription>
            Hướng dẫn chi tiết cho AI Assistant về cách hành xử
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={editConfig.systemPrompt}
            onChange={e => handleConfigChange({ systemPrompt: e.target.value })}
            rows={10}
            className="font-mono text-sm"
            placeholder="Nhập system prompt cho AI Assistant..."
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="secondary" className="text-xs">
              Có thay đổi chưa lưu
            </Badge>
          )}
          {editConfig.lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Cập nhật:{' '}
              {new Date(editConfig.lastUpdated).toLocaleString('vi-VN')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onReset}
            disabled={disabled || !hasChanges}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Đặt lại
          </Button>

          <Button variant="outline" onClick={handleTest} disabled={disabled}>
            <Play className="h-4 w-4 mr-2" />
            Test Assistant
          </Button>

          <Button
            onClick={handleSave}
            disabled={disabled || !hasChanges || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
      </div>
    </div>
  );
};

export default AssistantConfigPanel;
