import * as React from 'react';
import {
  BarChart,
  Bell,
  Bot,
  CreditCard,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  Settings,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import Sidebar from '@/components/features/dashboard/dashboard/Sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

// Types
interface TenantData {
  id: string;
  hotelName: string;
  subscriptionPlan: 'trial' | 'basic' | 'premium' | 'enterprise';
  subscriptionStatus: 'active' | 'expired' | 'cancelled';
  trialEndsAt?: Date;
  remainingDays?: number;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Mock tenant data - will be replaced with actual auth context
const mockTenant: TenantData = {
  id: 'tenant-1',
  hotelName: 'Mi Nhon Hotel',
  subscriptionPlan: 'premium',
  subscriptionStatus: 'active',
  remainingDays: 15,
};

// Navigation items
const navigationItems = [
  {
    href: '/saas-dashboard',
    icon: Home,
    label: 'Tổng quan',
    description: 'Metrics và thống kê tổng quan',
  },
  {
    href: '/dashboard/setup',
    icon: Bot,
    label: 'Thiết lập Assistant',
    description: 'Cấu hình và tùy chỉnh AI Assistant',
  },
  {
    href: '/dashboard/analytics',
    icon: BarChart,
    label: 'Phân tích',
    description: 'Báo cáo và thống kê chi tiết',
  },
  {
    href: '/dashboard/settings',
    icon: Settings,
    label: 'Cài đặt',
    description: 'Quản lý thông tin khách sạn',
  },
];

// Conditional navigation items based on subscription
const getConditionalNavItems = (subscriptionPlan: string) => {
  const items = [];

  if (subscriptionPlan !== 'trial') {
    items.push({
      href: '/dashboard/billing',
      icon: CreditCard,
      label: 'Thanh toán',
      description: 'Quản lý subscription và billing',
    });
  }

  if (subscriptionPlan === 'enterprise') {
    items.push({
      href: '/dashboard/team',
      icon: Users,
      label: 'Nhóm',
      description: 'Quản lý team và permissions',
    });
  }

  return items;
};

// Sidebar navigation item component
const NavItem = ({
  href,
  icon: Icon,
  label,
  description,
  isActive,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  isActive: boolean;
}) => (
  <Link href={href}>
    <Button
      variant={isActive ? 'default' : 'ghost'}
      className={cn(
        'w-full justify-start gap-3 px-3 py-6 h-auto',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        isActive && 'bg-primary text-primary-foreground hover:bg-primary/90'
      )}
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
    </Button>
  </Link>
);

// Subscription status badge
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
    <Badge variant={getVariant()} className="ml-auto">
      {getLabel()}
    </Badge>
  );
};

// User menu component
const UserMenu = ({ tenant }: { tenant: TenantData }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
        <Avatar className="h-10 w-10">
          <AvatarImage src="" alt={tenant.hotelName} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {tenant.hotelName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-56" align="end">
      <DropdownMenuLabel className="flex flex-col">
        <div className="font-medium">{tenant.hotelName}</div>
        <div className="text-xs text-muted-foreground">ID: {tenant.id}</div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <Settings className="mr-2 h-4 w-4" />
        Cài đặt tài khoản
      </DropdownMenuItem>
      <DropdownMenuItem>
        <HelpCircle className="mr-2 h-4 w-4" />
        Trợ giúp
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="text-red-600 focus:text-red-600">
        <LogOut className="mr-2 h-4 w-4" />
        Đăng xuất
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// Main dashboard layout component
export const DashboardLayout: React.FC<DashboardLayout> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { tenant, logout } = useAuth();

  // Get all navigation items including conditional ones
  const allNavItems = [
    ...navigationItems,
    ...getConditionalNavItems(
      tenant?.subscriptionPlan || mockTenant.subscriptionPlan
    ),
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar dùng component chuẩn */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        tenantData={tenant || mockTenant}
      />
      {/* Main content */}
      <div className="lg:ml-80">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  SaaS Provider Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Quản lý khách sạn và AI Assistant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                  2
                </span>
              </Button>
              {/* User menu sửa để gọi logout */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src=""
                        alt={(tenant || mockTenant).hotelName}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {(tenant || mockTenant).hotelName
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="flex flex-col">
                    <div className="font-medium">
                      {(tenant || mockTenant).hotelName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ID: {(tenant || mockTenant).id}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Cài đặt tài khoản
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Trợ giúp
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={logout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
