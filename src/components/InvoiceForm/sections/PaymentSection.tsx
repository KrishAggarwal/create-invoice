import React from 'react';
import type { PaymentAccount, PaymentDueInfo, PaymentPaidInfo } from '../../../types/invoice';
import { PAYMENT_METHODS } from '../../../types/invoice';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { CreditCard, CheckCircle2 } from 'lucide-react';

interface PaymentSectionProps {
  type: 'due' | 'paid';
  paymentDue?: PaymentDueInfo;
  paymentPaid?: PaymentPaidInfo;
  invoiceDate: string;
  savedAccounts: PaymentAccount[];
  onChange: (updates: {
    paymentDue?: PaymentDueInfo;
    paymentPaid?: PaymentPaidInfo;
  }) => void;
}

export const PaymentSection: React.FC<PaymentSectionProps> = React.memo(
  ({
    type,
    paymentDue,
    paymentPaid,
    invoiceDate,
    savedAccounts,
    onChange,
  }) => {
    if (type === 'paid') {
      return (
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Payment Received Information (Receipt)
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Payment Method</Label>
              <Select
                value={paymentPaid?.paymentMethod || undefined}
                onValueChange={(val) =>
                  onChange({
                    paymentPaid: {
                      paymentDate: paymentPaid?.paymentDate || invoiceDate,
                      paymentMethod: val,
                      transactionId: paymentPaid?.transactionId || '',
                    },
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m: string) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="transaction-ref">Transaction / Reference #</Label>
              <Input
                id="transaction-ref"
                type="text"
                placeholder="Transaction or receipt reference #"
                value={paymentPaid?.transactionId || ''}
                onChange={(e) =>
                  onChange({
                    paymentPaid: {
                      paymentDate: paymentPaid?.paymentDate || invoiceDate,
                      paymentMethod: paymentPaid?.paymentMethod || '',
                      transactionId: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      );
    }

    const account: PaymentAccount = paymentDue?.account || {
      label: '',
      bankName: '',
      accountNumber: '',
      routingOrIfsc: '',
      swiftBic: '',
      upiId: '',
    };

    const updateAccount = (field: keyof PaymentAccount, value: string) => {
      onChange({
        paymentDue: {
          dueDate: paymentDue?.dueDate || '',
          paymentTerms: paymentDue?.paymentTerms || 'Net 15',
          account: {
            ...account,
            [field]: value,
          },
        },
      });
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-500" />
            Payment Remittance (How client pays you)
          </div>

          {savedAccounts.length > 0 && (
            <div className="w-52">
              <Select
                value=""
                onValueChange={(val) => {
                  const acc = savedAccounts.find((a) =>
                    a.uuid ? a.uuid === val : (a.accountNumber || a.upiId || a.label) === val
                  );
                  if (acc && paymentDue) {
                    onChange({
                      paymentDue: { ...paymentDue, account: { ...acc } },
                    });
                  }
                }}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Load saved account..." />
                </SelectTrigger>
                <SelectContent align="end">
                  {savedAccounts.map((a, idx) => {
                    const val = a.uuid || a.accountNumber || a.upiId || a.label || String(idx);
                    return (
                      <SelectItem key={a.uuid || idx} value={val}>
                        {a.label || a.bankName || a.accountNumber}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="bank-name">Bank / Institution Name</Label>
            <Input
              id="bank-name"
              type="text"
              placeholder="Bank or institution name"
              value={account.bankName || ''}
              onChange={(e) => updateAccount('bankName', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="account-num">Account / IBAN Number</Label>
            <Input
              id="account-num"
              type="text"
              placeholder="Account number or IBAN"
              value={account.accountNumber || ''}
              onChange={(e) => updateAccount('accountNumber', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="routing-code">Routing / IFSC / Sort Code</Label>
            <Input
              id="routing-code"
              type="text"
              placeholder="Routing, IFSC, or Sort Code"
              value={account.routingOrIfsc || ''}
              onChange={(e) => updateAccount('routingOrIfsc', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="upi-id">UPI ID or Payment Handle</Label>
            <Input
              id="upi-id"
              type="text"
              placeholder="UPI ID or payment handle"
              value={account.upiId || ''}
              onChange={(e) => updateAccount('upiId', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="swift-bic">SWIFT / BIC (International)</Label>
            <Input
              id="swift-bic"
              type="text"
              placeholder="SWIFT / BIC code"
              value={account.swiftBic || ''}
              onChange={(e) => updateAccount('swiftBic', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="payment-terms">Payment Terms</Label>
            <Input
              id="payment-terms"
              type="text"
              placeholder="e.g. Net 15, Due upon receipt"
              value={paymentDue?.paymentTerms || ''}
              onChange={(e) =>
                onChange({
                  paymentDue: {
                    dueDate: paymentDue?.dueDate || '',
                    paymentTerms: e.target.value,
                    account,
                  },
                })
              }
            />
          </div>
        </div>
      </div>
    );
  }
);

PaymentSection.displayName = 'PaymentSection';
