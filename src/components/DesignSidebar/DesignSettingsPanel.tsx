import type { TemplateStyle, DesignSettings } from '../../types/invoice';
import { TemplateCard } from './cards/TemplateCard';
import { BrandingCard } from './cards/BrandingCard';
import { MarginsCard } from './cards/MarginsCard';
import { TypographyCard } from './cards/TypographyCard';
import { FormatCard } from './cards/FormatCard';

interface DesignSettingsPanelProps {
  template: TemplateStyle;
  onTemplateChange: (t: TemplateStyle) => void;
  design: DesignSettings;
  onDesignChange: (d: DesignSettings) => void;
}

export default function DesignSettingsPanel({
  template,
  onTemplateChange,
  design,
  onDesignChange,
}: DesignSettingsPanelProps) {
  const handleUpdate = (partial: Partial<DesignSettings>) => {
    onDesignChange({ ...design, ...partial });
  };

  return (
    <div className="space-y-4">
      {/* 1. Template Presets Card */}
      <TemplateCard template={template} onTemplateChange={onTemplateChange} />

      {/* 2. Brand Accent Colors Card */}
      <BrandingCard design={design} onChange={handleUpdate} />

      {/* 3. Document Margins & Spacing Card */}
      <MarginsCard design={design} onChange={handleUpdate} />

      {/* 4. Typography Scale & Fonts Card */}
      <TypographyCard design={design} onChange={handleUpdate} />

      {/* 5. Paper Format & Date Locale Card */}
      <FormatCard design={design} onChange={handleUpdate} />
    </div>
  );
}
