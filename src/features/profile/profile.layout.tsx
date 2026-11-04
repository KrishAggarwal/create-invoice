import React from 'react';
import { Outlet } from 'react-router-dom';

export const ProfileLayout: React.FC = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-150">
      <Outlet />
    </div>
  );
};

export default ProfileLayout;
