import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import clsx from 'clsx';
import { Dangerous, ExpandMore } from '@mui/icons-material';

type BackgroundColour = 'transparent' | 'filled';
type Size = 'inline' | 'medium' | 'large';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  name: string;
  label: string;
  placeholder?: string;
  backgroundColour?: BackgroundColour;
  size?: Size;
  disabled?: boolean;
  required?: boolean;
  errorMessage?: string | null;
  readOnly?: boolean;
  icon?: React.ReactNode;
  options: SelectOption[];
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  searchable?: boolean;
  multiple?: boolean;
}

const Select: React.FC<SelectProps> = ({
  name,
  label,
  placeholder,
  backgroundColour = 'transparent',
  size = 'medium',
  disabled = false,
  required = false,
  errorMessage = null,
  readOnly = false,
  icon,
  options,
  value: controlledValue,
  defaultValue,
  onChange: controlledOnChange,
  searchable = false,
  multiple = false,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isControlled = controlledValue !== undefined && controlledOnChange !== undefined;

  const triggerRef = useRef<HTMLDivElement>(null);
  const [dropdownStyles, setDropdownStyles] = useState<React.CSSProperties>({});

  const [internalValue, setInternalValue] = useState<string[]>(
    Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : []
  );

  const selectedValue = isControlled
    ? Array.isArray(controlledValue)
      ? controlledValue
      : controlledValue
      ? [controlledValue]
      : []
    : internalValue;

  const toggleOpen = () => {
    if (disabled || readOnly) return;
    setOpen((prev) => !prev);
  };

    const handleSelect = (optionValue: string) => {
      let updated: string[];
      if (multiple) {
        updated = selectedValue.includes(optionValue)
          ? selectedValue.filter((v) => v !== optionValue)
          : [...selectedValue, optionValue];
      } else {
        updated = [optionValue];
      }
    
      // Trigger the onChange callback first
      if (isControlled) {
        controlledOnChange?.(multiple ? updated : updated[0]);
      } else {
        setInternalValue(updated);
      }
    
      // Close dropdown after state updates
      if (!multiple) setOpen(false);
    };

  const handleRemove = (valueToRemove: string) => {
    const updated = selectedValue.filter((v) => v !== valueToRemove);
    if (isControlled) {
      controlledOnChange?.(multiple ? updated : updated[0] || '');
    } else {
      setInternalValue(updated);
    }
  };

  const displayOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isError = Boolean(errorMessage);
  const showFilledBackground = backgroundColour === 'filled' && !disabled && !readOnly;

  const selectedLabels = options.filter((opt) => selectedValue.includes(opt.value)).map((opt) => opt.label);

  const labelClasses = clsx(
    'absolute left-3 top-1 text-xs font-medium pointer-events-none transition-all',
    {
      'text-primary': !isError,
      'text-destructive-active': isError,
    }
  );

  const sizeClasses = clsx({
    'text-base py-2 px-3': size === 'medium',
    'text-lg py-3 px-4': size === 'large',
    'text-sm py-2 px-2': size === 'inline',
  });

  const containerClasses = clsx(
    'w-full rounded-sm border focus-within:ring-2 focus-within:ring-offset-2 pt-5 relative transition-colors',
    {
      'border-primary/50 hover:border-primary focus-within:border-active': !isError,
      'border-destructive focus-within:border-destructive-active': isError,
      'bg-white': backgroundColour === 'transparent' || disabled || readOnly,
      'bg-primary/10': showFilledBackground,
      'bg-destructive/10': isError,
    }
  );

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyles({
        position: 'absolute',
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, [open]);

  return (
    <>
      <div className="w-full relative">
        <div className={containerClasses} ref={triggerRef}>
          <label htmlFor={name} className={labelClasses}>
            {label}
            {required && ' *'}
          </label>

          <div
            onClick={toggleOpen}
            className={clsx(
              'flex items-center justify-between flex-wrap w-full cursor-pointer gap-y-1',
              sizeClasses,
              {
                'pr-10': icon || isError,
                'pl-3': true,
              }
            )}
          >
            {selectedLabels.length === 0 ? (
              <span className="text-muted-foreground">{placeholder || 'Select...'}</span>
            ) : multiple ? (
              <div className="flex gap-1 flex-wrap">
                {selectedLabels.map((label, i) => (
                  <span
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(options.find((o) => o.label === label)?.value || '');
                    }}
                    className="bg-primary-hover/20 text-primary text-xs px-2 py-0.5 rounded-sm cursor-pointer hover:bg-primary-hover/10"
                  >
                    {label} ×
                  </span>
                ))}
              </div>
            ) : (
              <span className="truncate text-primary">{selectedLabels[0]}</span>
            )}

            <div className="flex items-center gap-1 pointer-events-none">
              {isError ? (
                <Dangerous className="h-5 w-5 text-destructive-active" />
              ) : (
                icon || <ExpandMore className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        <select
          name={name}
          multiple={multiple}
          required={required}
          disabled={disabled}
          hidden
          value={selectedValue}
          onChange={() => {}}
        >
          {!required && !multiple && <option value=""></option>}
          {options.map((option) => (
            <option key={option.value} value={option.value} onMouseDown={(e) => e.preventDefault()}>
              {option.label}
            </option>
          ))}
        </select>

        {isError && (
          <div className="text-destructive-active text-xs font-light mt-1">
            {errorMessage}
          </div>
        )}
      </div>

      {open &&
        ReactDOM.createPortal(
          <div style={dropdownStyles} className="bg-white border border-primary rounded-sm max-h-64 overflow-y-auto shadow-lg">
            {searchable && (
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 text-sm border-b border-primary outline-none"
                placeholder="Search..."
              />
            )}
            {displayOptions.map((option) => {
              const selected = selectedValue.includes(option.value);
              return (
                <div
                  key={option.value}
                  className={clsx(
                    'px-4 py-2 text-sm cursor-pointer',
                    selected ? 'bg-primary/10 font-medium' : 'hover:bg-primary/5'
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
};

export default Select;
