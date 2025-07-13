import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Bot, 
  BarChart, 
  Settings, 
  CreditCard, 
  Users, 
  Bell,
  Menu,
  X,
  LogOut,
  HelpCircle,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  remainingDays: 15
};

// Navigation items
const navigationItems = [
  {
    href: '/dashboard',
    icon: Home,
    label: 'Tổng quan',
    description: 'Metrics và thống kê tổng quan'
  },
  {
    href: '/dashboard/setup',
    icon: Bot,
    label: 'Thiết lập Assistant',
    description: 'Cấu hình và tùy chỉnh AI Assistant'
  },
  {
    href: '/dashboard/analytics',
    icon: BarChart,
    label: 'Phân tích',
    description: 'Báo cáo và thống kê chi tiết'
  },
  {
    href: '/dashboard/settings',
    icon: Settings,
    label: 'Cài đặt',
    description: 'Quản lý thông tin khách sạn'
  }
];

// Conditional navigation items based on subscription
const getConditionalNavItems = (subscriptionPlan: string) => {
  const items = [];
  
  if (subscriptionPlan !== 'trial') {
    items.push({
      href: '/dashboard/billing',
      icon: CreditCard,
      label: 'Thanh toán',
      description: 'Quản lý subscription và billing'
    });
  }
  
  if (subscriptionPlan === 'enterprise') {
    items.push({
      href: '/dashboard/team',
      icon: Users,
      label: 'Nhóm',
      description: 'Quản lý team và permissions'
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
  isActive 
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  isActive: boolean;
}) => (
  <Link href={href}>
    <Button
      variant={isActive ? "default" : "ghost"}
      className={cn(
        "w-full justify-start gap-3 px-3 py-6 h-auto",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <div className="flex-1 text-left">
        <div className="font-medium">{label}</div>
        <div className={cn(
          "text-xs text-muted-foreground",
          isActive && "text-primary-foreground/80"
        )}>
          {description}
        </div>
      </div>
    </Button>
  </Link>
);

// Subscription status badge
const SubscriptionBadge = ({ plan, status }: { plan: string; status: string }) => {
  const getVariant = () => {
    if (status === 'expired') return 'destructive';
    if (plan === 'trial') return 'secondary';
    if (plan === 'enterprise') return 'default';
    return 'outline';
  };

  const getLabel = () => {
    if (plan === 'trial') return 'Dùng thử';
    if (plan === 'basic') return 'Cơ bản';
    if (plan === 'premium') return 'Cao cấp';
    if (plan === 'enterprise') return 'Doanh nghiệp';
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
        <div className="text-xs text-muted-foreground">
          ID: {tenant.id}
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
      <DropdownMenuItem className="text-red-600 focus:text-red-600">
        <LogOut className="mr-2 h-4 w-4" />
        Đăng xuất
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// Main dashboard layout component
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  
  // Get all navigation items including conditional ones
  const allNavItems = [
    ...navigationItems,
    ...getConditionalNavItems(mockTenant.subscriptionPlan)
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
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo and close button */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Talk2Go</h1>
                <p className="text-sm text-muted-foreground">SaaS Dashboard</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Hotel info */}
          <div className="p-6 border-b bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {mockTenant.hotelName}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {mockTenant.subscriptionStatus === 'active' ? 'Hoạt động' : 'Hết hạn'}
                </p>
              </div>
              <SubscriptionBadge 
                plan={mockTenant.subscriptionPlan} 
                status={mockTenant.subscriptionStatus}
              />
            </div>
            
            {/* Trial warning */}
            {mockTenant.subscriptionPlan === 'trial' && mockTenant.remainingDays && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Còn {mockTenant.remainingDays} ngày</strong> dùng thử
                </p>
                <Link href="/dashboard/billing">
                  <Button size="sm" className="mt-2 w-full">
                    Nâng cấp ngay
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {allNavItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                description={item.description}
                isActive={location === item.href}
              />
            ))}
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              © 2024 Talk2Go. All rights reserved.
            </p>
          </div>
        </div>
      </aside>
      
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
                  Dashboard
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
              
              {/* User menu */}
              <UserMenu tenant={mockTenant} />
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 