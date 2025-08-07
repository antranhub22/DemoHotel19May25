/**
 * Simple UI System - Main Export
 * Lightweight replacement for shadcn/ui components
 */

// Core components
export { default as Button } from './Button';
export type { ButtonProps } from './Button';

export { default as Card, CardContent, CardFooter, CardHeader } from './Card';
export type { CardProps } from './Card';

export { default as Modal } from './Modal';
export type { ModalProps } from './Modal';

export { default as LoadingSpinner, VoiceLoadingSpinner } from './LoadingSpinner';
export type { LoadingSpinnerProps } from './LoadingSpinner';

// Design system
export { designTokens, getColor, getFontSize, getSpacing } from './design-tokens';
export type { DesignTokens } from './design-tokens';

// Additional components
export { default as Input } from './Input';
export type { InputProps } from './Input';

export { default as Badge } from './Badge';
export type { BadgeProps } from './Badge';

export { default as Toast, ToastContainer, useToast } from './Toast';
export type { ToastItem, ToastProps } from './Toast';

export { default as Divider } from './Divider';
export type { DividerProps } from './Divider';

export { default as Avatar } from './Avatar';
export type { AvatarProps } from './Avatar';

export { default as Switch } from './Switch';
export type { SwitchProps } from './Switch';

// Compatibility wrappers
export { default as CardTitle } from './CardTitle';
export type { CardTitleProps } from './CardTitle';

export { default as CardDescription } from './CardDescription';
export type { CardDescriptionProps } from './CardDescription';

