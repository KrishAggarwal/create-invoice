import * as React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  min?: string; // YYYY-MM-DD
  placeholder?: string;
  className?: string;
  error?: boolean | string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  min,
  placeholder = 'Select date',
  className,
  error,
  disabled,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Parse current selected date or fallback in UTC
  const selectedDate = React.useMemo(() => {
    if (!value) return null;
    const parts = value.split('-');
    if (parts.length === 3) {
      return new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
    }
    return null;
  }, [value]);

  const [viewYear, setViewYear] = React.useState<number>(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) return Number(parts[0]);
    }
    return new Date().getUTCFullYear();
  });

  const [viewMonth, setViewMonth] = React.useState<number>(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) return Number(parts[1]) - 1;
    }
    return new Date().getUTCMonth();
  });

  // When value changes externally and popover opens, sync view
  React.useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getUTCFullYear());
      setViewMonth(selectedDate.getUTCMonth());
    }
  }, [selectedDate]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Navigate months
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Generate days for grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handleSelectDay = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const dateStr = `${viewYear}-${m}-${d}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const formatDisplay = (d: Date | null) => {
    if (!d) return placeholder;
    return d.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-lg border bg-white px-3 py-1.5 text-xs text-slate-800 transition-colors shadow-2xs focus:outline-none focus:ring-1 cursor-pointer',
            error
              ? 'border-rose-500 bg-rose-50/20 text-rose-950 focus:ring-rose-200'
              : 'border-slate-200 hover:bg-slate-50 focus:border-slate-800 focus:ring-slate-200',
            !value && 'text-slate-400 font-normal',
            className
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{formatDisplay(selectedDate)}</span>
          </span>
          {value && !disabled && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-0.5 hover:text-rose-600 rounded text-slate-400"
              title="Clear date"
            >
              <X className="w-3 h-3" />
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-3 shadow-xl" align="start">
        {/* Header Month / Year Navigation */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-900">
            {months[viewMonth]} {viewYear}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {daysOfWeek.map((day) => (
            <span key={day} className="text-[10px] font-semibold text-slate-400 py-0.5">
              {day}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Blank offset days */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-7 w-7" />
          ))}

          {/* Days in Month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isSelected =
              selectedDate &&
              selectedDate.getFullYear() === viewYear &&
              selectedDate.getMonth() === viewMonth &&
              selectedDate.getDate() === day;

            const mStr = String(viewMonth + 1).padStart(2, '0');
            const dStr = String(day).padStart(2, '0');
            const thisDateStr = `${viewYear}-${mStr}-${dStr}`;
            const isDisabled = min && thisDateStr < min;

            return (
              <button
                key={day}
                type="button"
                disabled={Boolean(isDisabled)}
                onClick={() => handleSelectDay(day)}
                className={cn(
                  'h-7 w-7 rounded-lg text-xs font-medium flex items-center justify-center transition-all cursor-pointer',
                  isSelected
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : isDisabled
                    ? 'text-slate-300 cursor-not-allowed hover:bg-transparent'
                    : 'text-slate-700 hover:bg-slate-100'
                )}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Quick Actions (Today / Clear) */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              const m = String(now.getMonth() + 1).padStart(2, '0');
              const d = String(now.getDate()).padStart(2, '0');
              onChange(`${now.getFullYear()}-${m}-${d}`);
              setIsOpen(false);
            }}
            className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
          >
            Today
          </button>
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="text-rose-500 hover:text-rose-700 font-medium cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default DatePicker;
