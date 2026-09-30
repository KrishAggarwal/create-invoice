import {
  type InvoiceData,
  type LineItem,
  type PaymentAccount,
  type SavedClient,
  type Currency,
  type TemplateStyle,
  generateId,
  PAYMENT_METHODS,
} from '../../types/invoice';

interface InvoiceFormProps {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
  savedAccounts: PaymentAccount[];
  onSaveAccount: (account: PaymentAccount) => void;
  onDeleteAccount: (id: string) => void;
  savedClients: SavedClient[];
  onSaveClient: (client: SavedClient) => void;
  onDeleteClient: (id: string) => void;
}

export default function InvoiceForm({
  data,
  onChange,
  savedAccounts,
  onSaveAccount,
  onDeleteAccount,
  savedClients,
  onSaveClient,
  onDeleteClient,
}: InvoiceFormProps) {
  const update = (partial: Partial<InvoiceData>) =>
    onChange({ ...data, ...partial });

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    const items = data.lineItems.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    update({ lineItems: items });
  };

  const addLineItem = () => {
    update({
      lineItems: [
        ...data.lineItems,
        { id: generateId(), title: '', subtitle: '', hours: 0, amount: 0 },
      ],
    });
  };

  const removeLineItem = (id: string) => {
    if (data.lineItems.length <= 1) return;
    update({ lineItems: data.lineItems.filter((item) => item.id !== id) });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      update({
        sender: { ...data.sender, logo: reader.result as string },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSavedAccount = (accountId: string) => {
    const account = savedAccounts.find((a) => a.id === accountId);
    if (account && data.paymentDue) {
      update({
        paymentDue: { ...data.paymentDue, account: { ...account } },
      });
    }
  };

  const handleSaveCurrentAccount = () => {
    if (data.paymentDue?.account) {
      const account = {
        ...data.paymentDue.account,
        id: data.paymentDue.account.id || generateId(),
      };
      if (!account.label) {
        account.label = account.bankName || 'Unnamed Account';
      }
      onSaveAccount(account);
    }
  };

  const handleSelectSavedClient = (clientId: string) => {
    const client = savedClients.find((c) => c.id === clientId);
    if (client) {
      update({
        client: {
          name: client.name,
          companyName: client.companyName,
          email: client.email,
          address: client.address,
        },
      });
    }
  };

  const handleSaveCurrentClient = () => {
    const c = data.client;
    const client: SavedClient = {
      id: generateId(),
      label: c.companyName || c.name || 'Unnamed Client',
      name: c.name,
      companyName: c.companyName,
      email: c.email,
      address: c.address,
    };
    onSaveClient(client);
  };

  // ─── Shared input classes ───
  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-navy-400 focus:ring-2 focus:ring-navy-100';
  const labelClass = 'block text-xs font-medium text-slate-500 mb-1';
  const sectionTitleClass =
    'text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2';

  return (
    <div className="space-y-6">
      {/* ── Invoice Type & Template ── */}
      <div className="space-y-4">
        <div className={sectionTitleClass}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Invoice Settings
        </div>

        {/* Type Toggle */}
        <div>
          <label className={labelClass}>Invoice Type</label>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => update({ type: 'paid' })}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                data.type === 'paid'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              ✓ Paid
            </button>
            <button
              type="button"
              onClick={() => update({ type: 'due' })}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                data.type === 'due'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              ◷ Due
            </button>
          </div>
        </div>

        {/* Template Toggle */}
        <div>
          <label className={labelClass}>Template</label>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => update({ template: 'minimal' as TemplateStyle })}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                data.template === 'minimal'
                  ? 'bg-navy-700 text-white'
                  : 'bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              Minimal
            </button>
            <button
              type="button"
              onClick={() => update({ template: 'modern' as TemplateStyle })}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                data.template === 'modern'
                  ? 'bg-navy-700 text-white'
                  : 'bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              Modern
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Invoice Number</label>
            <input
              type="text"
              className={inputClass}
              value={data.invoiceNumber}
              onChange={(e) => update({ invoiceNumber: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Invoice Date</label>
            <input
              type="date"
              className={inputClass}
              value={data.invoiceDate}
              onChange={(e) => update({ invoiceDate: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Service Period</label>
            <input
              type="text"
              className={inputClass}
              placeholder="e.g., Sept 1 - 30, 2026"
              value={data.servicePeriod || ''}
              onChange={(e) => update({ servicePeriod: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Currency</label>
            <select
              className={inputClass}
              value={data.currency}
              onChange={(e) => update({ currency: e.target.value as Currency })}
            >
              <option value="USD">$ USD</option>
              <option value="INR">₹ INR</option>
              <option value="EUR">€ EUR</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Sender Info ── */}
      <div className="space-y-4">
        <div className={sectionTitleClass}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          Your Details
        </div>

        {/* Logo */}
        <div>
          <label className={labelClass}>Logo (optional)</label>
          <div className="flex items-center gap-3">
            {data.sender.logo && (
              <img
                src={data.sender.logo}
                alt="Logo"
                className="w-10 h-10 rounded-lg object-contain border border-slate-200"
              />
            )}
            <label className="cursor-pointer rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-500 hover:border-navy-400 hover:text-navy-600 transition-colors">
              {data.sender.logo ? 'Change' : 'Upload logo'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </label>
            {data.sender.logo && (
              <button
                type="button"
                onClick={() => update({ sender: { ...data.sender, logo: undefined } })}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        <div>
          <label className={labelClass}>Full Name</label>
          <input
            type="text"
            className={inputClass}
            placeholder="John Doe"
            value={data.sender.name}
            onChange={(e) =>
              update({ sender: { ...data.sender, name: e.target.value } })
            }
          />
        </div>
        <div>
          <label className={labelClass}>Title / Designation</label>
          <input
            type="text"
            className={inputClass}
            placeholder="e.g., Independent Software Consultant"
            value={data.sender.title}
            onChange={(e) =>
              update({ sender: { ...data.sender, title: e.target.value } })
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              className={inputClass}
              placeholder="you@email.com"
              value={data.sender.email}
              onChange={(e) =>
                update({ sender: { ...data.sender, email: e.target.value } })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input
              type="text"
              className={inputClass}
              placeholder="+1 234 567 8900"
              value={data.sender.phone}
              onChange={(e) =>
                update({ sender: { ...data.sender, phone: e.target.value } })
              }
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Address</label>
          <textarea
            className={`${inputClass} resize-none`}
            rows={2}
            placeholder="City, State, Country"
            value={data.sender.address}
            onChange={(e) =>
              update({ sender: { ...data.sender, address: e.target.value } })
            }
          />
        </div>
      </div>

      {/* ── Client Info ── */}
      <div className="space-y-4">
        <div className={sectionTitleClass}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          Client Details
        </div>

        {/* Saved Clients Dropdown */}
        {savedClients?.length > 0 && (
          <div>
            <label className={labelClass}>Saved Clients</label>
            <div className="flex gap-2">
              <select
                className={inputClass}
                defaultValue=""
                onChange={(e) => handleSelectSavedClient(e.target.value)}
              >
                <option value="" disabled>
                  Load a saved client...
                </option>
                {savedClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const lastUsed = savedClients.find(
                    (c) => c.name === data.client.name && c.companyName === data.client.companyName
                  );
                  if (lastUsed) onDeleteClient(lastUsed.id);
                }}
                className="shrink-0 text-xs text-red-400 hover:text-red-600 px-2"
                title="Delete matching saved client"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div>
          <label className={labelClass}>Client Name</label>
          <input
            type="text"
            className={inputClass}
            placeholder="Client name"
            value={data.client.name}
            onChange={(e) =>
              update({ client: { ...data.client, name: e.target.value } })
            }
          />
        </div>
        <div>
          <label className={labelClass}>Company Name</label>
          <input
            type="text"
            className={inputClass}
            placeholder="Company Inc."
            value={data.client.companyName}
            onChange={(e) =>
              update({
                client: { ...data.client, companyName: e.target.value },
              })
            }
          />
        </div>
        <div>
          <label className={labelClass}>Client Email</label>
          <input
            type="email"
            className={inputClass}
            placeholder="client@company.com"
            value={data.client.email}
            onChange={(e) =>
              update({ client: { ...data.client, email: e.target.value } })
            }
          />
        </div>
        <div>
          <label className={labelClass}>Client Address</label>
          <textarea
            className={`${inputClass} resize-none`}
            rows={2}
            placeholder="Client address"
            value={data.client.address}
            onChange={(e) =>
              update({ client: { ...data.client, address: e.target.value } })
            }
          />
        </div>
        <button
          type="button"
          onClick={handleSaveCurrentClient}
          className="text-xs text-navy-600 hover:text-navy-800 font-medium transition-colors"
        >
          💾 Save this client for later
        </button>
      </div>

      {/* ── Line Items ── */}
      <div className="space-y-4">
        <div className={sectionTitleClass}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          Line Items
        </div>

        {data.lineItems.map((item, index) => (
          <div
            key={item.id}
            className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                Item {index + 1}
              </span>
              {data.lineItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLineItem(item.id)}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                className={inputClass}
                placeholder="e.g., Full Stack Development"
                value={item.title}
                onChange={(e) =>
                  updateLineItem(item.id, 'title', e.target.value)
                }
              />
            </div>
            <div>
              <label className={labelClass}>Subtitle (optional)</label>
              <input
                type="text"
                className={inputClass}
                placeholder="e.g., September 2026 — React + Node.js"
                value={item.subtitle}
                onChange={(e) =>
                  updateLineItem(item.id, 'subtitle', e.target.value)
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Hours</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  className={inputClass}
                  placeholder="0"
                  value={item.hours || ''}
                  onChange={(e) =>
                    updateLineItem(
                      item.id,
                      'hours',
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  placeholder="0.00"
                  value={item.amount || ''}
                  onChange={(e) =>
                    updateLineItem(
                      item.id,
                      'amount',
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addLineItem}
          className="w-full rounded-lg border border-dashed border-slate-300 py-2.5 text-sm text-slate-500 hover:border-navy-400 hover:text-navy-600 hover:bg-navy-50/50 transition-all"
        >
          + Add Item
        </button>
      </div>

      {/* ── Discount ── */}
      <div className="space-y-4">
        <div className={sectionTitleClass}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>
          Discount (Optional)
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Discount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              placeholder="0"
              value={data.discount || ''}
              onChange={(e) =>
                update({ discount: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Type</label>
            <select
              className={inputClass}
              value={data.discountType}
              onChange={(e) =>
                update({
                  discountType: e.target.value as 'percentage' | 'flat',
                })
              }
            >
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Payment Info (conditional) ── */}
      {data.type === 'due' && (
        <div className="space-y-4">
          <div className={sectionTitleClass}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            Payment Details
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Due Date</label>
              <input
                type="date"
                className={inputClass}
                value={data.paymentDue?.dueDate || ''}
                onChange={(e) =>
                  update({
                    paymentDue: {
                      ...data.paymentDue!,
                      dueDate: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div>
              <label className={labelClass}>Payment Terms</label>
              <input
                type="text"
                className={inputClass}
                placeholder="Net 15"
                value={data.paymentDue?.paymentTerms || ''}
                onChange={(e) =>
                  update({
                    paymentDue: {
                      ...data.paymentDue!,
                      paymentTerms: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>

          {/* Saved Accounts Dropdown */}
          {savedAccounts.length > 0 && (
            <div>
              <label className={labelClass}>Saved Accounts</label>
              <div className="flex gap-2">
                <select
                  className={inputClass}
                  defaultValue=""
                  onChange={(e) => handleSelectSavedAccount(e.target.value)}
                >
                  <option value="" disabled>
                    Select a saved account...
                  </option>
                  {savedAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.label || acc.bankName}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const selected = savedAccounts.find(
                      (a) => a.id === data.paymentDue?.account.id
                    );
                    if (selected) onDeleteAccount(selected.id);
                  }}
                  className="shrink-0 text-xs text-red-400 hover:text-red-600 px-2"
                  title="Delete selected account"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className={labelClass}>Account Label</label>
              <input
                type="text"
                className={inputClass}
                placeholder="e.g., Chase Checking"
                value={data.paymentDue?.account.label || ''}
                onChange={(e) =>
                  update({
                    paymentDue: {
                      ...data.paymentDue!,
                      account: {
                        ...data.paymentDue!.account,
                        label: e.target.value,
                      },
                    },
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Bank Name</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Bank name"
                  value={data.paymentDue?.account.bankName || ''}
                  onChange={(e) =>
                    update({
                      paymentDue: {
                        ...data.paymentDue!,
                        account: {
                          ...data.paymentDue!.account,
                          bankName: e.target.value,
                        },
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Account Number</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="XXXX-XXXX-XXXX"
                  value={data.paymentDue?.account.accountNumber || ''}
                  onChange={(e) =>
                    update({
                      paymentDue: {
                        ...data.paymentDue!,
                        account: {
                          ...data.paymentDue!.account,
                          accountNumber: e.target.value,
                        },
                      },
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>IFSC / Routing</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Routing / IFSC code"
                  value={data.paymentDue?.account.routingOrIfsc || ''}
                  onChange={(e) =>
                    update({
                      paymentDue: {
                        ...data.paymentDue!,
                        account: {
                          ...data.paymentDue!.account,
                          routingOrIfsc: e.target.value,
                        },
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>UPI ID (optional)</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="name@upi"
                  value={data.paymentDue?.account.upiId || ''}
                  onChange={(e) =>
                    update({
                      paymentDue: {
                        ...data.paymentDue!,
                        account: {
                          ...data.paymentDue!.account,
                          upiId: e.target.value,
                        },
                      },
                    })
                  }
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleSaveCurrentAccount}
              className="text-xs text-navy-600 hover:text-navy-800 font-medium transition-colors"
            >
              💾 Save this account for later
            </button>
          </div>
        </div>
      )}

      {data.type === 'paid' && (
        <div className="space-y-4">
          <div className={sectionTitleClass}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Payment Confirmation
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Payment Date</label>
              <input
                type="date"
                className={inputClass}
                value={data.paymentPaid?.paymentDate || ''}
                onChange={(e) =>
                  update({
                    paymentPaid: {
                      ...data.paymentPaid!,
                      paymentDate: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div>
              <label className={labelClass}>Payment Method</label>
              <select
                className={inputClass}
                value={data.paymentPaid?.paymentMethod || ''}
                onChange={(e) =>
                  update({
                    paymentPaid: {
                      ...data.paymentPaid!,
                      paymentMethod: e.target.value,
                    },
                  })
                }
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Transaction / Reference ID</label>
            <input
              type="text"
              className={inputClass}
              placeholder="TXN-12345 (optional)"
              value={data.paymentPaid?.transactionId || ''}
              onChange={(e) =>
                update({
                  paymentPaid: {
                    ...data.paymentPaid!,
                    transactionId: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
      )}

      {/* ── Notes ── */}
      <div className="space-y-4">
        <div className={sectionTitleClass}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          Notes
        </div>
        <textarea
          className={`${inputClass} resize-none`}
          rows={3}
          placeholder="Thank you for your business!"
          value={data.notes}
          onChange={(e) => update({ notes: e.target.value })}
        />
      </div>
    </div>
  );
}
