import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch } from '../../store';
import { setShowAuthModal } from '../../store/slices/uiSlice';
import { ProfileDropdownComponent } from './profile-dropdown.component';
import {
  FileText,
  LayoutDashboard,
  PenTool,
  LogIn,
  Layout,
} from 'lucide-react';

export const HeaderComponent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-[1700px] h-full mx-auto px-4 sm:px-6 flex items-center justify-between relative">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer bg-transparent border-0 p-0 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 group-hover:bg-slate-800 flex items-center justify-center shadow-xs transition-colors">
              <FileText className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-base font-extrabold text-slate-900 tracking-tight">
              Invoice Studio
            </span>
          </button>
        </div>

        {/* Center: Nav Switcher (Mathematically Centered in Header) */}
        <nav
          aria-label="Main Navigation"
          className="flex sm:absolute sm:left-1/2 sm:-translate-x-1/2 rounded-xl bg-slate-100 p-0.5 text-xs border border-slate-200/50 shadow-2xs"
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3.5 py-1.5 font-semibold rounded-lg transition-all ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`
            }
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Editor</span>
          </NavLink>

          <NavLink
            to="/invoices"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3.5 py-1.5 font-semibold rounded-lg transition-all ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`
            }
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Invoices</span>
          </NavLink>

          <NavLink
            to="/templates"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3.5 py-1.5 font-semibold rounded-lg transition-all ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`
            }
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Templates</span>
          </NavLink>
        </nav>

        {/* Right: Account Profile Dropdown or Sign In */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <ProfileDropdownComponent />
          ) : (
            <button
              type="button"
              onClick={() => dispatch(setShowAuthModal(true))}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-500" />
              <span>Sign In</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
