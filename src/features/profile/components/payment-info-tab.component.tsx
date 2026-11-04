import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../../store';
import { loadDirectory } from '../../../store/slices/directorySlice';
import { api } from '../../../services/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  CreditCard,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Smartphone,
  Globe,
  Edit2,
  Check,
  X,
} from 'lucide-react';

interface PaymentAccountRecord {
  uuid: string;
  label: string;
  type: 'bank' | 'wire' | 'upi' | 'wise' | 'paypal';
  bankName?: string;
  accountNumber?: string;
  routingOrIfsc?: string;
  upiId?: string;
  swiftBic?: string;
  isDefault: boolean;
}

export const PaymentInfoTabComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const [accounts, setAccounts] = useState<PaymentAccountRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal / Form state for Add / Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccountUuid, setEditingAccountUuid] = useState<string | null>(null);

  const [label, setLabel] = useState('');
  const [type, setType] = useState<'bank' | 'wire' | 'upi' | 'wise' | 'paypal'>('bank');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingOrIfsc, setRoutingOrIfsc] = useState('');
  const [upiId, setUpiId] = useState('');
  const [swiftBic, setSwiftBic] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const data = await api.accounts.getAll();
      setAccounts(data);
      dispatch(loadDirectory()); // Refresh Redux state
    } catch (err: any) {
      console.error('Failed to load payment accounts:', err);
      setErrorMsg('Failed to fetch payment accounts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const resetForm = () => {
    setEditingAccountUuid(null);
    setLabel('');
    setType('bank');
    setBankName('');
    setAccountNumber('');
    setRoutingOrIfsc('');
    setUpiId('');
    setSwiftBic('');
    setIsDefault(false);
    setIsFormOpen(false);
    setEditingAccountUuid(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (acc: PaymentAccountRecord) => {
    setEditingAccountUuid(acc.uuid);
    setLabel(acc.label || '');
    setType(acc.type || 'bank');
    setBankName(acc.bankName || '');
    setAccountNumber(acc.accountNumber || '');
    setRoutingOrIfsc(acc.routingOrIfsc || '');
    setUpiId(acc.upiId || '');
    setSwiftBic(acc.swiftBic || '');
    setIsDefault(Boolean(acc.isDefault));
    setIsFormOpen(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      setErrorMsg('Please specify an account label.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = {
      label: label.trim(),
      type,
      bankName: bankName.trim() || undefined,
      accountNumber: accountNumber.trim() || undefined,
      routingOrIfsc: routingOrIfsc.trim() || undefined,
      upiId: upiId.trim() || undefined,
      swiftBic: swiftBic.trim() || undefined,
      isDefault,
    };

    try {
      if (editingAccountUuid) {
        await api.accounts.update(editingAccountUuid, payload);
        setSuccessMsg('Payment account updated successfully.');
      } else {
        await api.accounts.create(payload);
        setSuccessMsg('New payment account registered.');
      }
      resetForm();
      await fetchAccounts();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save payment account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (acc: PaymentAccountRecord) => {
    try {
      await api.accounts.update(acc.uuid, { ...acc, isDefault: true });
      await fetchAccounts();
      setSuccessMsg(`"${acc.label}" is now your default payment account.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update default account.');
    }
  };

  const handleDelete = async (uuid: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from your payment methods?`)) {
      return;
    }

    try {
      await api.accounts.delete(uuid);
      await fetchAccounts();
      setSuccessMsg(`"${name}" removed successfully.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to delete payment account.');
    }
  };

  const getTypeIcon = (t: string) => {
    switch (t) {
      case 'upi':
        return <Smartphone className="w-4 h-4 text-emerald-600" />;
      case 'wise':
      case 'wire':
        return <Globe className="w-4 h-4 text-indigo-600" />;
      default:
        return <Building2 className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alerts */}
      {successMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <CreditCard className="w-4 h-4 text-slate-500" />
              Remittance Profiles & Bank Accounts
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configure how clients pay you. Saved accounts appear in the invoice editor picker.
            </p>
          </div>

          {!isFormOpen && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              Add Payment Account
            </button>
          )}
        </div>

        {/* Add / Edit Form Card */}
        {isFormOpen && (
          <form
            onSubmit={handleSaveAccount}
            className="rounded-2xl border border-indigo-200 bg-indigo-50/30 p-5 space-y-4 animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
              <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                {editingAccountUuid ? 'Edit Payment Account' : 'Register New Payment Account'}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Account Label / Nickname *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Primary USD Wire, Domestic Checking, UPI"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Rail / Type
                </label>
                <Select value={type} onValueChange={(val) => setType(val as any)}>
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Domestic Bank Transfer (ACH / NEFT)</SelectItem>
                    <SelectItem value="wire">International Wire Transfer</SelectItem>
                    <SelectItem value="upi">UPI (Instant Payment)</SelectItem>
                    <SelectItem value="wise">Wise Multi-Currency</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bank / Institution Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chase Bank, Wise Europe, HDFC"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Account / IBAN Number
                </label>
                <input
                  type="text"
                  placeholder="Account number or IBAN"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-slate-800 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Routing / IFSC / Sort Code
                </label>
                <input
                  type="text"
                  placeholder="Routing number or IFSC"
                  value={routingOrIfsc}
                  onChange={(e) => setRoutingOrIfsc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  UPI ID / Payment Handle (optional)
                </label>
                <input
                  type="text"
                  placeholder="handle@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-slate-800 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SWIFT / BIC Code (for cross-border wires)
              </label>
              <input
                type="text"
                placeholder="e.g. CHASUS33"
                value={swiftBic}
                onChange={(e) => setSwiftBic(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-slate-800 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isDefaultAccount"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <label
                htmlFor="isDefaultAccount"
                className="text-xs text-slate-700 font-medium cursor-pointer"
              >
                Set as default payment method for new invoices
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-4 py-2 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-2 transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                {isSubmitting ? 'Saving...' : editingAccountUuid ? 'Update Account' : 'Save Account'}
              </button>
            </div>
          </form>
        )}

        {/* Existing Accounts List */}
        {isLoading ? (
          <div className="py-10 text-center text-xs text-slate-400 animate-pulse">
            Loading payment accounts...
          </div>
        ) : accounts.length === 0 ? (
          <div className="py-10 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 space-y-2">
            <CreditCard className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-xs font-semibold text-slate-600">
              No payment accounts registered yet
            </div>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Add your bank details or UPI ID. Any account you add will automatically populate when drafting invoices.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((acc) => (
              <div
                key={acc.uuid}
                className={`rounded-2xl border p-4.5 transition-all shadow-2xs relative flex flex-col justify-between ${
                  acc.isDefault
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                        {getTypeIcon(acc.type)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{acc.label}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                          {acc.type}
                        </div>
                      </div>
                    </div>

                    {acc.isDefault && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Check className="w-3 h-3" /> Default
                      </span>
                    )}
                  </div>

                  <div className="mt-3.5 space-y-1.5 text-xs text-slate-600">
                    {acc.bankName && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">Bank:</span>
                        <span className="font-semibold text-slate-800">{acc.bankName}</span>
                      </div>
                    )}
                    {acc.accountNumber && (
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-slate-400 text-[11px]">Account #:</span>
                        <span className="font-medium text-slate-800">{acc.accountNumber}</span>
                      </div>
                    )}
                    {acc.routingOrIfsc && (
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-slate-400 text-[11px]">Routing/IFSC:</span>
                        <span className="font-medium text-slate-800">{acc.routingOrIfsc}</span>
                      </div>
                    )}
                    {acc.upiId && (
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-slate-400 text-[11px]">UPI Handle:</span>
                        <span className="font-medium text-slate-800 text-emerald-700">
                          {acc.upiId}
                        </span>
                      </div>
                    )}
                    {acc.swiftBic && (
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-slate-400 text-[11px]">SWIFT / BIC:</span>
                        <span className="font-medium text-slate-800">{acc.swiftBic}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    {!acc.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(acc)}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(acc)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Edit Account"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(acc.uuid, acc.label)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

