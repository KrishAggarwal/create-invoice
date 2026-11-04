import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout as logoutAction } from '../../store/slices/authSlice';
import { resetInvoice } from '../../store/slices/invoiceSlice';
import { User, LogOut, ChevronDown, Sparkles } from 'lucide-react';

export const ProfileDropdownComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const workspace = useAppSelector((state) => state.auth.workspace);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigateToProfile = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  const handleLogout = () => {
    setIsOpen(false);
    dispatch(logoutAction());
    dispatch(resetInvoice({ workspace: null }));
    navigate('/');
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-2xs group"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
          {initials}
        </div>
        <div className="hidden sm:block text-left pr-1">
          <div className="text-xs font-bold text-slate-800 leading-tight group-hover:text-slate-900 truncate max-w-[110px]">
            {user?.fullName || 'My Account'}
          </div>
          <div className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
            {workspace?.entityType === 'agency' ? 'Business' : 'Individual'}
          </div>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-slate-700' : ''
          }`}
        />
      </button>

      {/* Floating Menu Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-100">
          {/* Header Summary */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 truncate max-w-[160px]">
                {user?.fullName}
              </span>
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                {workspace?.entityType === 'agency' ? 'Business' : 'Freelancer'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">
              {user?.email}
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-1 space-y-0.5">
            <button
              type="button"
              onClick={handleNavigateToProfile}
              className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-xl hover:bg-slate-100/80 transition-colors group"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <User className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-800">Profile</div>
                <div className="text-[10px] text-slate-400">Personal & payment details</div>
              </div>
            </button>
          </div>

          {/* Sign Out Item */}
          <div className="p-1">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-xl hover:bg-rose-50 text-rose-700 transition-colors group"
            >
              <div className="w-7 h-7 rounded-lg bg-rose-100/70 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <LogOut className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-semibold">Sign Out</div>
                <div className="text-[10px] text-rose-500/80">End your active session</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

