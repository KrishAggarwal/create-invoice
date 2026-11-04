import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { resetInvoice, loadInvoice } from '../../store/slices/invoiceSlice';
import { api } from '../../services/api';
import { formatCurrencyAmount } from '../../data/currencies';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  Search,
  Trash2,
  ChevronRight,
} from 'lucide-react';

export const InvoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const workspace = useAppSelector((state) => state.auth.workspace);

  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const data = await api.invoices.getAll({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined,
      });
      setInvoices(data);
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvoices();
  };

  const handleDelete = async (uuid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await api.invoices.delete(uuid);
      setInvoices((prev) => prev.filter((i) => i.uuid !== uuid));
    } catch (err) {
      alert('Failed to delete invoice');
    }
  };

  const handleCreateNew = () => {
    dispatch(resetInvoice({ workspace }));
    navigate('/');
  };

  const handleOpenInvoice = (inv: any) => {
    dispatch(loadInvoice(inv.uuid));
    navigate(`/editor?id=${inv.uuid}`);
  };

  // Multi-currency metrics aggregation (no cross-currency arithmetic)
  const metricsByCurrency = useMemo(() => {
    const map = new Map<string, { billed: number; paid: number; due: number; count: number }>();
    for (const inv of invoices) {
      const curr = inv.currency || 'USD';
      const existing = map.get(curr) || { billed: 0, paid: 0, due: 0, count: 0 };
      existing.billed += Number(inv.totalAmount) || 0;
      existing.paid += Number(inv.amountPaid) || 0;
      existing.due += Number(inv.balanceDue) || 0;
      existing.count += 1;
      map.set(curr, existing);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].count - a[1].count);
  }, [invoices]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Invoices Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage, track payment statuses, and review your issued invoices.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Create </span>New Invoice
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Billed
          </div>
          <div className="mt-1 space-y-1">
            {metricsByCurrency.length === 0 ? (
              <div className="text-xl font-black text-slate-900">$0.00</div>
            ) : (
              metricsByCurrency.map(([curr, m]) => (
                <div key={curr} className="text-xl font-black text-slate-900">
                  {formatCurrencyAmount(m.billed, curr)}
                </div>
              ))
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across {invoices.length} invoices
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Collected
          </div>
          <div className="mt-1 space-y-1">
            {metricsByCurrency.length === 0 ? (
              <div className="text-xl font-black text-emerald-700">$0.00</div>
            ) : (
              metricsByCurrency.map(([curr, m]) => (
                <div key={curr} className="text-xl font-black text-emerald-700">
                  {formatCurrencyAmount(m.paid, curr)}
                </div>
              ))
            )}
          </div>
          <div className="text-[11px] text-emerald-600/80 mt-1">
            Fully or partially received
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Outstanding Due
          </div>
          <div className="mt-1 space-y-1">
            {metricsByCurrency.length === 0 ? (
              <div className="text-xl font-black text-amber-700">$0.00</div>
            ) : (
              metricsByCurrency.map(([curr, m]) => (
                <div key={curr} className="text-xl font-black text-amber-700">
                  {formatCurrencyAmount(m.due, curr)}
                </div>
              ))
            )}
          </div>
          <div className="text-[11px] text-amber-600/80 mt-1">
            Awaiting client remittance
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice # or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-9 pr-3.5 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-800"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Status:</span>
          <div className="w-full sm:w-44">
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
              <SelectTrigger className="h-9 w-full rounded-xl text-xs">
                <SelectValue placeholder="All Invoices" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">All Invoices</SelectItem>
                <SelectItem value="due">Due / Unpaid</SelectItem>
                <SelectItem value="partially_paid">Partially Paid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400 animate-pulse">
            Loading invoices directory...
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-xs font-semibold text-slate-700">No invoices found</div>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Draft an invoice in the editor and download or save progress to see it here.
            </p>
            <button
              type="button"
              onClick={handleCreateNew}
              className="rounded-xl bg-slate-900 text-white text-xs font-semibold px-4 py-2 inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" /> Draft First Invoice
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {invoices.map((inv) => {
              const clientName = inv.client?.name || inv.clientSnapshot?.name || 'Unnamed Client';
              const companyName = inv.client?.companyName || inv.clientSnapshot?.companyName;

              return (
                <div
                  key={inv.uuid}
                  onClick={() => handleOpenInvoice(inv)}
                  className="p-4 sm:px-6 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-slate-900 text-slate-600 group-hover:text-emerald-400 flex items-center justify-center shrink-0 transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          {inv.invoiceNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            inv.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inv.status === 'partially_paid'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inv.status?.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 mt-0.5">
                        {companyName ? `${companyName} (${clientName})` : clientName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs font-black text-slate-900">
                        {formatCurrencyAmount(inv.totalAmount, inv.currency || 'USD')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {new Date(inv.invoiceDate).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleDelete(inv.uuid, e)}
                        title="Delete Invoice"
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicesPage;
