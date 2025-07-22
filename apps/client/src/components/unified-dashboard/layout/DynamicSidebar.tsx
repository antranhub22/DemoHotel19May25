import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { getMenuForRole } from '@shared/constants/permissions';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { logger } from '@shared/utils/logger';
import { PermissionGuard, usePermissionCheck } from '../guards/PermissionGuard';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

interface DynamicSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface MenuItem {
  key: string;
  label: string;
  icon: string;
  path: string;
  requiredPermission?: string;
  children?: MenuItem[];
}

// Convert permission format to icon component
const getIconComponent = (iconStr: string) => {
  // For now, just return the emoji. In production, you'd map to actual icon components
  return <span className="text-lg">{iconStr}</span>;
};

// Menu item component with permission checking
const MenuItemComponent: React.FC<{
  item: MenuItem;
  isActive: boolean;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  depth: number;
}> = ({ item, isActive, hasChildren, isExpanded, onToggle, depth }) => {
  const { canAccess } = usePermissionCheck();

  // Check if user has permission for this menu item
  if (item.requiredPermission && !canAccess(item.requiredPermission)) {
    return null; // Hide menu item if no permission
  }

  const itemContent = (
    <div
      className={cn(
        'flex items-center justify-between w-full px-3 py-2 text-left transition-colors',
        'hover:bg-gray-100 dark:hover:bg-gray-700',
        isActive &&
          'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        depth > 0 && 'ml-4 text-sm'
      )}
    >
      <div className="flex items-center gap-3">
        {getIconComponent(item.icon)}
        <span className="font-medium">{item.label}</span>
      </div>
      {hasChildren && (
        <div className="flex items-center">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
      )}
    </div>
  );

  if (hasChildren) {
    return (
      <Button
        variant="ghost"
        className="w-full justify-start p-0 h-auto"
        onClick={onToggle}
      >
        {itemContent}
      </Button>
    );
  }

  return (
    <Link href={item.path}>
      <Button variant="ghost" className="w-full justify-start p-0 h-auto">
        {itemContent}
      </Button>
    </Link>
  );
};

// Role badge component
const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const roleConfig = {
    'hotel-manager': {
      label: 'Hotel Manager',
      color: 'bg-purple-100 text-purple-800',
    },
    'front-desk': { label: 'Front Desk', color: 'bg-blue-100 text-blue-800' },
    'it-manager': { label: 'IT Manager', color: 'bg-green-100 text-green-800' },
  };

  const config = roleConfig[role as keyof typeof roleConfig] || {
    label: 'Unknown',
    color: 'bg-gray-100 text-gray-800',
  };

  return (
    <Badge className={cn('text-xs font-medium', config.color)}>
      {config.label}
    </Badge>
  );
};

/**
 * DynamicSidebar - A role-based sidebar that shows different menu items based on user permissions
 *
 * Features:
 * - Automatically filters menu items based on user permissions
 * - Shows different content for different roles
 * - Supports nested menu items with expandable/collapsible sections
 * - Responsive design with mobile support
 */
export const DynamicSidebar: React.FC<DynamicSidebarProps> = ({
  isOpen,
  onClose,
  className,
}) => {
  const [location] = useLocation();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Get menu items for current user role
  const menuItems = user ? getMenuForRole(user.role) : [];

  // Toggle expanded state for menu items with children
  const toggleExpanded = (itemKey: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemKey)) {
      newExpanded.delete(itemKey);
    } else {
      newExpanded.add(itemKey);
    }
    setExpandedItems(newExpanded);
  };

  // Check if a path is active
  const isActivePath = (path: string) => {
    if (path === '/dashboard' && location === '/dashboard') {return true;}
    if (path !== '/dashboard' && location.startsWith(path)) {return true;}
    return false;
  };

  // Render menu items recursively
  const renderMenuItems = (items: any[], depth = 0): React.ReactNode => {
    return items.map(item => {
      const isActive = isActivePath(item.path);
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedItems.has(item.key);

      return (
        <div key={item.key} className="space-y-1">
          <MenuItemComponent
            item={item}
            isActive={isActive}
            hasChildren={hasChildren}
            isExpanded={isExpanded}
            onToggle={() => toggleExpanded(item.key)}
            depth={depth}
          />

          {/* Render children if expanded */}
          {hasChildren && isExpanded && (
            <div className="ml-4 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-4">
              {renderMenuItems(item.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  if (!user) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>Please log in to access the dashboard</p>
      </div>
    );
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        className
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Dashboard
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user.name}
            </span>
            <RoleBadge role={user.role} />
          </div>
        </div>

        {/* Close button for mobile */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="lg:hidden"
        >
          ✕
        </Button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">{renderMenuItems(menuItems)}</div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>Hotel Management System</p>
          <p>Role-based Dashboard v2.0</p>
        </div>
      </div>
    </aside>
  );
};

export default DynamicSidebar;
