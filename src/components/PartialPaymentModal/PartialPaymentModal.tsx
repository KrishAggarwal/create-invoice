import { useState } from 'react';
import { type PaymentRecord, formatCurrency } from '../../types/invoice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  totalAmount: number;
  payments: PaymentRecord[];
  onAddPayment: (payment: PaymentRecord) => void;
  onDeletePayment: (index: number) => void;
}

export default function PartialPaymentModal({
  isOpen,
  onClose,
  currency,
  totalAmount,
  payments,
  onAddPayment,
  onDeletePayment,
}: Props) {
  const [amount, setAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const remainingDue = Math.max(0, totalAmount - totalPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid positive payment amount.');
      return;
    }

    onAddPayment({
      amount: numAmount,
      paymentDate,
      paymentMethod: paymentMethod.trim() || undefined,
      transactionRef: transactionRef.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setAmount('');
    setPaymentMethod('');
    setTransactionRef('');
    setNotes('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:w-[540px] max-w-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900">
            Payments & Milestone Ledger
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Record deposits, partial payments, and milestones against this invoice.
          </DialogDescription>
        </DialogHeader>

        {/* Financial Summary Pill Box */}
        <div className="grid grid-cols-3 gap-3 my-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Total Invoice</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {formatCurrency(totalAmount, currency)}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-emerald-600 uppercase tracking-wide">Total Paid</div>
            <div className="text-sm font-bold text-emerald-600 mt-0.5">
              {formatCurrency(totalPaid, currency)}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-amber-600 uppercase tracking-wide">Balance Due</div>
            <div className="text-sm font-bold text-amber-700 mt-0.5">
              {formatCurrency(remainingDue, currency)}
            </div>
          </div>
        </div>

        {/* Record New Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-3 p-3.5 rounded-xl border border-slate-200/80 bg-white">
          <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            Record Payment / Deposit
          </div>

          {errorMessage && (
            <div className="p-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px]">Amount ({currency})</Label>
              <Input
                type="number"
                step="any"
                min="0.01"
                placeholder="e.g. 1500"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">Payment Date</Label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px]">Payment Method</Label>
              <Select
                value={paymentMethod || undefined}
                onValueChange={(val) => setPaymentMethod(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Wise">Wise</SelectItem>
                  <SelectItem value="Wire Transfer">Wire Transfer / Bank</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                  <SelectItem value="Stripe">Stripe</SelectItem>
                  <SelectItem value="Crypto">Crypto (USDC / USDT / BTC)</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">Reference / TXN ID (optional)</Label>
              <Input
                type="text"
                placeholder="e.g. #TXN-90213"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px]">Notes (optional)</Label>
            <Input
              type="text"
              placeholder="e.g. Upfront 50% deposit for Phase 1 delivery"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-1">
            <Button type="submit" size="sm" className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Add Payment Record
            </Button>
          </div>
        </form>

        {/* Existing Payment Ledger */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Payment History ({payments.length})
          </div>
          {payments.length === 0 ? (
            <div className="py-3 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              No payments or deposits recorded yet.
            </div>
          ) : (
            <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200">
              {payments.map((p, index) => (
                <div key={p.uuid || index} className="flex items-center justify-between p-2.5 text-xs hover:bg-slate-50">
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <span className="text-emerald-700">{formatCurrency(p.amount, currency)}</span>
                      {p.paymentMethod && (
                        <>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-600">{p.paymentMethod}</span>
                        </>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap gap-2">
                      <span>{p.paymentDate}</span>
                      {p.transactionRef && <span>Ref: {p.transactionRef}</span>}
                      {p.notes && <span className="italic">"{p.notes}"</span>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeletePayment(index)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Remove payment record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-2 pt-2 border-t border-slate-100 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
