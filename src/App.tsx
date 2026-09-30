import { useRef, useState, useCallback } from 'react';
import InvoiceForm from './components/InvoiceForm/InvoiceForm';
import InvoicePreview from './components/InvoicePreview/InvoicePreview';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  type InvoiceData,
  type PaymentAccount,
  type SavedClient,
  type SenderInfo,
  getDefaultInvoiceData,
} from './types/invoice';
import { downloadPDF } from './utils/pdf';

export default function App() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Persist sender info and saved accounts
  const [savedSender, setSavedSender] = useLocalStorage<SenderInfo>(
    'invoice-sender',
    { name: '', title: '', email: '', phone: '', address: '' }
  );
  const [savedAccounts, setSavedAccounts] = useLocalStorage<PaymentAccount[]>(
    'invoice-accounts',
    []
  );
  const [savedClients, setSavedClients] = useLocalStorage<SavedClient[]>(
    'invoice-clients',
    []
  );

  const [data, setData] = useState<InvoiceData>(() => {
    const defaults = getDefaultInvoiceData();
    // Restore saved sender info
    if (savedSender.name) {
      defaults.sender = { ...savedSender };
    }
    return defaults;
  });

  const handleDataChange = useCallback(
    (newData: InvoiceData) => {
      setData(newData);
      // Auto-save sender info whenever it changes
      if (
        newData.sender.name !== savedSender.name ||
        newData.sender.email !== savedSender.email ||
        newData.sender.phone !== savedSender.phone ||
        newData.sender.address !== savedSender.address ||
        newData.sender.logo !== savedSender.logo
      ) {
        setSavedSender(newData.sender);
      }
    },
    [savedSender, setSavedSender]
  );

  const handleSaveAccount = useCallback(
    (account: PaymentAccount) => {
      setSavedAccounts((prev) => {
        const existing = prev.findIndex((a) => a.id === account.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = account;
          return updated;
        }
        return [...prev, account];
      });
    },
    [setSavedAccounts]
  );

  const handleDeleteAccount = useCallback(
    (id: string) => {
      setSavedAccounts((prev) => prev.filter((a) => a.id !== id));
    },
    [setSavedAccounts]
  );

  const handleSaveClient = useCallback(
    (client: SavedClient) => {
      setSavedClients((prev) => {
        const existing = prev.findIndex((c) => c.id === client.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = client;
          return updated;
        }
        return [...prev, client];
      });
    },
    [setSavedClients]
  );

  const handleDeleteClient = useCallback(
    (id: string) => {
      setSavedClients((prev) => prev.filter((c) => c.id !== id));
    },
    [setSavedClients]
  );

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    setIsDownloading(true);
    try {
      const filename = `${data.invoiceNumber || 'invoice'}.pdf`;
      await downloadPDF(previewRef.current, filename);
    } catch (err) {
      console.error('PDF download failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-navy-900">
              Invoice Generator
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile preview toggle */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="lg:hidden rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {showPreview ? '✏️ Edit' : '👁 Preview'}
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="rounded-lg bg-navy-800 hover:bg-navy-900 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              {isDownloading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Form Panel */}
          <div
            className={`w-full lg:w-[420px] xl:w-[460px] shrink-0 ${
              showPreview ? 'hidden lg:block' : ''
            }`}
          >
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 lg:sticky lg:top-[73px] lg:max-h-[calc(100vh-97px)] lg:overflow-y-auto">
              <InvoiceForm
                data={data}
                onChange={handleDataChange}
                savedAccounts={savedAccounts}
                onSaveAccount={handleSaveAccount}
                onDeleteAccount={handleDeleteAccount}
                savedClients={savedClients}
                onSaveClient={handleSaveClient}
                onDeleteClient={handleDeleteClient}
              />
            </div>
          </div>

          {/* Preview Panel */}
          <div
            className={`flex-1 min-w-0 ${
              !showPreview ? 'hidden lg:block' : ''
            }`}
          >
            <div className="bg-slate-200/50 rounded-xl p-6 flex justify-center">
              <div className="shadow-xl rounded-sm overflow-hidden" style={{ maxWidth: '210mm' }}>
                <InvoicePreview ref={previewRef} data={data} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
