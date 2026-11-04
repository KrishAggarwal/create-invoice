import React from 'react';
import type { TemplateStyle } from '../../../types/invoice';
import { Layout, Check } from 'lucide-react';

interface TemplateCardProps {
  template: TemplateStyle;
  onTemplateChange: (t: TemplateStyle) => void;
}

const TEMPLATES: { id: TemplateStyle; label: string; badge: string; description: string }[] = [
  {
    id: 'minimal',
    label: 'Minimal Clean',
    badge: 'Editorial',
    description: 'Borderless Scandinavian layout with airy whitespace and hairline rules',
  },
  {
    id: 'modern',
    label: 'Modern Studio',
    badge: 'Popular',
    description: 'Full-bleed color banner, floating client cards, and dark totals callout',
  },
  {
    id: 'executive',
    label: 'Executive Classic',
    badge: 'Corporate',
    description: 'Formal letterhead with serif typography, ledger grid, and remittance slip',
  },
];

export const TemplateCard: React.FC<TemplateCardProps> = React.memo(
  ({ template, onTemplateChange }) => {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
          <Layout className="w-4 h-4 text-slate-700" />
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Document Template
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {TEMPLATES.map((tmpl) => {
            const isSelected = template === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => onTemplateChange(tmpl.id)}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{tmpl.label}</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        isSelected
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tmpl.badge}
                    </span>
                  </div>
                  <div
                    className={`text-[11px] mt-1 ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {tmpl.description}
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);

TemplateCard.displayName = 'TemplateCard';
