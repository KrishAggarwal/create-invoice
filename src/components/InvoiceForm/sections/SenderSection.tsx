import React from 'react';
import type { SenderInfo } from '../../../types/invoice';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { User } from 'lucide-react';

interface SenderSectionProps {
  sender: SenderInfo;
  onChange: (sender: SenderInfo) => void;
}

export const SenderSection: React.FC<SenderSectionProps> = React.memo(({ sender, onChange }) => {
  const updateSender = (partial: Partial<SenderInfo>) => {
    onChange({ ...sender, ...partial });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateSender({ logo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-slate-500" />
          Sender Details
        </div>

        {/* Entity Profile Toggle */}
        <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => updateSender({ entityType: 'individual' })}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              sender.entityType !== 'agency'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Individual
          </button>
          <button
            type="button"
            onClick={() => updateSender({ entityType: 'agency' })}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              sender.entityType === 'agency'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Business
          </button>
        </div>
      </div>

      {/* Logo Upload */}
      <div>
        <Label className="mb-1.5 block">Logo (optional)</Label>
        <div className="flex items-center gap-3">
          {sender.logo && (
            <img
              src={sender.logo}
              alt="Logo preview"
              className="w-10 h-10 rounded-lg object-contain border border-slate-200 bg-white"
            />
          )}
          <label className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium shadow-xs">
            Choose Logo
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </label>
          {sender.logo && (
            <button
              type="button"
              onClick={() => updateSender({ logo: undefined })}
              className="text-xs text-rose-600 hover:underline"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="sender-name">
            {sender.entityType === 'agency' ? 'Company Name' : 'Full Name'}
          </Label>
          <Input
            id="sender-name"
            type="text"
            placeholder={sender.entityType === 'agency' ? 'Company or business name' : 'Full name'}
            value={sender.name}
            onChange={(e) => updateSender({ name: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="sender-title">Title / Designation</Label>
          <Input
            id="sender-title"
            type="text"
            placeholder="Designation or business description"
            value={sender.title || ''}
            onChange={(e) => updateSender({ title: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="sender-email">Email Address</Label>
          <Input
            id="sender-email"
            type="email"
            placeholder="name@example.com"
            value={sender.email}
            onChange={(e) => updateSender({ email: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="sender-phone">Phone Number (optional)</Label>
          <Input
            id="sender-phone"
            type="text"
            placeholder="+1 555-0100"
            value={sender.phone || ''}
            onChange={(e) => updateSender({ phone: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="sender-address">Address (optional)</Label>
        <Textarea
          id="sender-address"
          rows={2}
          placeholder="Street address, city, country"
          value={sender.address || ''}
          onChange={(e) => updateSender({ address: e.target.value })}
        />
      </div>

      {sender.entityType === 'agency' && (
        <div className="space-y-1">
          <Label htmlFor="sender-tax-id">Tax ID / VAT / GSTIN</Label>
          <Input
            id="sender-tax-id"
            type="text"
            placeholder="Tax ID or registration number"
            value={sender.taxId || ''}
            onChange={(e) => updateSender({ taxId: e.target.value })}
          />
        </div>
      )}
    </div>
  );
});

SenderSection.displayName = 'SenderSection';
