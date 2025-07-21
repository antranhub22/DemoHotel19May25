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
  Building2,
  ClipboardList,
  MessageSquare,
  UserCog,
  Database,
  Shield,
  BarChart3,
  Monitor,
  Wrench,
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
import {
  PermissionGuard,
  usePermissionCheck,
} from '@/components/unified-dashboard/guards/PermissionGuard';
import { useAuth } from '@/context/AuthContext';
import { logger } from '@shared/utils/logger';
import type { UserRole } from '@shared/constants/permissions';

// Types
interface UnifiedDashboardLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  permission: string;
  roleSpecific?: UserRole[];
}

// Navigation items configuration based on permissions and roles
const navigationItems: NavigationItem[] = [
  // Dashboard Overview - All roles can view
  {
    href: '/dashboard',
    icon: Home,
    label: 'Tổng quan',
    description: 'Thống kê và metrics tổng quan',
    permission: 'dashboard:view',
  },

  // Hotel Manager Features
  {
    href: '/dashboard/setup',
    icon: Bot,
    label: 'Thiết lập Assistant',
    description: 'Cấu hình và tùy chỉnh AI Assistant',
    permission: 'assistant:configure',
    roleSpecific: ['hotel-manager'],
  },
  {
    href: '/unified-dashboard/analytics',
    icon: BarChart,
    label: 'Phân tích nâng cao',
    description: 'Báo cáo và thống kê chi tiết',
    permission: 'analytics:view_advanced',
    roleSpecific: ['hotel-manager'],
  },
  {
    href: '/dashboard/billing',
    icon: CreditCard,
    label: 'Thanh toán',
    description: 'Quản lý subscription và billing',
    permission: 'billing:view',
    roleSpecific: ['hotel-manager'],
  },
  {
    href: '/unified-dashboard/staff-management',
    icon: Users,
    label: 'Quản lý nhân viên',
    description: 'Thêm, sửa, xóa tài khoản nhân viên',
    permission: 'staff:manage',
    roleSpecific: ['hotel-manager'],
  },
  {
    href: '/dashboard/settings',
    icon: Settings,
    label: 'Cài đặt hệ thống',
    description: 'Cấu hình khách sạn và hệ thống',
    permission: 'settings:manage',
    roleSpecific: ['hotel-manager'],
  },

  // Front Desk Staff Features
  {
    href: '/unified-dashboard/requests',
    icon: ClipboardList,
    label: 'Yêu cầu khách hàng',
    description: 'Xem và xử lý yêu cầu từ khách',
    permission: 'requests:view',
    roleSpecific: ['front-desk'],
  },
  {
    href: '/dashboard/guest-management',
    icon: UserCog,
    label: 'Quản lý khách hàng',
    description: 'Thông tin và lịch sử khách hàng',
    permission: 'guests:manage',
    roleSpecific: ['front-desk'],
  },
  {
    href: '/dashboard/basic-analytics',
    icon: BarChart3,
    label: 'Thống kê cơ bản',
    description: 'Báo cáo hoạt động hàng ngày',
    permission: 'analytics:view_basic',
    roleSpecific: ['front-desk'],
  },
  {
    href: '/dashboard/calls',
    icon: MessageSquare,
    label: 'Lịch sử cuộc gọi',
    description: 'Xem lịch sử cuộc gọi và transcript',
    permission: 'calls:view',
    roleSpecific: ['front-desk'],
  },

  // IT Manager Features
  {
    href: '/unified-dashboard/system-monitoring',
    icon: Monitor,
    label: 'Giám sát hệ thống',
    description: 'Theo dõi hiệu suất và sức khỏe hệ thống',
    permission: 'system:monitor',
    roleSpecific: ['it-manager'],
  },
  {
    href: '/dashboard/integrations',
    icon: Wrench,
    label: 'Tích hợp',
    description: 'Quản lý API và tích hợp bên thứ 3',
    permission: 'integrations:manage',
    roleSpecific: ['it-manager'],
  },
  {
    href: '/dashboard/logs',
    icon: Database,
    label: 'Nhật ký hệ thống',
    description: 'Xem logs và debug issues',
    permission: 'logs:view',
    roleSpecific: ['it-manager'],
  },
  {
    href: '/dashboard/security',
    icon: Shield,
    label: 'Bảo mật',
    description: 'Cấu hình và giám sát bảo mật',
    permission: 'security:manage',
    roleSpecific: ['it-manager'],
  },
];

// Role-specific styling
const getRoleTheme = (role: UserRole) => {
  switch (role) {
    case 'hotel-manager':
      return {
        primary: 'bg-blue-600 hover:bg-blue-700',
        accent: 'border-blue-200',
        badge: 'bg-blue-100 text-blue-800',
      };
    case 'front-desk':
      return {
        primary: 'bg-green-600 hover:bg-green-700',
        accent: 'border-green-200',
        badge: 'bg-green-100 text-green-800',
      };
    case 'it-manager':
      return {
        primary: 'bg-purple-600 hover:bg-purple-700',
        accent: 'border-purple-200',
        badge: 'bg-purple-100 text-purple-800',
      };
    default:
      return {
        primary: 'bg-gray-600 hover:bg-gray-700',
        accent: 'border-gray-200',
        badge: 'bg-gray-100 text-gray-800',
      };
  }
};

// Role display names
const getRoleDisplayName = (role: UserRole) => {
  switch (role) {
    case 'hotel-manager':
      return 'Quản lý khách sạn';
    case 'front-desk':
      return 'Lễ tân';
    case 'it-manager':
      return 'Quản lý IT';
    default:
      return 'Người dùng';
  }
};

// Navigation item component
const NavItem = ({
  href,
  icon: Icon,
  label,
  description,
  isActive,
  theme,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  isActive: boolean;
  theme: any;
}) => (
  <Link href={href}>
    <Button
      variant={isActive ? 'default' : 'ghost'}
      className={cn(
        'w-full justify-start gap-3 px-3 py-6 h-auto',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        isActive &&
          `${theme.primary} text-white hover:${theme.primary.replace('bg-', 'bg-').replace('600', '700')}`
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <div className="flex-1 text-left">
        <div className="font-medium">{label}</div>
        <div
          className={cn(
            'text-xs text-muted-foreground',
            isActive && 'text-white/80'
          )}
        >
          {description}
        </div>
      </div>
    </Button>
  </Link>
);

// User menu component
const UserMenu = ({
  user,
  role,
  onLogout,
}: {
  user: any;
  role: UserRole;
  onLogout: () => void;
}) => {
  const theme = getRoleTheme(role);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={user.avatar_url || ''}
              alt={user.display_name || user.email}
            />
            <AvatarFallback className={theme.primary}>
              {(user.display_name || user.email || '').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="flex flex-col">
          <div className="font-medium">{user.display_name || user.email}</div>
          <div className="text-xs text-muted-foreground">
            {getRoleDisplayName(role)}
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
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Dynamic sidebar component
const DynamicSidebar = ({
  isOpen,
  onClose,
  user,
  role,
  theme,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  role: UserRole;
  theme: any;
}) => {
  const [location] = useLocation();
  const permissionChecker = usePermissionCheck();
  const hasPermission = permissionChecker.canAccess;

  // Filter navigation items based on role and permissions
  const availableNavItems = navigationItems.filter(item => {
    // Check if user has permission
    if (!hasPermission(item.permission)) return false;

    // Check if item is role-specific
    if (item.roleSpecific && !item.roleSpecific.includes(role)) return false;

    return true;
  });

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div
          className={cn(
            'flex items-center justify-between p-6 border-b',
            theme.accent
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg text-white',
                theme.primary
              )}
            >
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Talk2Go</h1>
              <p className="text-sm text-muted-foreground">Hotel Management</p>
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

        {/* User info */}
        <div className={cn('px-6 py-4 border-b', theme.accent)}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-lg">
                {user.display_name || user.email}
              </div>
              <div className="text-xs text-gray-500">
                {getRoleDisplayName(role)}
              </div>
            </div>
            <Badge variant="outline" className={theme.badge}>
              {getRoleDisplayName(role)}
            </Badge>
          </div>

          {/* Quick actions */}
          <div className="mt-3 flex gap-2">
            <PermissionGuard requiredPermission="dashboard:view_client_interface">
              <Link
                href="/interface1"
                className={cn(
                  'flex-1 px-3 py-2 text-white text-sm rounded hover:opacity-90 transition text-center',
                  theme.primary
                )}
              >
                Giao diện khách
              </Link>
            </PermissionGuard>
            <Button variant="outline" size="sm" className="flex-1">
              <Bell className="h-4 w-4 mr-1" />
              Thông báo
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {availableNavItems.map(item => {
            const isActive = location === item.href;

            return (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                description={item.description}
                isActive={isActive}
                theme={theme}
              />
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className="text-xs text-center text-muted-foreground">
            © 2024 Talk2Go - Hotel AI Assistant
          </div>
        </div>
      </div>
    </aside>
  );
};

// Main unified dashboard layout component
export const UnifiedDashboardLayout: React.FC<UnifiedDashboardLayoutProps> = ({
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const role = user?.role || 'front-desk';

  // Get theme based on user role
  const theme = getRoleTheme(role);

  // Role-specific page title
  const getPageTitle = () => {
    switch (role) {
      case 'hotel-manager':
        return 'Dashboard Quản lý';
      case 'front-desk':
        return 'Dashboard Lễ tân';
      case 'it-manager':
        return 'Dashboard IT';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Dynamic sidebar */}
      <DynamicSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        role={role}
        theme={theme}
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
                  {getPageTitle()}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Quản lý khách sạn với AI Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <PermissionGuard requiredPermission="notifications:view">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    3
                  </Badge>
                </Button>
              </PermissionGuard>

              {/* User menu */}
              <UserMenu user={user} role={role} onLogout={logout} />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};
