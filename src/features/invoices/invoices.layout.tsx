import React from 'react';
import { Outlet } from 'react-router-dom';

export const InvoicesLayout: React.FC = () => {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-150">
      <Outlet />
    </div>
  );
};

export default InvoicesLayout;

