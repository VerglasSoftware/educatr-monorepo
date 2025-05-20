import React from 'react';
import clsx from 'clsx';
import { Dangerous } from '@mui/icons-material';

type InputType = 'text' | 'number' | 'email' | 'password';
type BackgroundColour = 'transparent' | 'filled';
type Size = 'inline' | 'medium' | 'large';

interface InputProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: InputType;
  backgroundColour?: BackgroundColour;
  size?: Size;
  disabled?: boolean;
  required?: boolean;
  errorMessage?: string | null;
  readOnly?: boolean;
  textarea?: boolean;
  rows?: number;
  icon?: React.ReactNode;
  maxLength?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const Input: React.FC<InputProps> = ({
  name,
  label,
  placeholder,
  type = 'text',
  backgroundColour = 'transparent',
  size = 'medium',
  disabled = false,
  required = false,
  errorMessage = null,
  readOnly = false,
  textarea = false,
  rows = 3,
  icon,
  maxLength,
  value,
  defaultValue,
  onChange,
  onBlur,
}) => {
  const isError = Boolean(errorMessage);
  const showFilledBackground = backgroundColour === 'filled' && !disabled && !readOnly;

  const baseClasses =
    'w-full rounded-sm border focus:outline-none transition-colors focus:ring-2 focus:ring-offset-2 pt-5';

  const backgroundClasses = clsx({
    'bg-white': backgroundColour === 'transparent' || disabled || readOnly,
    'bg-primary/10': showFilledBackground,
    'bg-destructive/10': isError,
  });

  const borderClasses = clsx({
    'border-primary/50 hover:border-primary focus:border-active': !isError,
    'border-destructive focus:border-destructive-active': isError,
  });

  const sizeClasses = clsx({
    'text-base py-2 px-3': size === 'medium',
    'text-lg py-3 px-4': size === 'large',
    'text-sm py-2 px-2': size === 'inline',
  });

  const labelClasses = clsx(
    'absolute left-3 top-1 text-xs font-medium pointer-events-none transition-all',
    {
      'text-primary': !isError,
      'text-destructive-active': isError,
    }
  );

  const containerClasses = clsx('relative w-full');

  const inputProps = {
    id: name,
    name,
    placeholder,
    type,
    disabled,
    required,
    readOnly,
    maxLength,
    value,
    defaultValue,
    onChange,
    onBlur,
    className: clsx(
      baseClasses,
      backgroundClasses,
      borderClasses,
      sizeClasses,
      {
        'pr-10': icon || isError,
        'pl-3': true,
      }
    ),
  };

  return (
    <div className="w-full">
      <div className={containerClasses}>
        <label htmlFor={name} className={labelClasses}>
          {label}
          {required && ' *'}
        </label>

        {textarea ? (
          <textarea rows={rows} {...inputProps} />
        ) : (
          <input {...inputProps} />
        )}

        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
          {isError ? (
            <Dangerous className="h-5 w-5 text-destructive-active" />
          ) : (
            icon && <div className="text-gray-400">{icon}</div>
          )}
        </div>
      </div>

      {isError && (
        <div className="text-destructive-active text-xs font-light mt-1">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default Input;
