import React from 'react';
import Navbar from '../navigation/Navbar';
import Text from '../core/Text';
import { AppContextType } from '../../../lib/contextLib';

interface PageProps {
  children: React.ReactNode;
  title?: string;
  useAuthContext: () => AppContextType;
  sidebar?: React.ReactNode;
}

const Page: React.FC<PageProps> = ({ children, title, useAuthContext, sidebar }) => {
  return (
    <div className="flex flex-col">
      <title>{title} | Educatr</title>
      <Navbar useAuthContext={useAuthContext} />

      <div
        className="flex-1 flex"
        style={{ minHeight: 'calc(100vh - 74px)', height: 'calc(100vh - 74px)' }}
      >
        {sidebar && (
          <aside className="w-64 border-r">
            {sidebar}
          </aside>
        )}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      <footer className="bg-primary py-4 text-center">
        <Text variant="tiny" className="text-white/70">
          Verglas (NI) Limited is a company registered in Northern Ireland (no. NI716105). Registered office: Office 218 Unit 6, 100 Lisburn Road, Belfast, BT9 6AG. <br />
          IglooCode™ and Educatr™ are trademarks of Verglas (NI) Limited.
        </Text>
      </footer>
    </div>
  );
};

export default Page;
