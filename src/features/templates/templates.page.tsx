import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { setTemplate } from '../../store/slices/invoiceSlice';
import type { TemplateStyle } from '../../types/invoice';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

interface TemplateOption {
  id: TemplateStyle;
  name: string;
  tagline: string;
  badge: string;
  accentBg: string;
  features: string[];
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'minimal',
    name: 'Minimal Clean',
    tagline: 'Timeless Scandinavian typography, generous whitespace, and borderless hairline rules.',
    badge: 'Editorial',
    accentBg: 'bg-slate-100 border-slate-300',
    features: ['High-whitespace layout', 'Borderless table with hairlines', 'Quiet understated luxury'],
  },
  {
    id: 'modern',
    name: 'Modern Studio',
    tagline: 'High-impact full-bleed color banner header, floating client cards, and dark totals callout.',
    badge: 'Popular',
    accentBg: 'bg-slate-900 border-slate-900',
    features: ['Full-bleed top color banner', 'Floating rounded client cards', 'High-contrast total summary'],
  },
  {
    id: 'executive',
    name: 'Executive Classic',
    tagline: 'Formal enterprise letterhead with serif headings, structured ledger grid, and remittance instructions.',
    badge: 'Corporate',
    accentBg: 'bg-stone-800 border-stone-800',
    features: ['Letterhead crest & double borders', 'Enclosed financial ledger grid', 'Formal remittance instructions slip'],
  },
];

export const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentTemplate = useAppSelector((state) => state.invoice.current.template);

  const handleSelectTemplate = (templateId: TemplateStyle) => {
    dispatch(setTemplate(templateId));
    navigate('/');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" /> Curated Designs
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Invoice Templates Gallery
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-xl">
          Choose a design system crafted for professional billing. Each template features a completely distinct layout, visual structure, and typographic personality.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TEMPLATES.map((tmpl) => {
          const isSelected = currentTemplate === tmpl.id;

          return (
            <div
              key={tmpl.id}
              onClick={() => handleSelectTemplate(tmpl.id)}
              className={`rounded-2xl border bg-white p-6 transition-all cursor-pointer relative shadow-2xs hover:shadow-md flex flex-col justify-between ${
                isSelected
                  ? 'border-slate-900 ring-2 ring-slate-900/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{tmpl.name}</h3>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {tmpl.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{tmpl.tagline}</p>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Accent Swatch Preview */}
                <div className="my-5 h-16 rounded-xl border border-slate-100 bg-slate-50/50 p-3 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${tmpl.accentBg} shrink-0 shadow-2xs`} />
                  <div className="text-[11px] text-slate-600 font-medium">
                    Optimized for vector print clarity & international standards
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-2 mb-6">
                  {tmpl.features.map((feat, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                type="button"
                className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-100 text-slate-800'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                }`}
              >
                {isSelected ? (
                  <>Currently Active Template</>
                ) : (
                  <>
                    Apply Template & Open Editor <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TemplatesPage;
