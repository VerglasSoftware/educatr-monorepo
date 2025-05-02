import React from 'react';
import clsx from 'clsx';
import { ChevronRight } from '@mui/icons-material';
import Text from '../core/Text';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  separator = <ChevronRight className="w-4 h-4 text-gray-400" />,
  className,
}) => {
  return (
    <nav className={clsx('flex items-center text-sm font-light text-gray-600', className)} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index !== 0 && (
            <span className="mx-2 mb-1 flex-shrink-0">{separator}</span>
          )}
          {item.href ? (
            <Link
              to={{ pathname: item.href }}
              className="hover:text-primary transition-colors font-medium"
            >
              <Text variant="tiny">{item.label}</Text>
            </Link>
          ) : (
            <Text variant="tiny">{item.label}</Text>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
