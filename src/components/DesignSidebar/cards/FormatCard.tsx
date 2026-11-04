import React from 'react';
import type { DesignSettings } from '../../../types/invoice';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { FileSpreadsheet } from 'lucide-react';

interface FormatCardProps {
  design: DesignSettings;
  onChange: (partial: Partial<DesignSettings>) => void;
}

export const FormatCard: React.FC<FormatCardProps> = React.memo(({ design, onChange }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-4">
      <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
        <FileSpreadsheet className="w-4 h-4 text-slate-700" />
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Document Format & Locale
        </span>
      </div>

      {/* Paper Format (A4 vs US Letter) */}
      <div className="space-y-2">
        <Label className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
          Paper Format
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange({ paperFormat: 'a4' })}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              design.paperFormat !== 'letter'
                ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="text-xs font-bold">A4</div>
            <div
              className={`text-[10px] ${
                design.paperFormat !== 'letter' ? 'text-slate-300' : 'text-slate-400'
              }`}
            >
              210 × 297 mm (Global)
            </div>
          </button>

          <button
            type="button"
            onClick={() => onChange({ paperFormat: 'letter' })}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              design.paperFormat === 'letter'
                ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="text-xs font-bold">US Letter</div>
            <div
              className={`text-[10px] ${
                design.paperFormat === 'letter' ? 'text-slate-300' : 'text-slate-400'
              }`}
            >
              8.5 × 11 in (North America)
            </div>
          </button>
        </div>
      </div>

      {/* Date Format Selector */}
      <div className="space-y-2">
        <Label className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
          Date Display Format
        </Label>
        <Select
          value={design.dateFormat || 'medium'}
          onValueChange={(val) => onChange({ dateFormat: val as any })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select date format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="medium">Oct 15, 2026 (Month Day, Year)</SelectItem>
            <SelectItem value="eu">15/10/2026 (Day/Month/Year)</SelectItem>
            <SelectItem value="iso">2026-10-15 (YYYY-MM-DD)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});

FormatCard.displayName = 'FormatCard';

