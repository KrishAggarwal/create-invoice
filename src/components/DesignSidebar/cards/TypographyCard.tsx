import React from 'react';
import type { DesignSettings } from '../../../types/invoice';
import { Slider } from '../../ui/slider';
import { Label } from '../../ui/label';
import { Type, Check } from 'lucide-react';

interface TypographyCardProps {
  design: DesignSettings;
  onChange: (partial: Partial<DesignSettings>) => void;
}

export const TypographyCard: React.FC<TypographyCardProps> = React.memo(({ design, onChange }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-4">
      <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
        <Type className="w-4 h-4 text-slate-700" />
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Typography & Fonts
        </span>
      </div>

      {/* Font Family Selection */}
      <div className="space-y-2">
        <Label className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
          Font Family
        </Label>
        <div className="grid grid-cols-1 gap-2">
          {[
            { id: 'sans', name: 'Inter Sans', sample: 'Modern tech & clean readability' },
            { id: 'serif', name: 'Georgia Serif', sample: 'Formal, traditional corporate print' },
            { id: 'mono', name: 'Monospace', sample: 'Developer tabular monospace font' },
          ].map((f) => {
            const isSelected = design.fontFamily === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onChange({ fontFamily: f.id as any })}
                className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white font-bold shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div>
                  <div className="font-semibold text-xs">{f.name}</div>
                  <div
                    className={`text-[11px] font-normal mt-0.5 ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {f.sample}
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Typography Scale Slider */}
      <div className="space-y-2.5 pt-1">
        <div className="flex justify-between items-center">
          <Label className="text-xs font-semibold text-slate-800">Typography Scale</Label>
          <span className="text-xs font-mono text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded">
            {design.fontSizePt}pt
          </span>
        </div>
        <Slider
          min={11}
          max={15}
          step={1}
          value={[design.fontSizePt]}
          onValueChange={(vals) => onChange({ fontSizePt: vals[0] })}
        />
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>11pt (Compact)</span>
          <span>13pt (Standard)</span>
          <span>15pt (Large)</span>
        </div>
      </div>
    </div>
  );
});

TypographyCard.displayName = 'TypographyCard';

