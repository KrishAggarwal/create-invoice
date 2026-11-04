import { useState, useRef, useEffect, useMemo } from 'react';
import { CURRENCIES, getCurrencyInfo, type CurrencyInfo } from '../../data/currencies';
import { Search, ChevronDown, Check } from 'lucide-react';

interface Props {
  value: string;
  onChange: (currencyCode: string) => void;
  className?: string;
}

export default function CurrencySelector({ value, onChange, className = '' }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCurrency = useMemo(() => getCurrencyInfo(value), [value]);

  const filteredCurrencies = useMemo(() => {
    if (!search.trim()) return CURRENCIES;
    const q = search.toLowerCase().trim();
    return CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }, [search]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  const handleSelect = (c: CurrencyInfo) => {
    onChange(c.code);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button - Clean Code + Name + Symbol, No Flags */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 transition-all hover:border-slate-300 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-200 cursor-pointer shadow-2xs"
      >
        <div className="flex items-center gap-1.5 truncate">
          <span className="font-bold text-slate-900 font-mono text-xs">{selectedCurrency.code}</span>
          <span className="text-slate-600 truncate">{selectedCurrency.name}</span>
          <span className="text-slate-400 font-mono text-xs">({selectedCurrency.symbol})</span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          {/* Search Input Box */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search code, name, or symbol..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
              />
            </div>
          </div>

          {/* Currency List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
            {filteredCurrencies.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No matching currencies found
              </div>
            ) : (
              filteredCurrencies.map((c) => {
                const isSelected = c.code === selectedCurrency.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-slate-50 cursor-pointer ${
                      isSelected ? 'bg-slate-50 font-semibold text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    {/* Currency Code & Name (No flag, No country name) */}
                    <div className="flex items-center gap-2.5 min-w-0 truncate">
                      <span className="font-mono text-xs font-bold text-slate-900 shrink-0">
                        {c.code}
                      </span>
                      <span className="text-slate-600 truncate">{c.name}</span>
                    </div>

                    {/* Selection Tick BEFORE Symbol with Fixed Width Alignment */}
                    <div className="flex items-center gap-2 shrink-0 ml-auto pl-3">
                      <span className="w-4 h-4 flex items-center justify-center shrink-0">
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />}
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-600 text-right shrink-0">
                        {c.symbol}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
