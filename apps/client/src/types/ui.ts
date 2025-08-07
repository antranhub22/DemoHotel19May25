import * as React from 'react';
/* ========================================
   UI TYPES - USER INTERFACE TYPE DEFINITIONS
   ======================================== */

// ========================================
// COMPONENT PROPS TYPES
// ========================================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
  'data-testid'?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant?:
    | 'default'
    | 'outline'
    | 'secondary'
    | 'destructive'
    | 'ghost'
    | 'link'
    | 'yellow';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

export interface SelectProps extends BaseComponentProps {
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  onChange?: (value: string) => void;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export interface ToastProps extends BaseComponentProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ========================================
// DASHBOARD TYPES
// ========================================

export interface DashboardMetric {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ComponentType<{ className?: string }>;
  status?: 'normal' | 'warning' | 'error' | 'success';
  format?: 'number' | 'currency' | 'percentage' | 'duration';
  suffix?: string;
  prefix?: string;
}

export interface DashboardCard {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  }>;
  loading?: boolean;
  error?: string;
}

export interface NavigationItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  badge?: string;
  disabled?: boolean;
  children?: NavigationItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface UserMenuProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  tenantData: {
    hotelName: string;
    subscriptionPlan: string;
    subscriptionStatus: string;
  };
  onLogout: () => void;
}

// ========================================
// FORM TYPES
// ========================================

export interface FormField {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'date'
    | 'time';
  placeholder?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  options?: Array<{
    value: string;
    label: string;
  }>;
  defaultValue?: any;
}

export interface FormConfig {
  fields: FormField[];
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
}

export interface FormData {
  [key: string]: any;
}

export interface FormValidation {
  [key: string]: string | undefined;
}

// ========================================
// TABLE TYPES
// ========================================

export interface TableColumn<T = any> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  error?: string;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number) => void;
  };
  sorting?: {
    key: string;
    order: 'asc' | 'desc';
    onChange: (key: string, order: 'asc' | 'desc') => void;
  };
  selection?: {
    selected: string[];
    onChange: (selected: string[]) => void;
  };
  actions?: Array<{
    label: string;
    onClick: (row: T) => void;
    variant?: 'default' | 'outline' | 'ghost';
    disabled?: (row: T) => boolean;
  }>;
}

// ========================================
// CHART TYPES
// ========================================

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  data: ChartData[];
  xAxis?: {
    label: string;
    dataKey: string;
  };
  yAxis?: {
    label: string;
    dataKey: string;
  };
  title?: string;
  description?: string;
  height?: number;
  width?: number;
}

export interface AnalyticsChart {
  id: string;
  title: string;
  description?: string;
  config: ChartConfig;
  loading?: boolean;
  error?: string;
}

// ========================================
// NOTIFICATION TYPES
// ========================================

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface NotificationGroup {
  title: string;
  notifications: Notification[];
  unreadCount: number;
}

// ========================================
// THEME TYPES
// ========================================

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    input: string;
    ring: string;
    destructive: string;
    destructiveForeground: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface ThemeConfig {
  current: string;
  themes: Record<string, Theme>;
  darkMode: boolean;
  setTheme: (theme: string) => void;
  toggleDarkMode: () => void;
}

// ========================================
// LAYOUT TYPES
// ========================================

export interface LayoutConfig {
  sidebar: {
    collapsed: boolean;
    width: number;
    minWidth: number;
    maxWidth: number;
  };
  header: {
    height: number;
    sticky: boolean;
  };
  footer: {
    height: number;
    visible: boolean;
  };
  content: {
    padding: string;
    maxWidth: string;
  };
}

export interface ResponsiveBreakpoint {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

// ========================================
// ANIMATION TYPES
// ========================================

export interface AnimationConfig {
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  delay?: number;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  iterationCount?: number | 'infinite';
}

export interface TransitionConfig {
  property: string;
  duration: number;
  easing: string;
  delay?: number;
}

// ========================================
// ACCESSIBILITY TYPES
// ========================================

export interface AriaProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-hidden'?: boolean;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean;
  'aria-disabled'?: boolean;
  'aria-required'?: boolean;
  'aria-invalid'?: boolean;
  'aria-pressed'?: boolean;
  'aria-current'?: boolean;
  role?: string;
  tabIndex?: number;
}

// ========================================
// INTERNATIONALIZATION TYPES
// ========================================

export interface I18nConfig {
  defaultLanguage: Language;
  supportedLanguages: Language[];
  fallbackLanguage: Language;
  namespaces: string[];
  interpolation: {
    prefix: string;
    suffix: string;
  };
}

export interface Translation {
  [key: string]: string | Translation;
}

export interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: Record<string, any>) => string;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency: string) => string;
}
