import React from 'react';
import type { InvoiceData } from '../../../types/invoice';
import CurrencySelector from '../../CurrencySelector/CurrencySelector';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { DatePicker } from '../../ui/date-picker';

interface GeneralSectionProps {
  data: InvoiceData;
  onChange: (partial: Partial<InvoiceData>) => void;
}

export const GeneralSection: React.FC<GeneralSectionProps> = React.memo(({ data, onChange }) => {
  return (
    <div className="space-y-4">

      {/* Invoice Purpose Toggle: Due vs Paid Receipt */}
      <div>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden p-0.5 bg-slate-100">
          <button
            type="button"
            onClick={() => onChange({ type: 'due' })}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              data.type === 'due'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Payment Due
          </button>
          <button
            type="button"
            onClick={() => onChange({ type: 'paid' })}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              data.type === 'paid'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Payment Receipt
          </button>
        </div>
      </div>

      {/* Billing Mode: Fixed vs Hourly */}
      <div>
        <Label className="mb-1.5 block">Billing Mode</Label>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden p-0.5 bg-slate-100">
          <button
            type="button"
            onClick={() => onChange({ billingMode: 'fixed' })}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              data.billingMode === 'fixed'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fixed Project / Milestone
          </button>
          <button
            type="button"
            onClick={() => onChange({ billingMode: 'hourly' })}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              data.billingMode === 'hourly'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hourly Consulting
          </button>
        </div>
      </div>

      {/* Currency Selector */}
      <div>
        <Label className="mb-1.5 block">Currency</Label>
        <CurrencySelector
          value={data.currency}
          onChange={(code) => onChange({ currency: code })}
        />
      </div>

      {/* Invoice Number & Date */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="invoice-number">Invoice Number</Label>
          <Input
            id="invoice-number"
            type="text"
            value={data.invoiceNumber}
            onChange={(e) => onChange({ invoiceNumber: e.target.value })}
            placeholder="INV-001"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="invoice-date">Invoice Date</Label>
          <DatePicker
            value={data.invoiceDate}
            onChange={(date) => onChange({ invoiceDate: date })}
          />
        </div>
      </div>

      {/* Service Period Date Range (Dual UTC pickers) */}
      <div className="space-y-1.5">
        <Label>Service Period (optional)</Label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="block text-[10px] text-slate-500 mb-1">Start Date</span>
            <DatePicker
              value={data.servicePeriodStart || ''}
              onChange={(date) => onChange({ servicePeriodStart: date })}
              placeholder="Start date"
            />
          </div>
          <div>
            <span className="block text-[10px] text-slate-500 mb-1">End Date</span>
            <DatePicker
              min={data.servicePeriodStart || undefined}
              value={data.servicePeriodEnd || ''}
              onChange={(date) => onChange({ servicePeriodEnd: date })}
              placeholder="End date"
            />
          </div>
        </div>
      </div>

      {/* Due Date or Paid Date */}
      <div className="space-y-1">
        {data.type === 'due' ? (
          <>
            <Label htmlFor="payment-due-date">Payment Due Date</Label>
            <DatePicker
              value={data.dueDate || data.paymentDue?.dueDate || ''}
              onChange={(date) =>
                onChange({
                  dueDate: date,
                  paymentDue: {
                    dueDate: date,
                    paymentTerms: data.paymentDue?.paymentTerms || 'Net 15',
                    account: data.paymentDue?.account || ({} as any),
                  },
                })
              }
              placeholder="Payment due date"
            />
          </>
        ) : (
          <>
            <Label htmlFor="payment-paid-date">Payment Received Date</Label>
            <DatePicker
              value={data.paymentPaid?.paymentDate || data.invoiceDate || ''}
              onChange={(date) =>
                onChange({
                  paymentPaid: {
                    paymentDate: date,
                    paymentMethod: data.paymentPaid?.paymentMethod || '',
                    transactionId: data.paymentPaid?.transactionId || '',
                  },
                })
              }
              placeholder="Payment received date"
            />
          </>
        )}
      </div>
    </div>
  );
});

GeneralSection.displayName = 'GeneralSection';

