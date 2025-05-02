import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-primary-hover/20 text-primary rounded-sm p-4 flex min-h-24 flex-col gap-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
