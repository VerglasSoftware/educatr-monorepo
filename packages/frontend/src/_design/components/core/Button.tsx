import React from 'react';
import clsx from 'clsx';
import { PacmanLoader } from 'react-spinners';

type Size = 'small' | 'medium' | 'large';
type Variant = 'primary' | 'outline' | 'text';
type ColorScheme = 'primary' | 'secondary' | 'destructive' | 'success';

interface ButtonProps {
  children: React.ReactNode;
  size?: Size;
  variant?: Variant;
  fluid?: boolean;
  disabled?: boolean;
  loading?: boolean;
  colorScheme?: ColorScheme;
  preIcon?: React.ReactNode;
  onClick?: () => void;
}

const sizeClasses: Record<Size, string> = {
  small: 'text-sm px-3 py-1.5',
  medium: 'text-base px-4 py-2',
  large: 'text-lg px-5 py-3',
};

const baseColorClasses: Record<ColorScheme, { base: string; hover: string; active: string; text: string; border: string }> = {
  primary: {
    base: 'bg-primary',
    hover: 'hover:bg-primary-hover',
    active: 'active:bg-primary-active',
    text: 'text-white',
    border: 'border-primary',
  },
  secondary: {
    base: 'bg-gray-600',
    hover: 'hover:bg-gray-700',
    active: 'active:bg-gray-800',
    text: 'text-white',
    border: 'border-gray-600',
  },
  destructive: {
    base: 'bg-red-600',
    hover: 'hover:bg-red-700',
    active: 'active:bg-red-800',
    text: 'text-white',
    border: 'border-red-600',
  },
  success: {
    base: 'bg-green-600',
    hover: 'hover:bg-green-700',
    active: 'active:bg-green-800',
    text: 'text-white',
    border: 'border-green-600',
  },
};

const Button: React.FC<ButtonProps> = ({
  children,
  size = 'medium',
  variant = 'primary',
  fluid = false,
  disabled = false,
  loading = false,
  colorScheme = 'primary',
  preIcon,
  onClick,
}) => {
  const color = baseColorClasses[colorScheme];

  const classes = clsx(
    'inline-flex items-center justify-center rounded-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex-shrink-0',
    sizeClasses[size],
    fluid && 'w-full',
    !disabled && 'cursor-pointer',
    (disabled || loading) && 'opacity-50 pointer-events-none',
    {
      'border': variant !== 'text',
      [color.base]: variant === 'primary',
      [color.hover]: !disabled && !loading && variant !== 'text',
      [color.active]: !disabled && !loading && variant !== 'text',
      [color.text]: variant === 'primary',
      [color.border]: variant === 'outline',
      'bg-transparent': variant === 'outline' || variant === 'text',
    }
  );

  return (
    <button
      type={onClick ? 'button' : 'submit'}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <PacmanLoader color="#eee" size="0.875rem" />
      ) : (
        preIcon && <span className="mr-2">{preIcon}</span>
      )}
      {!loading && children}
    </button>
  );
};

export default Button;
