import {
  Bell,
  ChevronRight,
  HelpCircle,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  User,
} from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'wouter';
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

// Types
interface TopBarProps {
  onSidebarToggle: () => void;
  tenantData: {
    id: string;
    hotelName: string;
    subscriptionPlan: 'trial' | 'basic' | 'premium' | 'enterprise';
    subscriptionStatus: 'active' | 'expired' | 'cancelled';
  };
  notifications: {
    count: number;
    items: Array<{
      id: string;
      title: string;
      message: string;
      timestamp: string;
      read: boolean;
      type: 'info' | 'warning' | 'error' | 'success';
    }>;
  };
  user: {
    name: string;
    email: string;
    avatar?: string;
    role: 'admin' | 'manager' | 'staff';
  };
  onLogout: () => void;
}

// Notification dropdown component
const NotificationDropdown = ({
  count,
  items,
}: {
  count: number;
  items: TopBarProps['notifications']['items'];
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      default:
        return 'ℹ';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Thông báo</span>
          {count > 0 && (
            <Badge variant="secondary" className="text-xs">
              {count} mới
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {items.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Không có thông báo mới
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {items.slice(0, 5).map(notification => (
              <DropdownMenuItem
                key={notification.id}
                className="flex-col items-start p-3 space-y-1"
              >
                <div className="flex items-center gap-2 w-full">
                  <span
                    className={`text-sm ${getTypeColor(notification.type)}`}
                  >
                    {getTypeIcon(notification.type)}
                  </span>
                  <span className="font-medium text-sm">
                    {notification.title}
                  </span>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto"></div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {notification.message}
                </p>
                <span className="text-xs text-muted-foreground">
                  {notification.timestamp}
                </span>
              </DropdownMenuItem>
            ))}

            {items.length > 5 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-sm text-blue-600">
                  Xem tất cả thông báo
                </DropdownMenuItem>
              </>
            )}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// User menu component
const UserMenu = ({
  user,
  tenantData,
  onLogout,
}: {
  user: TopBarProps['user'];
  tenantData: TopBarProps['tenantData'];
  onLogout: () => void;
}) => {
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'manager':
        return 'Quản lý';
      case 'staff':
        return 'Nhân viên';
      default:
        return role;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel className="flex flex-col">
          <div className="font-medium">{user.name}</div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {getRoleLabel(user.role)}
            </Badge>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <div className="px-2 py-1">
          <div className="text-xs font-medium text-muted-foreground mb-1">
            Khách sạn hiện tại:
          </div>
          <div className="text-sm font-medium">{tenantData.hotelName}</div>
          <div className="text-xs text-muted-foreground">
            ID: {tenantData.id}
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          Hồ sơ cá nhân
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Cài đặt tài khoản
        </DropdownMenuItem>

        <DropdownMenuItem>
          <HelpCircle className="mr-2 h-4 w-4" />
          Trợ giúp & Hỗ trợ
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

// Theme toggle component
const ThemeToggle = () => {
  const [isDark, setIsDark] = React.useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    // Here you would integrate with your theme system
    document.documentElement.classList.toggle('dark');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
};

// Breadcrumb component
const Breadcrumb = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => {
  const [location] = useLocation();
  const pathSegments = location.substring(1).split('/').filter(Boolean);

  const getBreadcrumbPath = (index: number) => {
    return `/${pathSegments.slice(0, index + 1).join('/')}`;
  };

  const getSegmentLabel = (segment: string) => {
    switch (segment) {
      case 'dashboard':
        return 'Tổng quan';
      case 'setup':
        return 'Thiết lập';
      case 'analytics':
        return 'Phân tích';
      case 'settings':
        return 'Cài đặt';
      case 'billing':
        return 'Thanh toán';
      case 'team':
        return 'Nhóm';
      default:
        return segment;
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">
          Trang chủ
        </Link>
        {pathSegments.map((segment, index) => (
          <React.Fragment key={index}>
            <ChevronRight className="h-4 w-4" />
            <Link
              href={getBreadcrumbPath(index)}
              className="hover:text-primary"
            >
              {getSegmentLabel(segment)}
            </Link>
          </React.Fragment>
        ))}
      </div>
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h1>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

// Main TopBar component
export const TopBar: React.FC<TopBarProps> = ({
  onSidebarToggle,
  tenantData,
  notifications,
  user,
  onLogout,
}) => {
  // Get current page title from URL or context
  const getCurrentPageInfo = () => {
    const path = window.location.pathname;

    if (path === '/saas-dashboard') {
      return {
        title: 'Tổng quan',
        description: 'Theo dõi hiệu suất AI Assistant',
      };
    } else if (path.includes('/setup')) {
      return {
        title: 'Thiết lập Assistant',
        description: 'Cấu hình AI Assistant',
      };
    } else if (path.includes('/analytics')) {
      return {
        title: 'Phân tích',
        description: 'Báo cáo và thống kê chi tiết',
      };
    } else if (path.includes('/settings')) {
      return { title: 'Cài đặt', description: 'Quản lý thông tin khách sạn' };
    } else if (path.includes('/billing')) {
      return { title: 'Thanh toán', description: 'Quản lý subscription' };
    } else if (path.includes('/team')) {
      return { title: 'Nhóm', description: 'Quản lý team và permissions' };
    }

    return { title: 'Dashboard', description: '' };
  };

  const pageInfo = getCurrentPageInfo();

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b shadow-sm">
      <div className="grid grid-cols-12 gap-4 p-4 lg:px-6">
        {/* Left section - spans 4 columns on desktop, full width on mobile */}
        <div className="col-span-12 lg:col-span-4 flex items-center gap-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onSidebarToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Page info with breadcrumb */}
          <Breadcrumb
            title={pageInfo.title}
            description={pageInfo.description}
          />
        </div>

        {/* Center section - spans 4 columns, hidden on mobile */}
        <div className="hidden lg:col-span-4 lg:flex items-center justify-center">
          {/* Subscription status */}
          <div className="flex items-center gap-2">
            <Badge
              variant={
                tenantData.subscriptionStatus === 'active'
                  ? 'default'
                  : 'destructive'
              }
              className="text-xs"
            >
              {tenantData.subscriptionPlan === 'trial'
                ? 'Dùng thử'
                : tenantData.subscriptionPlan === 'basic'
                  ? 'Cơ bản'
                  : tenantData.subscriptionPlan === 'premium'
                    ? 'Cao cấp'
                    : 'Doanh nghiệp'}
            </Badge>
          </div>
        </div>

        {/* Right section - spans 4 columns on desktop, full width on mobile */}
        <div className="col-span-12 lg:col-span-4 flex items-center justify-end gap-2">
          {/* Theme toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <NotificationDropdown
            count={notifications.count}
            items={notifications.items}
          />

          {/* User menu */}
          <UserMenu user={user} tenantData={tenantData} onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
