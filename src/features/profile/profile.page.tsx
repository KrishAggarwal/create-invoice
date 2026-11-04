import React, { useState } from 'react';
import { PersonalDetailsTabComponent } from './components/personal-details-tab.component';
import { PaymentInfoTabComponent } from './components/payment-info-tab.component';
import { User, CreditCard, ChevronRight } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'personal' | 'payment'>('personal');

  return (
    <div className="space-y-6">

      {/* Side-by-Side Layout Grid */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        
        {/* ── Left Sidebar Navigation (Apple-style minimal list) ── */}
        <div className="w-full md:w-64 shrink-0 md:sticky md:top-[85px]">
          <nav
            aria-label="Profile Sections"
            className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-2xs space-y-1"
          >
            {/* 1. Personal Details Navigation Button */}
            <button
              type="button"
              onClick={() => setActiveTab('personal')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer ${
                activeTab === 'personal'
                  ? 'bg-slate-900 text-white shadow-xs font-semibold'
                  : 'text-slate-700 hover:bg-slate-100 font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5 text-xs">
                <User
                  className={`w-4 h-4 ${
                    activeTab === 'personal' ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                />
                <span>Personal Details</span>
              </div>
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform ${
                  activeTab === 'personal' ? 'text-white' : 'text-slate-400'
                }`}
              />
            </button>

            {/* 2. Payment Info Navigation Button */}
            <button
              type="button"
              onClick={() => setActiveTab('payment')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer ${
                activeTab === 'payment'
                  ? 'bg-slate-900 text-white shadow-xs font-semibold'
                  : 'text-slate-700 hover:bg-slate-100 font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5 text-xs">
                <CreditCard
                  className={`w-4 h-4 ${
                    activeTab === 'payment' ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                />
                <span>Payment Info</span>
              </div>
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform ${
                  activeTab === 'payment' ? 'text-white' : 'text-slate-400'
                }`}
              />
            </button>
          </nav>
        </div>

        {/* ── Right Content Area ── */}
        <div className="flex-1 w-full min-w-0">
          {activeTab === 'personal' ? (
            <PersonalDetailsTabComponent />
          ) : (
            <PaymentInfoTabComponent />
          )}
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
