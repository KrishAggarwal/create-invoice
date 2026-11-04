import React from 'react';
import type { DesignSettings } from '../../../types/invoice';
import { Slider } from '../../ui/slider';
import { Label } from '../../ui/label';
import { Maximize2 } from 'lucide-react';

interface MarginsCardProps {
  design: DesignSettings;
  onChange: (partial: Partial<DesignSettings>) => void;
}

export const MarginsCard: React.FC<MarginsCardProps> = React.memo(({ design, onChange }) => {
  const currentPadding = design.paddingMm ?? 12;

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      const clamped = Math.max(4, Math.min(48, val));
      onChange({ paddingMm: clamped });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-3.5">
      <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
        <Maximize2 className="w-4 h-4 text-slate-700" />
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Document Margins & Spacing
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-xs font-semibold text-slate-800">Page Padding</Label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={4}
              max={48}
              value={currentPadding}
              onChange={handleManualChange}
              className="w-12 h-6 text-xs text-center font-mono font-bold text-slate-800 bg-slate-100 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            <span className="text-[11px] text-slate-500 font-mono">mm</span>
          </div>
        </div>

        <Slider
          min={4}
          max={48}
          step={1}
          value={[currentPadding]}
          onValueChange={(vals) => onChange({ paddingMm: vals[0] })}
        />

        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {[
            { mm: 6, label: 'Tight', sub: '6mm' },
            { mm: 12, label: 'Compact', sub: '12mm' },
            { mm: 24, label: 'Standard', sub: '24mm' },
            { mm: 36, label: 'Spacious', sub: '36mm' },
          ].map((preset) => {
            const isActive = currentPadding === preset.mm;
            return (
              <button
                key={preset.mm}
                type="button"
                onClick={() => onChange({ paddingMm: preset.mm })}
                className={`py-1.5 px-1 rounded-lg text-center border transition-all text-xs ${
                  isActive
                    ? 'border-slate-900 bg-slate-900 text-white font-bold shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <div className="text-[11px] font-medium leading-tight">{preset.label}</div>
                <div
                  className={`text-[9px] font-mono leading-tight ${
                    isActive ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  {preset.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

MarginsCard.displayName = 'MarginsCard';

