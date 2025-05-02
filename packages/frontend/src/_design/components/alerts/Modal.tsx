import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import clsx from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  closeOnBackdropClick?: boolean;
}

const Modal: React.FC<ModalProps> & {
  Header: React.FC<{ children: React.ReactNode; className?: string }>;
  Body: React.FC<{ children: React.ReactNode; className?: string }>;
  Footer: React.FC<{ children: React.ReactNode; className?: string }>;
} = ({ isOpen, onClose, children, className, closeOnBackdropClick = false }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setVisible(false);
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen && !visible) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onMouseDown={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={clsx(
          'bg-white rounded-sm shadow-lg w-full max-w-lg mx-4 p-6 flex flex-col transform transition-all duration-300',
          visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
          className
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          ✕
        </button>
        {children}
      </div>
    </div>,
    document.getElementById('modal-root') as HTMLElement
  );
};

Modal.Header = ({ children, className }) => (
  <div className={clsx('mb-4 text-lg font-semibold', className)}>{children}</div>
);

Modal.Body = ({ children, className }) => (
  <div className={clsx('flex-1 mb-4', className)}>{children}</div>
);

Modal.Footer = ({ children, className }) => (
  <div className={clsx('mt-auto flex flex-row justify-end', className)}>{children}</div>
);

export default Modal;
