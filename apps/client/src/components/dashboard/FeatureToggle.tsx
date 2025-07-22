import React, { useState } from 'react';
import {
  Crown,
  Lock,
  Star,
  Shield,
  Mic,
  BarChart3,
  Database,
  Palette,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Types
interface Feature {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  available: boolean;
  requiredPlan: 'trial' | 'basic' | 'premium' | 'enterprise';
  category: 'voice' | 'analytics' | 'customization' | 'integration' | 'support';
  limitations?: {
    trial?: string;
    basic?: string;
    premium?: string;
  };
}

interface SubscriptionPlan {
  id: 'trial' | 'basic' | 'premium' | 'enterprise';
  name: string;
  price: number;
  currency: string;
  features: string[];
  popular?: boolean;
}

interface FeatureToggleProps {
  features: Feature[];
  currentPlan: 'trial' | 'basic' | 'premium' | 'enterprise';
  onFeatureToggle: (featureId: string, enabled: boolean) => void;
  onUpgrade: (targetPlan: string) => void;
  className?: string;
  showUpgradePrompts?: boolean;
}

// Feature categories
const FEATURE_CATEGORIES = {
  voice: {
    label: 'Giọng nói & AI',
    icon: Mic,
    color: 'bg-blue-50 text-blue-700',
  },
  analytics: {
    label: 'Phân tích',
    icon: BarChart3,
    color: 'bg-green-50 text-green-700',
  },
  customization: {
    label: 'Tùy chỉnh',
    icon: Palette,
    color: 'bg-purple-50 text-purple-700',
  },
  integration: {
    label: 'Tích hợp',
    icon: Database,
    color: 'bg-orange-50 text-orange-700',
  },
  support: { label: 'Hỗ trợ', icon: Shield, color: 'bg-red-50 text-red-700' },
};

// Subscription plans
const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'trial',
    name: 'Dùng thử',
    price: 0,
    currency: 'VND',
    features: [
      '500 cuộc gọi/tháng',
      '2 ngôn ngữ',
      'Báo cáo cơ bản',
      'Hỗ trợ email',
    ],
  },
  {
    id: 'basic',
    name: 'Cơ bản',
    price: 990000,
    currency: 'VND',
    features: [
      '2,000 cuộc gọi/tháng',
      '5 ngôn ngữ',
      'Báo cáo chi tiết',
      'Tùy chỉnh giọng nói',
      'Hỗ trợ chat',
    ],
  },
  {
    id: 'premium',
    name: 'Cao cấp',
    price: 1990000,
    currency: 'VND',
    popular: true,
    features: [
      '10,000 cuộc gọi/tháng',
      'Không giới hạn ngôn ngữ',
      'Voice cloning',
      'Báo cáo nâng cao',
      'API tích hợp',
      'Hỗ trợ ưu tiên',
    ],
  },
  {
    id: 'enterprise',
    name: 'Doanh nghiệp',
    price: 4990000,
    currency: 'VND',
    features: [
      'Không giới hạn cuộc gọi',
      'Multi-location',
      'White-label',
      'Custom integration',
      'Dedicated support',
      'SLA 99.9%',
    ],
  },
];

// Plan hierarchy levels
const PLAN_LEVELS = {
  trial: 0,
  basic: 1,
  premium: 2,
  enterprise: 3,
};

// Feature status component
const FeatureStatus = ({
  feature,
  currentPlan,
}: {
  feature: Feature;
  currentPlan: string;
}) => {
  const canAccess =
    PLAN_LEVELS[currentPlan as keyof typeof PLAN_LEVELS] >=
    PLAN_LEVELS[feature.requiredPlan as keyof typeof PLAN_LEVELS];

  if (canAccess) {
    return (
      <Badge variant="outline" className="text-green-600 border-green-600">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Có sẵn
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-gray-500 border-gray-300">
      <Lock className="h-3 w-3 mr-1" />
      {SUBSCRIPTION_PLANS.find(p => p.id === feature.requiredPlan)?.name}
    </Badge>
  );
};

// Feature limitations display
const FeatureLimitations = ({
  feature,
  currentPlan,
}: {
  feature: Feature;
  currentPlan: string;
}) => {
  if (!feature.limitations) {return null;}

  const limitation =
    feature.limitations[currentPlan as keyof typeof feature.limitations];
  if (!limitation) {return null;}

  return (
    <div className="text-xs text-muted-foreground mt-1 p-2 bg-yellow-50 rounded border border-yellow-200">
      <AlertTriangle className="h-3 w-3 inline mr-1" />
      {limitation}
    </div>
  );
};

// Feature card component
const FeatureCard = ({
  feature,
  currentPlan,
  onToggle,
  onUpgrade,
}: {
  feature: Feature;
  currentPlan: string;
  onToggle: (enabled: boolean) => void;
  onUpgrade: (targetPlan: string) => void;
}) => {
  const canAccess =
    PLAN_LEVELS[currentPlan as keyof typeof PLAN_LEVELS] >=
    PLAN_LEVELS[feature.requiredPlan as keyof typeof PLAN_LEVELS];

  const category = FEATURE_CATEGORIES[feature.category];
  const IconComponent = feature.icon;

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        !canAccess && 'opacity-60 bg-gray-50'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={cn('p-2 rounded-lg', category.color)}>
              <IconComponent className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base flex items-center gap-2">
                {feature.name}
                <FeatureStatus feature={feature} currentPlan={currentPlan} />
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {feature.description}
              </CardDescription>
            </div>
          </div>

          {canAccess ? (
            <Switch
              checked={feature.enabled}
              onCheckedChange={onToggle}
              disabled={!feature.available}
            />
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpgrade(feature.requiredPlan)}
              className="text-xs"
            >
              <Crown className="h-3 w-3 mr-1" />
              Nâng cấp
            </Button>
          )}
        </div>
      </CardHeader>

      {canAccess && (
        <CardContent className="pt-0">
          <FeatureLimitations feature={feature} currentPlan={currentPlan} />
        </CardContent>
      )}
    </Card>
  );
};

// Upgrade prompt dialog
const UpgradePrompt = ({
  targetPlan,
  onUpgrade,
  onClose,
}: {
  targetPlan: string;
  onUpgrade: (plan: string) => void;
  onClose: () => void;
}) => {
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === targetPlan);
  if (!plan) {return null;}

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Nâng cấp lên {plan.name}
        </DialogTitle>
        <DialogDescription>
          Mở khóa tính năng cao cấp và nâng cao trải nghiệm của bạn
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="text-2xl font-bold">
            {plan.price.toLocaleString('vi-VN')} {plan.currency}
          </div>
          <div className="text-sm text-muted-foreground">/ tháng</div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Bao gồm:</h4>
          <ul className="space-y-1">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Để sau
        </Button>
        <Button onClick={() => onUpgrade(targetPlan)}>
          <Crown className="h-4 w-4 mr-2" />
          Nâng cấp ngay
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

// Current plan display
const CurrentPlanCard = ({
  currentPlan,
  onUpgrade,
}: {
  currentPlan: string;
  onUpgrade: (plan: string) => void;
}) => {
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === currentPlan);
  if (!plan) {return null;}

  const nextPlan = SUBSCRIPTION_PLANS.find(
    p =>
      PLAN_LEVELS[p.id as keyof typeof PLAN_LEVELS] >
      PLAN_LEVELS[currentPlan as keyof typeof PLAN_LEVELS]
  );

  return (
    <Card className="border-primary bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Gói hiện tại: {plan.name}
            </CardTitle>
            <CardDescription>
              {plan.price > 0
                ? `${plan.price.toLocaleString('vi-VN')} VND/tháng`
                : 'Miễn phí'}
            </CardDescription>
          </div>
          {nextPlan && (
            <Button
              onClick={() => onUpgrade(nextPlan.id)}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Nâng cấp
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              {feature}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Feature Toggle component
export const FeatureToggle: React.FC<FeatureToggleProps> = ({
  features,
  currentPlan,
  onFeatureToggle,
  onUpgrade,
  className,
  showUpgradePrompts = true,
}) => {
  const [upgradeDialogPlan, setUpgradeDialogPlan] = useState<string | null>(
    null
  );

  // Group features by category
  const featuresByCategory = features.reduce(
    (acc, feature) => {
      if (!acc[feature.category]) {
        acc[feature.category] = [];
      }
      acc[feature.category].push(feature);
      return acc;
    },
    {} as Record<string, Feature[]>
  );

  const handleUpgrade = (targetPlan: string) => {
    if (showUpgradePrompts) {
      setUpgradeDialogPlan(targetPlan);
    } else {
      onUpgrade(targetPlan);
    }
  };

  const confirmUpgrade = (plan: string) => {
    onUpgrade(plan);
    setUpgradeDialogPlan(null);
  };

  // Get feature statistics
  const totalFeatures = features.length;
  const enabledFeatures = features.filter(f => f.enabled).length;
  const availableFeatures = features.filter(f => f.available).length;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Quản lý tính năng</h2>
        <p className="text-muted-foreground">
          Bật/tắt các tính năng và nâng cấp gói để mở khóa thêm nhiều tính năng
        </p>
      </div>

      {/* Feature Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {enabledFeatures}
              </div>
              <div className="text-sm text-muted-foreground">
                Tính năng đã bật
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {availableFeatures}
              </div>
              <div className="text-sm text-muted-foreground">
                Tính năng có sẵn
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {totalFeatures}
              </div>
              <div className="text-sm text-muted-foreground">
                Tổng tính năng
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Plan */}
      <CurrentPlanCard currentPlan={currentPlan} onUpgrade={handleUpgrade} />

      {/* Features by Category */}
      {Object.entries(featuresByCategory).map(
        ([categoryKey, categoryFeatures]) => {
          const category =
            FEATURE_CATEGORIES[categoryKey as keyof typeof FEATURE_CATEGORIES];
          const CategoryIcon = category.icon;

          return (
            <div key={categoryKey} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={cn('p-2 rounded-lg', category.color)}>
                  <CategoryIcon className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-semibold">{category.label}</h3>
                <Badge variant="outline" className="text-xs">
                  {categoryFeatures.length} tính năng
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryFeatures.map(feature => (
                  <FeatureCard
                    key={feature.id}
                    feature={feature}
                    currentPlan={currentPlan}
                    onToggle={enabled => onFeatureToggle(feature.id, enabled)}
                    onUpgrade={handleUpgrade}
                  />
                ))}
              </div>
            </div>
          );
        }
      )}

      {/* Upgrade Dialog */}
      <Dialog
        open={upgradeDialogPlan !== null}
        onOpenChange={open => !open && setUpgradeDialogPlan(null)}
      >
        {upgradeDialogPlan && (
          <UpgradePrompt
            targetPlan={upgradeDialogPlan}
            onUpgrade={confirmUpgrade}
            onClose={() => setUpgradeDialogPlan(null)}
          />
        )}
      </Dialog>
    </div>
  );
};

// Hook for managing feature state
export const useFeatureToggle = (initialFeatures: Feature[]) => {
  const [features, setFeatures] = useState(initialFeatures);

  const toggleFeature = (featureId: string, enabled: boolean) => {
    setFeatures(prev =>
      prev.map(feature =>
        feature.id === featureId ? { ...feature, enabled } : feature
      )
    );
  };

  const updateFeatureAvailability = (featureId: string, available: boolean) => {
    setFeatures(prev =>
      prev.map(feature =>
        feature.id === featureId ? { ...feature, available } : feature
      )
    );
  };

  return {
    features,
    toggleFeature,
    updateFeatureAvailability,
  };
};

export default FeatureToggle;
