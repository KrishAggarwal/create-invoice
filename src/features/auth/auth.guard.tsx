import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch } from '../../store';
import { setShowAuthModal } from '../../store/slices/uiSlice';
import { Lock, LogIn, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-xs text-slate-400 animate-pulse font-medium">
          Verifying session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 px-6 py-10 bg-white rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
          <Lock className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Sign In Required
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            This section is protected. Please sign in or create an account to view and manage your data.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => dispatch(setShowAuthModal(true))}
            className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-all"
          >
            <LogIn className="w-3.5 h-3.5 text-emerald-400" /> Sign In / Register
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Editor
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

