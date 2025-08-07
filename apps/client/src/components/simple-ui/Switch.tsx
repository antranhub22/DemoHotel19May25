/**
 * Simple Switch Component
 * Toggle control for settings
 */

import React from 'react';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /** Whether the switch is checked */
    checked?: boolean;

    /** Callback when switch state changes */
    onCheckedChange?: (checked: boolean) => void;

    /** Size of the switch */
    size?: 'sm' | 'md' | 'lg';

    /** Color variant */
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';

    /** Label for the switch */
    label?: string;

    /** Description text */
    description?: string;

    /** Whether the label is on the left or right */
    labelPosition?: 'left' | 'right';
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({
        className = '',
        checked = false,
        onCheckedChange,
        onChange,
        size = 'md',
        variant = 'primary',
        label,
        description,
        labelPosition = 'right',
        disabled = false,
        id,
        ...props
    }, ref) => {

        const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newChecked = e.target.checked;
            onCheckedChange?.(newChecked);
            onChange?.(e);
        };

        // Size styles
        const sizeStyles = {
            sm: {
                track: 'w-8 h-4',
                thumb: 'w-3 h-3',
                translate: 'translate-x-4',
            },
            md: {
                track: 'w-10 h-5',
                thumb: 'w-4 h-4',
                translate: 'translate-x-5',
            },
            lg: {
                track: 'w-12 h-6',
                thumb: 'w-5 h-5',
                translate: 'translate-x-6',
            },
        };

        // Variant styles
        const variantStyles = {
            default: {
                checked: 'bg-gray-600',
                unchecked: 'bg-gray-200',
            },
            primary: {
                checked: 'bg-blue-600',
                unchecked: 'bg-gray-200',
            },
            success: {
                checked: 'bg-green-600',
                unchecked: 'bg-gray-200',
            },
            warning: {
                checked: 'bg-orange-600',
                unchecked: 'bg-gray-200',
            },
            danger: {
                checked: 'bg-red-600',
                unchecked: 'bg-gray-200',
            },
        };

        // Track classes
        const trackClasses = [
            'relative inline-flex shrink-0',
            'border-2 border-transparent',
            'rounded-full cursor-pointer',
            'transition-colors duration-200 ease-in-out',
            'focus-within:ring-2 focus-within:ring-offset-2',
            sizeStyles[size].track,
            disabled
                ? 'opacity-50 cursor-not-allowed'
                : checked
                    ? variantStyles[variant].checked
                    : variantStyles[variant].unchecked,
            disabled ? '' : checked
                ? `focus-within:ring-${variant === 'default' ? 'gray' : variant === 'primary' ? 'blue' : variant === 'success' ? 'green' : variant === 'warning' ? 'orange' : 'red'}-500`
                : 'focus-within:ring-gray-500',
        ].filter(Boolean).join(' ');

        // Thumb classes
        const thumbClasses = [
            'pointer-events-none inline-block',
            'rounded-full bg-white shadow',
            'transform ring-0 transition duration-200 ease-in-out',
            sizeStyles[size].thumb,
            checked ? sizeStyles[size].translate : 'translate-x-0',
        ].join(' ');

        const SwitchComponent = (
            <label
                htmlFor={switchId}
                className={`
          relative inline-flex items-center
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
            >
                <span className={trackClasses}>
                    <input
                        ref={ref}
                        id={switchId}
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={handleChange}
                        disabled={disabled}
                        {...props}
                    />
                    <span className={thumbClasses} />
                </span>
            </label>
        );

        // If no label, return just the switch
        if (!label) {
            return SwitchComponent;
        }

        // With label and description
        return (
            <div className={`flex items-start gap-3 ${labelPosition === 'left' ? 'flex-row-reverse' : ''}`}>
                {SwitchComponent}

                <div className="flex-1 min-w-0">
                    <label
                        htmlFor={switchId}
                        className={`
              text-sm font-medium text-gray-700
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
                    >
                        {label}
                    </label>

                    {description && (
                        <p className={`
              mt-1 text-sm text-gray-500
              ${disabled ? 'opacity-50' : ''}
            `}>
                            {description}
                        </p>
                    )}
                </div>
            </div>
        );
    }
);

Switch.displayName = 'Switch';

export default Switch;
