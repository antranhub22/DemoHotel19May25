/**
 * SaaS Provider Domain - Feature Gate Component
 * Conditional rendering based on subscription plan and feature access
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import logger from '@shared/utils/logger';
import { Crown, Lock, Sparkles, Zap } from "lucide-react";
import React from "react";
import { useFeatureGating } from "../hooks/useTenantManagement";
import { SubscriptionPlan } from "../types/saasProvider.types";

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  trackUsage?: boolean;
  onUpgradeClick?: () => void;
}

interface UpgradePromptProps {
  feature: string;
  requiredPlan: SubscriptionPlan;
  onUpgradeClick?: () => void;
}

// Plan configuration
const PLAN_CONFIG = {
  trial: { name: "Trial", color: "secondary", icon: Zap },
  basic: { name: "Basic", color: "default", icon: Sparkles },
  premium: { name: "Premium", color: "default", icon: Crown },
  enterprise: { name: "Enterprise", color: "destructive", icon: Crown },
};

const FEATURE_NAMES: Record<string, string> = {
  voice_cloning: "Voice Cloning",
  white_label: "White Label Branding",
  multi_location: "Multi-Location Support",
  advanced_analytics: "Advanced Analytics",
  api_access: "API Access",
  custom_integrations: "Custom Integrations",
  priority_support: "Priority Support",
  data_export: "Data Export",
  bulk_operations: "Bulk Operations",
  team_management: "Team Management",
};

// Upgrade prompt component
const UpgradePrompt: React.FC<UpgradePrompt> = ({ feature, requiredPlan, onUpgradeClick }) => {
  const planConfig = PLAN_CONFIG[requiredPlan];
  const Icon = planConfig.icon;
  const featureName = FEATURE_NAMES[feature] || feature;

  return (
    <Card className="border-dashed border-gray-300 bg-gray-50/50">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
        <CardTitle className="text-lg font-semibold text-gray-700">
          {featureName} is locked
        </CardTitle>
        <CardDescription className="text-sm text-gray-500">
          This feature requires a {planConfig.name} plan or higher
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center pt-0">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Badge variant={"default" as const} ) // TODO: Fix variant type className="flex items-center gap-1">
            <Icon className="w-3 h-3" />
            {planConfig.name}
          </Badge>
          <span className="text-sm text-gray-500">required</span>
        </div>

        {onUpgradeClick && (
          <Button onClick={onUpgradeClick} className="w-full" variant="default">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to {planConfig.name}
          </Button>
        }

        <p className="text-xs text-gray-400 mt-3">
          Unlock this feature and many more with an upgrade
        </p>
      </CardContent>
    </Card>
  );
};

// Main feature gate component
export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  trackUsage = true,
  onUpgradeClick,
}) => {
  const {
    canAccess,
    getAvailability,
    trackUsage: trackFeatureUsage,
  } = useFeatureGating();

  // Check feature access
  const hasAccess = canAccess(feature);
  const { available, requiredPlan } = getAvailability(feature);

  // Track feature usage if enabled and has access
  React.useEffect(() => {
    if (hasAccess && trackUsage) {
      trackFeatureUsage(feature, {
        timestamp: new Date(),
        component: "FeatureGate",
      });
    }
  }, [hasAccess, trackUsage, feature, trackFeatureUsage]);

  // Log feature access attempt
  React.useEffect(() => {
    logger.debug(`[FeatureGate] Feature access check: ${feature}`, {
      hasAccess,
      available,
      requiredPlan,
    });
  }, [feature, hasAccess, available, requiredPlan]);

  // Render children if has access
  if (hasAccess) {
    return <>{children}</>;
  }

  // Render custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Render upgrade prompt if enabled
  if (showUpgradePrompt && requiredPlan) {
    return (
      <UpgradePrompt
        feature={feature}
        requiredPlan={requiredPlan}
        onUpgradeClick={onUpgradeClick}
      />
    );
  }

  // Default: render nothing
  return null;
};

// ============================================
// SPECIALIZED FEATURE GATES
// ============================================

/**
 * Voice Cloning Feature Gate
 */
export const VoiceCloningGate: React.FC<{
  children: React.ReactNode;
  onUpgradeClick?: () => void;
}> = ({ children, onUpgradeClick }) => (
  <FeatureGate feature="voice_cloning" onUpgradeClick={onUpgradeClick}>
    {children}
  </FeatureGate>
);

/**
 * White Label Feature Gate
 */
export const WhiteLabelGate: React.FC<{
  children: React.ReactNode;
  onUpgradeClick?: () => void;
}> = ({ children, onUpgradeClick }) => (
  <FeatureGate feature="white_label" onUpgradeClick={onUpgradeClick}>
    {children}
  </FeatureGate>
);

/**
 * Advanced Analytics Feature Gate
 */
export const AdvancedAnalyticsGate: React.FC<{
  children: React.ReactNode;
  onUpgradeClick?: () => void;
}> = ({ children, onUpgradeClick }) => (
  <FeatureGate feature="advanced_analytics" onUpgradeClick={onUpgradeClick}>
    {children}
  </FeatureGate>
);

/**
 * API Access Feature Gate
 */
export const ApiAccessGate: React.FC<{
  children: React.ReactNode;
  onUpgradeClick?: () => void;
}> = ({ children, onUpgradeClick }) => (
  <FeatureGate feature="api_access" onUpgradeClick={onUpgradeClick}>
    {children}
  </FeatureGate>
);

// ============================================
// FEATURE AVAILABILITY INDICATOR
// ============================================

interface FeatureAvailabilityProps {
  feature: string;
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}

export const FeatureAvailability: React.FC<FeatureAvailabilityProps> = ({
  feature,
  showIcon = true,
  showText = true,
  className = "",
}) => {
  const { canAccess, getAvailability } = useFeatureGating();

  const hasAccess = canAccess(feature);
  const { requiredPlan } = getAvailability(feature);

  if (hasAccess) {
    return (
      <div className={`flex items-center gap-1 text-green-600 ${className}`}>
        {showIcon && <Sparkles className="w-4 h-4" />}
        {showText && <span className="text-sm">Available</span>}
      </div>
    );
  }

  const planConfig = requiredPlan ? PLAN_CONFIG[requiredPlan] : null;

  return (
    <div className={`flex items-center gap-1 text-gray-400 ${className}`}>
      {showIcon && <Lock className="w-4 h-4" />}
      {showText && planConfig && (
        <span className="text-sm">Requires {planConfig.name}</span>
      )}
    </div>
  );
};

// ============================================
// BULK FEATURE CHECKING
// ============================================

interface FeatureListProps {
  features: string[];
  onUpgradeClick?: () => void;
  className?: string;
}

export const FeatureList: React.FC<FeatureListProps> = ({
  features,
  onUpgradeClick,
  className = "",
}) => {
  const { canAccess, getAvailability } = useFeatureGating();

  return (
    <div className={`space-y-2 ${className}`}>
      {features.map((feature) => {
        const hasAccess = canAccess(feature);
        const { requiredPlan } = getAvailability(feature);
        const featureName = FEATURE_NAMES[feature] || feature;
        const planConfig = requiredPlan ? PLAN_CONFIG[requiredPlan] : null;

        return (
          <div
            key={feature}
            className="flex items-center justify-between p-2 border rounded"
          >
            <span className="text-sm font-medium">{featureName}</span>
            <div className="flex items-center gap-2">
              <FeatureAvailability
                feature={feature}
                showText={false}
                className="mr-2"
              />
              {!hasAccess && planConfig && (
                <Badge variant={"default" as const} ) // TODO: Fix variant type className="text-xs">
                  {planConfig.name}
                </Badge>
              }
              {!hasAccess && onUpgradeClick && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onUpgradeClick}
                  className="text-xs px-2 py-1 h-auto"
                >
                  Upgrade
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FeatureGate;
