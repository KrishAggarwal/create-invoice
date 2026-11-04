import React from 'react';
import type { LineItem } from '../../../types/invoice';
import { formatCurrency } from '../../../types/invoice';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Plus, Trash2, DollarSign } from 'lucide-react';

interface LineItemsSectionProps {
  lineItems: LineItem[];
  billingMode: 'fixed' | 'hourly';
  currency: string;
  discount?: number;
  discountType?: 'percentage' | 'flat';
  taxRate?: number;
  paymentsCount: number;
  paymentsTotal: number;
  onOpenLedger: () => void;
  onChange: (updates: {
    lineItems?: LineItem[];
    discount?: number;
    discountType?: 'percentage' | 'flat';
    taxRate?: number;
  }) => void;
}

export const LineItemsSection: React.FC<LineItemsSectionProps> = React.memo(
  ({
    lineItems,
    billingMode,
    currency,
    discount,
    discountType = 'percentage',
    taxRate,
    paymentsCount,
    paymentsTotal,
    onOpenLedger,
    onChange,
  }) => {
    const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
      const items = lineItems.map((item, idx) => {
        if (idx !== index) return item;
        const updated = { ...item, [field]: value };
        if (billingMode === 'hourly') {
          const h = field === 'hours' ? Number(value) || 0 : Number(item.hours) || 0;
          const r = field === 'rate' ? Number(value) || 0 : Number(item.rate) || 0;
          if (h > 0 && r > 0) {
            updated.amount = h * r;
          }
        }
        return updated;
      });
      onChange({ lineItems: items });
    };

    const addLineItem = () => {
      onChange({
        lineItems: [
          ...lineItems,
          {
            type: billingMode,
            title: '',
            subtitle: '',
            hours: 0,
            rate: 0,
            amount: 0,
          },
        ],
      });
    };

    const removeLineItem = (index: number) => {
      if (lineItems.length <= 1) return;
      onChange({ lineItems: lineItems.filter((_, idx) => idx !== index) });
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-slate-500" />
            Deliverables & Line Items
          </div>
          <button
            type="button"
            onClick={addLineItem}
            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Add Item
          </button>
        </div>

        <div className="space-y-3">
          {lineItems.map((item, index) => (
            <div
              key={item.uuid || index}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <Input
                  type="text"
                  placeholder="Item or deliverable description"
                  className="font-semibold"
                  value={item.title}
                  onChange={(e) => updateLineItem(index, 'title', e.target.value)}
                />
                {lineItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <Textarea
                rows={2}
                placeholder="Description or specification (optional)"
                value={item.subtitle || ''}
                onChange={(e) => updateLineItem(index, 'subtitle', e.target.value)}
                className="min-h-[50px] resize-y"
              />

              {billingMode === 'hourly' ? (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <Label className="text-[10px] text-slate-500 mb-1 block">Hours</Label>
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      value={item.hours || ''}
                      onChange={(e) => updateLineItem(index, 'hours', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-slate-500 mb-1 block">
                      Hourly Rate ({currency})
                    </Label>
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      value={item.rate || ''}
                      onChange={(e) => updateLineItem(index, 'rate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-slate-500 mb-1 block">Total Amount</Label>
                    <div className="h-9 flex items-center px-3 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-900 shadow-xs">
                      {formatCurrency(item.amount, currency)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-1">
                  <Label className="text-[10px] text-slate-500 mb-1 block">
                    Amount ({currency})
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0"
                    value={item.amount || ''}
                    onChange={(e) => updateLineItem(index, 'amount', e.target.value)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Discounts & Tax */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <Label className="mb-1 block">Discount</Label>
            <div className="flex gap-1.5">
              <Input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={discount || ''}
                onChange={(e) => onChange({ discount: Number(e.target.value) || 0 })}
              />
              <div className="w-24 shrink-0">
                <Select
                  value={discountType || 'percentage'}
                  onValueChange={(val) => onChange({ discountType: val as 'percentage' | 'flat' })}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">%</SelectItem>
                    <SelectItem value="flat">Flat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <Label className="mb-1 block">Tax Rate % (optional)</Label>
            <Input
              type="number"
              min="0"
              step="any"
              placeholder="0%"
              value={taxRate || ''}
              onChange={(e) => onChange({ taxRate: Number(e.target.value) || 0 })}
            />
          </div>
        </div>

        {/* Partial Payments / Milestone Trigger */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-800">
              Milestone Deposits & Payments
            </div>
            <div className="text-[11px] text-slate-500">
              {paymentsTotal > 0
                ? `${paymentsCount} payment(s) recorded (${formatCurrency(paymentsTotal, currency)} total)`
                : 'No partial deposits recorded yet.'}
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenLedger}
            className="rounded-lg bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-xs hover:bg-slate-50 transition-colors"
          >
            Manage Deposits
          </button>
        </div>
      </div>
    );
  }
);

LineItemsSection.displayName = 'LineItemsSection';

