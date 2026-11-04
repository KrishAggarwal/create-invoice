import React from 'react';
import type { DesignSettings } from '../../../types/invoice';
import { Palette, Check } from 'lucide-react';
import { Input } from '../../ui/input';

interface BrandingCardProps {
  design: DesignSettings;
  onChange: (partial: Partial<DesignSettings>) => void;
}

const ACCENT_COLORS = [
  { hex: '#0f172a', name: 'Slate' },
  { hex: '#059669', name: 'Emerald' },
  { hex: '#2563eb', name: 'Blue' },
  { hex: '#4f46e5', name: 'Indigo' },
  { hex: '#e11d48', name: 'Crimson' },
  { hex: '#d97706', name: 'Amber' },
  { hex: '#7c3aed', name: 'Purple' },
];

export const BrandingCard: React.FC<BrandingCardProps> = React.memo(({ design, onChange }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-3.5">
      <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
        <Palette className="w-4 h-4 text-slate-700" />
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Brand Accent Color
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          {ACCENT_COLORS.map((c) => {
            const isSelected = design.accentColor === c.hex;
            return (
              <button
                key={c.hex}
                type="button"
                onClick={() => onChange({ accentColor: c.hex })}
                style={{ backgroundColor: c.hex }}
                className={`w-8 h-8 rounded-full transition-transform flex items-center justify-center ${
                  isSelected
                    ? 'ring-2 ring-offset-2 ring-slate-900 scale-110 shadow-xs'
                    : 'hover:scale-105'
                }`}
                title={c.name}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            );
          })}
        </div>

        {/* Custom Hex Color Picker */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="color"
            value={design.accentColor}
            onChange={(e) => onChange({ accentColor: e.target.value })}
            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
            title="Custom Color"
          />
          <Input
            type="text"
            value={design.accentColor}
            onChange={(e) => onChange({ accentColor: e.target.value })}
            placeholder="#0f172a"
            className="h-8 text-xs font-mono w-28 uppercase"
          />
          <span className="text-[11px] text-slate-400">Custom hex</span>
        </div>
      </div>
    </div>
  );
});

BrandingCard.displayName = 'BrandingCard';

