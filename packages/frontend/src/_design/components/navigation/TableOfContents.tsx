import React from 'react';
import clsx from 'clsx';
import Text from '../core/Text';

interface TocItem {
  id: string;
  label: string;
}

interface TableOfContentsProps {
  items: TocItem[];
  title?: string;
  onItemClick?: (id: string) => void;
  className?: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ items, title = "Table of Contents", onItemClick, className }) => {
  return (
    <aside
      className={clsx(
        'min-w-max px-4 py-4 border-l border-primary/80 h-full sticky top-0',
        className
      )}
    >
      <Text variant="h4" noMargin>{title}</Text>
      {
        items.length === 0 ? (
          <Text variant="body" noMargin className="text-primary/80">
            No entries found
          </Text>
        ) : null
      }
      <ul className="flex flex-col gap-1 mt-1">
        {items.map((item) => (
          <li
            key={item.id}
            className="text-xs text-primary/80 cursor-pointer transition"
            onClick={() => onItemClick?.(item.id)}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default TableOfContents;