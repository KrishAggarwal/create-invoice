import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { FileCheck2, ArrowRight, Plus, Sparkles, CheckCircle2 } from 'lucide-react';

interface DownloadSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceNumber: string;
  isAuthenticated?: boolean;
  onViewInvoices: () => void;
  onCreateNew: () => void;
}

export const DownloadSuccessModal: React.FC<DownloadSuccessModalProps> = ({
  isOpen,
  onClose,
  invoiceNumber,
  isAuthenticated,
  onViewInvoices,
  onCreateNew,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:w-[460px] max-w-md p-6 text-center">
        {/* Engaging Success Illustration */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-xs relative my-2">
          <FileCheck2 className="w-8 h-8 text-emerald-600" />
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>

        <DialogHeader className="space-y-1.5 text-center sm:text-center">
          <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 flex items-center justify-center gap-1.5">
            {isAuthenticated ? 'Invoice Ready & Saved!' : 'Invoice Downloaded!'} <Sparkles className="w-4 h-4 text-amber-500" />
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 max-w-sm mx-auto">
            {isAuthenticated ? (
              <>
                Invoice <span className="font-semibold text-slate-800 font-mono">{invoiceNumber}</span> has been downloaded as a PDF and securely saved to your account.
              </>
            ) : (
              <>
                Invoice <span className="font-semibold text-slate-800 font-mono">{invoiceNumber}</span> has been downloaded as a PDF. Create a free account to track payments and client history.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Action Buttons */}
        <div className="space-y-2 mt-4 pt-2 border-t border-slate-100">
          <Button
            type="button"
            onClick={() => {
              onClose();
              onViewInvoices();
            }}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold"
            size="lg"
          >
            {isAuthenticated ? 'View All Invoices' : 'Sign In or Create Account'} <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onClose();
              onCreateNew();
            }}
            className="w-full border-slate-200 hover:bg-slate-50 text-slate-700"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Create Another Invoice
          </Button>

          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors pt-1"
          >
            Continue editing this invoice
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

