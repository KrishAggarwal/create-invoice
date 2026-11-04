import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { HeaderComponent } from './components/layout/header.component';
import { useAppDispatch, useAppSelector } from './store';
import { setShowAuthModal, setShowDownloadSuccessModal } from './store/slices/uiSlice';
import { resetInvoice } from './store/slices/invoiceSlice';
import AuthModal from './features/auth/AuthModal';
import { DownloadSuccessModal } from './components/DownloadSuccessModal/DownloadSuccessModal';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const workspace = useAppSelector((state) => state.auth.workspace);
  const invoiceNumber = useAppSelector((state) => state.invoice.current.invoiceNumber);
  const showAuthModal = useAppSelector((state) => state.ui.showAuthModal);
  const showDownloadSuccessModal = useAppSelector((state) => state.ui.showDownloadSuccessModal);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* ── Global Shell Header ── */}
      <HeaderComponent />

      {/* ── Main View Outlet ── */}
      <main className="flex-1 min-h-0 flex flex-col">
        <Outlet />
      </main>

      {/* ── Global Modals ── */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => dispatch(setShowAuthModal(false))}
      />

      <DownloadSuccessModal
        isOpen={showDownloadSuccessModal}
        onClose={() => dispatch(setShowDownloadSuccessModal(false))}
        invoiceNumber={invoiceNumber}
        isAuthenticated={isAuthenticated}
        onViewInvoices={() => {
          dispatch(setShowDownloadSuccessModal(false));
          if (!isAuthenticated) {
            dispatch(setShowAuthModal(true));
          } else {
            navigate('/invoices');
          }
        }}
        onCreateNew={() => {
          dispatch(setShowDownloadSuccessModal(false));
          dispatch(resetInvoice({ workspace }));
          navigate('/');
        }}
      />
    </div>
  );
};

export default AppLayout;
