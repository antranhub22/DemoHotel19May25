import React from 'react';
import { Link, useLocation } from 'wouter';
import {
  Home,
  Bot,
  BarChart,
  Settings,
  CreditCard,
  Users,
  Building2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Types
interface NavItem {
  href: string;
  icon: React.ComponentType<any>;
  label: string;
  description: string;
  requiresPlan?: 'basic' | 'premium' | 'enterprise';
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  tenantData: {
    hotelName: string;
    subscriptionPlan: 'trial' | 'basic' | 'premium' | 'enterprise';
    subscriptionStatus: 'active' | 'expired' | 'cancelled';
    remainingDays?: number;
  };
}

// Base navigation items for SaaS Provider Dashboard
const baseNavItems: NavItem[] = [
  {
    href: '/saas-dashboard',
    icon: Home,
    label: 'Tổng quan',
    description: 'Metrics và thống kê tổng quan',
  },
  {
    href: '/saas-dashboard/setup',
    icon: Bot,
    label: 'Thiết lập Assistant',
    description: 'Cấu hình và tùy chỉnh AI Assistant',
  },
  {
    href: '/saas-dashboard/analytics',
    icon: BarChart,
    label: 'Phân tích',
    description: 'Báo cáo và thống kê chi tiết',
  },
  {
    href: '/saas-dashboard/settings',
    icon: Settings,
    label: 'Cài đặt',
    description: 'Quản lý thông tin khách sạn',
  },
];

// Premium navigation items for SaaS Provider
const premiumNavItems: NavItem[] = [
  {
    href: '/saas-dashboard/billing',
    icon: CreditCard,
    label: 'Thanh toán',
    description: 'Quản lý subscription và billing',
    requiresPlan: 'basic',
  },
  {
    href: '/saas-dashboard/team',
    icon: Users,
    label: 'Nhóm',
    description: 'Quản lý team và permissions',
    requiresPlan: 'enterprise',
  },
];

// Navigation item component
const NavigationItem = ({
  href,
  icon: Icon,
  label,
  description,
  isActive,
  disabled = false,
}: {
  href: string;
  icon: React.ComponentType<any>;
  label: string;
  description: string;
  isActive: boolean;
  disabled?: boolean;
}) => {
  const buttonContent = (
    <Button
      variant={isActive ? 'default' : 'ghost'}
      className={cn(
        'w-full justify-start gap-3 px-3 py-6 h-auto',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        isActive && 'bg-primary text-primary-foreground hover:bg-primary/90',
        disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent'
      )}
      disabled={disabled}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <div className="flex-1 text-left">
        <div className="font-medium">{label}</div>
        <div
          className={cn(
            'text-xs text-muted-foreground',
            isActive && 'text-primary-foreground/80'
          )}
        >
          {description}
        </div>
      </div>
      {disabled && (
        <Badge variant="outline" className="text-xs">
          Premium
        </Badge>
      )}
    </Button>
  );

  if (disabled) {
    return <div>{buttonContent}</div>;
  }

  return <Link href={href}>{buttonContent}</Link>;
};

// Subscription badge component
const SubscriptionBadge = ({
  plan,
  status,
}: {
  plan: string;
  status: string;
}) => {
  const getVariant = () => {
    if (status === 'expired') {
      return 'destructive';
    }
    if (plan === 'trial') {
      return 'secondary';
    }
    if (plan === 'enterprise') {
      return 'default';
    }
    return 'outline';
  };

  const getLabel = () => {
    if (plan === 'trial') {
      return 'Dùng thử';
    }
    if (plan === 'basic') {
      return 'Cơ bản';
    }
    if (plan === 'premium') {
      return 'Cao cấp';
    }
    if (plan === 'enterprise') {
      return 'Doanh nghiệp';
    }
    return plan;
  };

  return (
    <Badge variant={getVariant()} className="text-xs">
      {getLabel()}
    </Badge>
  );
};

// Plan requirement checker
const canAccessFeature = (userPlan: string, requiredPlan?: string): boolean => {
  if (!requiredPlan) {
    return true;
  }

  const planHierarchy = {
    trial: 0,
    basic: 1,
    premium: 2,
    enterprise: 3,
  };

  const userLevel = planHierarchy[userPlan as keyof typeof planHierarchy] ?? 0;
  const requiredLevel =
    planHierarchy[requiredPlan as keyof typeof planHierarchy] ?? 0;

  return userLevel >= requiredLevel;
};

// Main sidebar component
export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  tenantData,
}) => {
  const [location] = useLocation();

  // Filter navigation items based on subscription
  const availableNavItems = [
    ...baseNavItems,
    ...premiumNavItems.filter(
      item => item.requiresPlan && tenantData.subscriptionPlan !== 'trial'
    ),
  ];

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Talk2Go</h1>
              <p className="text-sm text-muted-foreground">
                SaaS Provider Dashboard
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Hotel info */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-lg">
                {tenantData.hotelName}
              </div>
              <div className="text-xs text-gray-500">
                {tenantData.subscriptionStatus === 'active'
                  ? 'Hoạt động'
                  : 'Hết hạn'}
              </div>
            </div>
            <SubscriptionBadge
              plan={tenantData.subscriptionPlan}
              status={tenantData.subscriptionStatus}
            />
          </div>
          {/* Nút chuyển sang giao diện khách */}
          <Link
            href="/interface1"
            className="block mt-3 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition text-center"
          >
            Xem giao diện khách
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {availableNavItems.map(item => {
            const canAccess = canAccessFeature(
              tenantData.subscriptionPlan,
              item.requiresPlan
            );

            return (
              <NavigationItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                description={item.description}
                isActive={location === item.href}
                disabled={!canAccess}
              />
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <p className="text-xs text-center text-muted-foreground">
            © 2024 Talk2Go. All rights reserved.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
