import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean | string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        aria-invalid={Boolean(error)}
        className={cn(
          'flex h-9 w-full rounded-lg border bg-white px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          error
            ? 'border-rose-500 text-rose-950 bg-rose-50/20 focus-visible:border-rose-600 focus-visible:ring-rose-200'
            : 'border-slate-200 focus-visible:border-slate-800 focus-visible:ring-slate-200',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  error,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label className="block text-[11px] font-semibold text-slate-700">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-[11px] font-medium text-rose-500 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
          {error}
        </p>
      )}
    </div>
  );
}

export { Input };
