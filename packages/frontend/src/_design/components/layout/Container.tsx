import React from 'react';
import clsx from 'clsx';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

const Container: React.FC<ContainerProps> = ({ children, className }) => {
  return (
    <div
      className={clsx(
        'mx-auto px-4 py-5',
        'sm:max-w-screen-sm',
        'md:max-w-screen-md',
        'lg:max-w-screen-lg lg:px-10',
        'xl:max-w-screen-xl',
        '2xl:max-w-screen-2xl',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Container;