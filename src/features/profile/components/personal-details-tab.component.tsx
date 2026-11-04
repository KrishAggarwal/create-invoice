import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import CurrencySelector from '../../../components/CurrencySelector/CurrencySelector';
import {
  User,
  Building2,
  CheckCircle2,
  Save,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

export const PersonalDetailsTabComponent: React.FC = () => {
  const { user, workspace, updateWorkspace } = useAuth();

  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [entityType, setEntityType] = useState<'individual' | 'agency'>('individual');
  const [legalName, setLegalName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (workspace) {
      setFullName(user?.fullName || '');
      setTitle(workspace.title || '');
      setEntityType(workspace.entityType || 'individual');
      setLegalName(workspace.legalName || workspace.name || '');
      setTaxId(workspace.taxId || '');
      setLogoUrl(workspace.logoUrl || '');
      setDefaultCurrency(workspace.defaultCurrency || 'USD');
      setPhone(workspace.phone || '');
      setEmail(workspace.email || user?.email || '');
      setAddress(workspace.address || '');
    }
  }, [workspace, user]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      await updateWorkspace({
        name: legalName || fullName || 'Personal Workspace',
        legalName,
        title,
        entityType,
        taxId,
        logoUrl,
        defaultCurrency,
        phone,
        email,
        address,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update personal details.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {saveSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Personal details & business identity successfully saved.
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-800">
          {errorMessage}
        </div>
      )}

      {/* Identity & Business Type */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <User className="w-4 h-4 text-slate-500" />
          Identity & Organization
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Business Profile Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setEntityType('individual')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                entityType === 'individual'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold">
                <User className="w-4 h-4" /> Solo Freelancer / Consultant
              </div>
              <div
                className={`text-[11px] mt-1 ${
                  entityType === 'individual' ? 'text-slate-300' : 'text-slate-400'
                }`}
              >
                Simple, individual billing without corporate filings
              </div>
            </button>

            <button
              type="button"
              onClick={() => setEntityType('agency')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                entityType === 'agency'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold">
                <Building2 className="w-4 h-4" /> Registered Business / Studio
              </div>
              <div
                className={`text-[11px] mt-1 ${
                  entityType === 'agency' ? 'text-slate-300' : 'text-slate-400'
                }`}
              >
                Includes legal tax registrations (VAT/GSTIN/EIN)
              </div>
            </button>
          </div>
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Brand Logo / Signature Mark
          </label>
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo preview"
                className="w-14 h-14 rounded-xl object-contain border border-slate-200 bg-white p-1 shadow-2xs"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 text-xs">
                No Logo
              </div>
            )}
            <div>
              <label className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-700 font-semibold hover:bg-slate-50 shadow-2xs inline-block">
                Upload Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl('')}
                  className="ml-3 text-xs text-rose-600 font-medium hover:underline"
                >
                  Remove
                </button>
              )}
              <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, or SVG up to 2MB</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Professional Title / Role
            </label>
            <input
              type="text"
              placeholder="e.g. Senior Software Architect"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Business / Studio Legal Name
            </label>
            <input
              type="text"
              placeholder="e.g. Apex Studio Inc."
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tax Registration (VAT / GSTIN / EIN)
            </label>
            <input
              type="text"
              placeholder="e.g. 29ABCDE1234F1Z5 or US EIN"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Billing Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3.5 py-2 text-xs text-slate-800 outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Official Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="+1 555-0192"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3.5 py-2 text-xs text-slate-800 outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-200"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Official Billing Address
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
            <textarea
              rows={2}
              placeholder="Street address, city, state, postal code, country"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3.5 py-2 text-xs text-slate-800 outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Default Billing Currency
          </label>
          <CurrencySelector
            value={defaultCurrency}
            onChange={(code) => setDefaultCurrency(code)}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-2.5 transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5 text-emerald-400" />
          {isSaving ? 'Saving...' : 'Save Personal Details'}
        </button>
      </div>
    </form>
  );
};
