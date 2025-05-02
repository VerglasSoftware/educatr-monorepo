import React from 'react';
import { PacmanLoader } from 'react-spinners';
import clsx from 'clsx';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';

interface TableProps {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}

interface CellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

interface HeadCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
}

const Table: React.FC<TableProps> & {
  Head: React.FC<{ children: React.ReactNode; className?: string }>;
  Body: React.FC<{ children: React.ReactNode; className?: string }>;
  Row: React.FC<{ children: React.ReactNode; className?: string }>;
  Cell: React.FC<CellProps>;
  HeadCell: React.FC<HeadCellProps>;
} = ({ children, loading = false, className }) => {
  return (
    <div className={clsx('relative w-full overflow-x-auto', className)}>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <PacmanLoader color="#151150" size={16} />
        </div>
      ) : (
        <table className="min-w-full text-sm text-left">
          {children}
        </table>
      )}
    </div>
  );
};

Table.Head = ({ children, className }) => (
  <thead className={clsx('border-b border-gray-200 bg-gray-50 text-base font-semibold', className)}>
    {children}
  </thead>
);

Table.Body = ({ children, className }) => (
  <tbody className={clsx('divide-y divide-gray-100 font-light', className)}>
    {children}
  </tbody>
);

Table.Row = ({ children, className }) => (
  <tr className={clsx('hover:bg-gray-50', className)}>
    {children}
  </tr>
);

Table.Cell = ({ children, className, align = 'left' }) => (
  <td
    className={clsx(
      'px-4 py-3',
      {
        'text-left': align === 'left',
        'text-center': align === 'center',
        'text-right': align === 'right',
      },
      className
    )}
  >
    {children}
  </td>
);

Table.HeadCell = ({ children, className, align = 'left', sortable = false, sortDirection = null, onSort }) => (
  <th
    onClick={sortable ? onSort : undefined}
    className={clsx(
      'px-4 py-3 cursor-pointer select-none',
      {
        'text-left': align === 'left',
        'text-center': align === 'center',
        'text-right': align === 'right',
        'hover:bg-gray-100': sortable,
      },
      className
    )}
  >
    <div className="flex items-center gap-1">
      {children}
      {sortable && (
        <>
          {sortDirection === 'asc' && <IoChevronUp size={16} />}
          {sortDirection === 'desc' && <IoChevronDown size={16} />}
          {sortDirection === null && <IoChevronDown size={16} className="opacity-30" />}
        </>
      )}
    </div>
  </th>
);

export default Table;
