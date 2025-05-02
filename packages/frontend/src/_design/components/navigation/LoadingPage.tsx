import React from 'react';
import { PacmanLoader } from 'react-spinners';
import clsx from 'clsx';

interface LoadingPageProps {
  message?: string;
  className?: string;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ message = 'Loading...', className }) => {
  return (
    <div className={clsx('flex flex-col items-center justify-center min-h-screen text-center', className)}>
      <PacmanLoader color="#6366f1" size={20} />
      <p className="mt-4 text-lg font-semibold text-gray-600">{message}</p>
    </div>
  );
};

export default LoadingPage;