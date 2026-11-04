import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { InvoiceData } from '../../types/invoice';
import InvoicePreview from './InvoicePreview';
import { getSampleInvoiceForPreview } from '../../data/sampleInvoice';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface PreviewCanvasProps {
  data: InvoiceData;
  previewRef: React.RefObject<HTMLDivElement | null>;
  previewMode?: 'real' | 'sample';
}

// 96 DPI CSS Pixel equivalents for accurate paper dimensions
const MM_TO_PX = 3.7795275591;

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  data,
  previewRef,
  previewMode = 'real',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [isManualScale, setIsManualScale] = useState<boolean>(true);

  const effectiveData = previewMode === 'sample' ? getSampleInvoiceForPreview(data) : data;

  const isLetter = effectiveData.design?.paperFormat === 'letter';
  const sheetWidthMm = isLetter ? '215.9mm' : '210mm';
  const sheetHeightMm = isLetter ? '279.4mm' : '297mm';

  const sheetWidthPx = (isLetter ? 215.9 : 210) * MM_TO_PX;
  const sheetHeightPx = (isLetter ? 279.4 : 297) * MM_TO_PX;

  // Auto-fit document width into the available canvas container
  const computeFitScale = useCallback(() => {
    if (!containerRef.current) return 0.85;
    const containerWidth = containerRef.current.clientWidth;
    // Allow 32px breathing room on sides (16px left + 16px right)
    const paddingHorizontal = containerWidth > 640 ? 48 : 24;
    const availableWidth = containerWidth - paddingHorizontal;
    if (availableWidth <= 0) return 0.85;

    // Calculate exact scale so the sheet fits full width
    const calculated = availableWidth / sheetWidthPx;
    // Clamp between 0.35 and 1.25
    return Math.min(1.25, Math.max(0.35, Math.round(calculated * 100) / 100));
  }, [sheetWidthPx]);

  // Recalculate auto scale on mount and container resize
  useEffect(() => {
    if (isManualScale) return;

    const updateScale = () => {
      const fit = computeFitScale();
      setScale(fit);
    };

    updateScale();

    const resizeObserver = new ResizeObserver(() => {
      if (!isManualScale) {
        updateScale();
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [computeFitScale, isManualScale]);

  // Zoom handlers
  const handleZoomIn = () => {
    setIsManualScale(true);
    setScale((prev) => Math.min(1.5, Math.round((prev + 0.1) * 10) / 10));
  };

  const handleZoomOut = () => {
    setIsManualScale(true);
    setScale((prev) => Math.max(0.4, Math.round((prev - 0.1) * 10) / 10));
  };

  const handleResetFit = () => {
    setIsManualScale(false);
    setScale(computeFitScale());
  };

  const handle100Percent = () => {
    setIsManualScale(true);
    setScale(1.0);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex-1 min-h-0 flex flex-col bg-slate-200/50 rounded-2xl border border-slate-200/80 overflow-hidden"
    >
      {/* Scrollable Viewport with Hidden Scrollbar */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden no-scrollbar flex justify-center p-1.5 sm:p-2.5 md:p-3">
        <div
          style={{
            width: `${sheetWidthPx * scale}px`,
            minHeight: `${sheetHeightPx * scale}px`,
            height: `${sheetHeightPx * scale}px`,
            position: 'relative',
            margin: '0 auto',
            flexShrink: 0,
            transition: 'width 0.15s ease-out, height 0.15s ease-out',
          }}
        >
          <div
            style={{
              width: sheetWidthMm,
              minHeight: sheetHeightMm,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0,
              left: 0,
              boxSizing: 'border-box',
              transition: 'transform 0.15s ease-out',
            }}
            className="shadow-2xl rounded-xs bg-white"
          >
            <InvoicePreview ref={previewRef} data={effectiveData} />
          </div>
        </div>
      </div>

      {/* Floating Translucent Zoom Toolbar */}
      <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1 bg-slate-900/85 backdrop-blur-md text-white border border-slate-700/60 shadow-lg px-2.5 py-1 rounded-full text-xs select-none">
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1 hover:text-emerald-400 rounded-full transition-colors disabled:opacity-40"
          disabled={scale <= 0.4}
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={handleResetFit}
          title={isManualScale ? 'Reset to Fit Width' : 'Fit to Width (Active)'}
          className={`px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold transition-colors ${
            !isManualScale ? 'text-emerald-400' : 'hover:text-slate-200'
          }`}
        >
          {Math.round(scale * 100)}%
        </button>

        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1 hover:text-emerald-400 rounded-full transition-colors disabled:opacity-40"
          disabled={scale >= 1.5}
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-3 bg-slate-700 mx-0.5" />

        <button
          type="button"
          onClick={handleResetFit}
          title="Fit Width"
          className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
            !isManualScale
              ? 'bg-slate-800 text-emerald-400'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Maximize className="w-3 h-3" />
        </button>

        <button
          type="button"
          onClick={handle100Percent}
          title="100% Actual Print Size"
          className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
            isManualScale && Math.abs(scale - 1.0) < 0.01
              ? 'bg-slate-800 text-emerald-400'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          100%
        </button>
      </div>
    </div>
  );
};
