import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

interface DropdownItem {
  text: string;
  href?: string;
  onClick?: () => void;
}

interface DropdownProps {
  items: DropdownItem[];
  children: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({ items, children }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const updatePosition = () => {
      if (buttonRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: buttonRect.bottom,
          left: buttonRect.left,
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', updatePosition);
    updatePosition();
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updatePosition);
    };
  }, []);

  const dropdownContent = (
    <div
      className={clsx(
        'absolute z-50 mt-2 w-48 rounded-sm bg-white shadow-lg border border-gray-200',
        'overflow-visible'
      )}
      ref={dropdownRef}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: '120px',
      }}
    >
      <div className="py-1">
        {items.map((item, idx) => (
          item.href ? (
            <Link
              key={idx}
              to={{ pathname: item.href }}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              {item.text}
            </Link>
          ) : (
            <button
              key={idx}
              onClick={() => {
                item.onClick?.();
                setOpen(false);
              }}
              className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {item.text}
            </button>
          )
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative inline-block">
      <div ref={buttonRef} onClick={() => setOpen((prev) => !prev)} className="cursor-pointer">
        {children}
      </div>
      
      {open && ReactDOM.createPortal(dropdownContent, document.body)}
    </div>
  );
};

export default Dropdown;
