import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { setEditorTab, setShowMobilePreview, setPreviewMode } from '../../store/slices/uiSlice';
import {
  updateInvoice,
  updateDesign,
  setTemplate,
  resetInvoice,
  saveInvoice,
  loadInvoice,
  clearSaveMessage,
} from '../../store/slices/invoiceSlice';
import { loadDirectory } from '../../store/slices/directorySlice';
import { selectClients, selectAccounts } from '../../store/selectors/directorySelectors';
import { downloadPDF } from '../../utils/pdf';
import InvoiceForm from '../../components/InvoiceForm/InvoiceForm';
import { PreviewCanvas } from '../../components/InvoicePreview/PreviewCanvas';
import DesignSettingsPanel from '../../components/DesignSidebar/DesignSettingsPanel';
import {
  FileText,
  Sliders,
  Download,
  Save,
  CheckCircle,
  Eye,
  PenLine,
  Sparkles,
  Plus,
} from 'lucide-react';

export const EditorPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const invoiceId = searchParams.get('id');

  // Direct Redux state access - Single source of truth
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const workspace = useAppSelector((state) => state.auth.workspace);
  const invoice = useAppSelector((state) => state.invoice.current);
  const isSaving = useAppSelector((state) => state.invoice.isSaving);
  const saveMessage = useAppSelector((state) => state.invoice.saveMessage);
  const clients = useAppSelector(selectClients);
  const accounts = useAppSelector(selectAccounts);
  const editorTab = useAppSelector((state) => state.ui.editorTab);
  const showMobilePreview = useAppSelector((state) => state.ui.showMobilePreview);
  const previewMode = useAppSelector((state) => state.ui.previewMode);

  const [isDownloading, setIsDownloading] = useState(false);
  
  // Ref stays in presentation layer (component concern, not state concern)
  const previewRef = useRef<HTMLDivElement | null>(null);

  // Load directory data on mount
  useEffect(() => {
    dispatch(loadDirectory());
  }, [dispatch]);

  // Load invoice from URL
  useEffect(() => {
    if (invoiceId && invoiceId !== invoice.uuid) {
      dispatch(loadInvoice(invoiceId)).unwrap().catch((err) => {
        console.error('Failed to load invoice:', err);
        setSearchParams({}, { replace: true });
        dispatch(resetInvoice({ workspace }));
      });
    } else if (!invoiceId && invoice.uuid) {
      // URL cleared but still showing saved invoice - reset
      dispatch(resetInvoice({ workspace }));
    }
  }, [invoiceId, invoice.uuid, dispatch, workspace, setSearchParams]);

  // Clear save message after 3 seconds
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => dispatch(clearSaveMessage()), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage, dispatch]);

  const handleDownload = async () => {
    if (previewMode === 'sample') {
      dispatch(setPreviewMode('real'));
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!previewRef.current) {
      console.error('Preview ref not available');
      return;
    }
    setIsDownloading(true);
    try {
      const filename = `${invoice.invoiceNumber || 'Invoice'}.pdf`;
      await downloadPDF(previewRef.current, filename, invoice.design?.paperFormat);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      alert('Must be authenticated to save');
      return;
    }
    try {
      const result = await dispatch(saveInvoice()).unwrap();
      if (result.uuid && !searchParams.get('id')) {
        setSearchParams({ id: result.uuid }, { replace: true });
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to save invoice');
    }
  };

  const handleNewInvoice = () => {
    dispatch(resetInvoice({ workspace }));
    if (searchParams.get('id')) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="w-full h-[calc(100vh-3.5rem)] flex flex-row overflow-hidden bg-slate-100 p-1.5 sm:p-2 md:p-2.5 gap-1.5 sm:gap-2 md:gap-2.5">
      
      {/* ── 1. Floating Vertical Sidenav Dock (Fixed Width, Full Height) ── */}
      <aside
        aria-label="Editor Navigation"
        className="w-14 sm:w-16 shrink-0 h-full bg-white rounded-2xl shadow-2xs flex flex-col items-center py-3 gap-2 z-20 select-none"
      >
        {/* New Blank Invoice Action */}
        <button
          type="button"
          onClick={handleNewInvoice}
          className="flex flex-col items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl transition-all cursor-pointer text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-dashed border-slate-200 hover:border-slate-300 group shadow-2xs"
          title="Start fresh blank invoice"
        >
          <Plus className="w-4 h-4 mb-0.5 text-slate-500 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] leading-none font-semibold">New</span>
        </button>

        <div className="w-8 h-px bg-slate-200/80 my-0.5" />

        {/* Invoice Form Tab Button */}
        <button
          type="button"
          onClick={() => {
            dispatch(setEditorTab('invoice'));
            dispatch(setShowMobilePreview(false));
          }}
          className={`flex flex-col items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl transition-all cursor-pointer ${
            editorTab === 'invoice' && !showMobilePreview
              ? 'bg-slate-900 text-white shadow-xs font-bold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Invoice Details"
        >
          <FileText className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] leading-none">Invoice</span>
        </button>

        {/* Design Settings Tab Button */}
        <button
          type="button"
          onClick={() => {
            dispatch(setEditorTab('design'));
            dispatch(setShowMobilePreview(false));
          }}
          className={`flex flex-col items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl transition-all cursor-pointer ${
            editorTab === 'design' && !showMobilePreview
              ? 'bg-slate-900 text-white shadow-xs font-bold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Design & Settings"
        >
          <Sliders className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] leading-none">Design</span>
        </button>

        {/* Mobile View Toggle Icon (< md screens only) */}
        <div className="md:hidden mt-auto pt-2 border-t border-slate-200 w-full flex flex-col items-center">
          <button
            type="button"
            onClick={() => dispatch(setShowMobilePreview(!showMobilePreview))}
            className={`flex flex-col items-center justify-center w-11 h-11 rounded-xl transition-all cursor-pointer ${
              showMobilePreview
                ? 'bg-slate-900 text-white shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title={showMobilePreview ? 'Back to Form' : 'View Preview'}
          >
            {showMobilePreview ? <PenLine className="w-4 h-4 mb-0.5" /> : <Eye className="w-4 h-4 mb-0.5" />}
            <span className="text-[9px] leading-none">{showMobilePreview ? 'Form' : 'Preview'}</span>
          </button>
        </div>
      </aside>

      {/* ── 2. Floating Form Panel (Reduced Width on md+, Independent overflow-y-auto) ── */}
      <section
        aria-label="Invoice Information Section"
        className={`w-full md:w-96 lg:w-[28rem] shrink-0 h-full shadow-2xs overflow-y-auto no-scrollbar rounded-2xl ${
          showMobilePreview ? 'hidden md:block' : 'block'
        }`}
      >
        {editorTab === 'invoice' ? (
          <InvoiceForm
            data={invoice}
            onChange={(updates) => dispatch(updateInvoice(updates))}
            savedAccounts={accounts}
            savedClients={clients}
          />
        ) : (
          <DesignSettingsPanel
            design={invoice.design}
            template={invoice.template}
            onDesignChange={(design) => dispatch(updateDesign(design))}
            onTemplateChange={(template) => dispatch(setTemplate(template))}
          />
        )}
      </section>

      {/* ── 3. Floating Preview Panel (Expanded Width on md+, Independent Viewport) ── */}
      <section
        aria-label="Document Preview Section"
        className={`flex-1 h-full min-w-0 flex flex-col overflow-hidden ${
          showMobilePreview ? 'flex' : 'hidden md:flex'
        }`}
      >
        {/* Action Bar Above Preview Canvas */}
        <div className="flex items-center justify-between pb-2 gap-2 shrink-0 min-h-[38px] w-full overflow-x-auto no-scrollbar">
          {/* Left: New Invoice + Preview Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleNewInvoice}
              className="h-8 px-2 sm:px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
              title="Start a fresh blank invoice"
              aria-label="New Invoice"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">New</span>
            </button>

            {/* Live Draft vs Sample Layout Segmented Switcher */}
            <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => dispatch(setPreviewMode('real'))}
                className={`px-2.5 py-1 text-xs rounded-md transition-all cursor-pointer ${
                  previewMode === 'real'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Render your live form draft"
              >
                <span className="hidden md:inline">Live </span>Draft
              </button>
              <button
                type="button"
                onClick={() => dispatch(setPreviewMode('sample'))}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-all cursor-pointer ${
                  previewMode === 'sample'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Preview fully populated sample layout"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Sample<span className="hidden md:inline"> Layout</span></span>
              </button>
            </div>

            {saveMessage && (
              <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0 animate-in fade-in">
                <CheckCircle className="w-3 h-3 text-emerald-600" /> {saveMessage}
              </span>
            )}
          </div>

          {/* Right: Save & Download Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Authenticated Save Progress Button */}
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className={`h-8 px-2 sm:px-2.5 md:px-3 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0 disabled:opacity-50 ${
                  invoice.uuid
                    ? 'border-indigo-200 bg-indigo-50/80 text-indigo-900 hover:bg-indigo-100'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                }`}
                title={invoice.uuid ? 'Save changes to database' : 'Save invoice to database'}
                aria-label={invoice.uuid ? 'Save Changes' : 'Save'}
              >
                <Save className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden md:inline">
                  {isSaving ? 'Saving...' : invoice.uuid ? 'Save Changes' : 'Save'}
                </span>
              </button>
            )}

            {/* Direct PDF Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="h-8 px-2 sm:px-2.5 md:px-3.5 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-xs cursor-pointer shrink-0"
              title="Download PDF document"
              aria-label="Download PDF"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">
                {isDownloading ? '...' : 'Download PDF'}
              </span>
            </button>
          </div>
        </div>

        {/* Live Vector Document Canvas (Expanded to fill remaining width & height) */}
        <div className="flex-1 min-h-0 w-full overflow-hidden">
          <PreviewCanvas
            data={invoice}
            previewRef={previewRef}
            previewMode={previewMode}
          />
        </div>
      </section>

    </div>
  );
};

export default EditorPage;
