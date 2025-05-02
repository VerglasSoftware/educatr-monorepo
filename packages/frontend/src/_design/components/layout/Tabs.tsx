// Tabs.tsx
import React, { useEffect, useState, ReactElement, Children } from 'react';
import clsx from 'clsx';

interface TabProps {
  id: string;
  label: string;
  children: React.ReactNode;
}

export const Tab: React.FC<TabProps> = ({ children }) => <>{children}</>;

interface TabsProps {
  children: ReactElement<TabProps>[];
}

export const Tabs: React.FC<TabsProps> = ({ children }) => {
  const tabsArray = Children.toArray(children) as ReactElement<TabProps>[];

  const getTabIndexFromHash = () => {
    const hash = window.location.hash.replace('#', '');
    const foundIndex = tabsArray.findIndex((tab) => tab.props.id === hash);
    return foundIndex >= 0 ? foundIndex : 0;
  };

  const [activeIndex, setActiveIndex] = useState(getTabIndexFromHash);

  useEffect(() => {
    const onHashChange = () => {
      setActiveIndex(getTabIndexFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [tabsArray]);

  const changeTab = (index: number) => {
    const id = tabsArray[index].props.id;
    window.location.hash = id;
  };

  return (
    <div className="w-full rounded-md overflow-hidden">
      <div className="flex w-full bg-primary-hover/10 relative">
        {tabsArray.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={tab.props.id}
              onClick={() => changeTab(index)}
              className={clsx(
                'flex-1 text-center py-4 text-sm font-medium transition-all z-10',
                isActive
                  ? 'bg-white border-l border-r border-t border-b-0 border-primary/70 rounded-t-md text-primary'
                  : 'border-b border-primary/70 text-primary/70 hover:bg-white/50'
              )}
              style={{
                borderBottom: isActive ? 'none' : undefined,
              }}
            >
              {tab.props.label}
            </button>
          );
        })}
      </div>


      <div className="bg-white border border-t-0 border-primary/70 rounded-b-md p-6 text-sm text-gray-900">
        {tabsArray[activeIndex]}
      </div>
    </div>
  );
};
