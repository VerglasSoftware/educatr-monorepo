import React from 'react';
import { PacmanLoader } from 'react-spinners';
import clsx from 'clsx';

interface LoaderProps {
  size?: number;
  color?: string;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 20, color = '#151150', className }) => {
  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <PacmanLoader size={size} color={color} />
    </div>
  );
};

export default Loader;