import React from 'react';
import type { ClientInfo, SavedClient } from '../../../types/invoice';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Building2 } from 'lucide-react';

interface ClientSectionProps {
  client: ClientInfo;
  onChange: (client: ClientInfo) => void;
  savedClients: SavedClient[];
}

export const ClientSection: React.FC<ClientSectionProps> = React.memo(
  ({ client, onChange, savedClients }) => {
    const updateClient = (partial: Partial<ClientInfo>) => {
      onChange({ ...client, ...partial });
    };

    const handleSelectClient = (c: SavedClient) => {
      onChange({
        name: c.name || '',
        companyName: c.companyName || '',
        email: c.email || '',
        phone: c.phone || '',
        address: c.address || '',
        taxId: c.taxId || '',
      });
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-500" />
            Client Details (Bill To)
          </div>

          {savedClients.length > 0 && (
            <div className="w-52">
              <Select
                value=""
                onValueChange={(val) => {
                  const found = savedClients.find((c) =>
                    c.uuid ? c.uuid === val : (c.companyName || c.name) === val
                  );
                  if (found) handleSelectClient(found);
                }}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder={`Load client (${savedClients.length})...`} />
                </SelectTrigger>
                <SelectContent align="end">
                  {savedClients.map((c, idx) => {
                    const val = c.uuid || c.companyName || c.name || String(idx);
                    return (
                      <SelectItem key={c.uuid || idx} value={val}>
                        {c.companyName ? `${c.companyName} (${c.name})` : c.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="client-name">Contact Person</Label>
            <Input
              id="client-name"
              type="text"
              placeholder="Contact person name"
              value={client.name}
              onChange={(e) => updateClient({ name: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="client-company">Company Name</Label>
            <Input
              id="client-company"
              type="text"
              placeholder="Company name"
              value={client.companyName}
              onChange={(e) => updateClient({ companyName: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="client-email">Email Address</Label>
            <Input
              id="client-email"
              type="email"
              placeholder="client@example.com"
              value={client.email}
              onChange={(e) => updateClient({ email: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="client-phone">Phone Number (optional)</Label>
            <Input
              id="client-phone"
              type="text"
              placeholder="Phone number"
              value={client.phone || ''}
              onChange={(e) => updateClient({ phone: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="client-tax-id">Tax ID / VAT (optional)</Label>
          <Input
            id="client-tax-id"
            type="text"
            placeholder="Tax ID or VAT number"
            value={client.taxId || ''}
            onChange={(e) => updateClient({ taxId: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="client-address">Billing Address (optional)</Label>
          <Textarea
            id="client-address"
            rows={2}
            placeholder="Street address, city, country"
            value={client.address || ''}
            onChange={(e) => updateClient({ address: e.target.value })}
          />
        </div>
      </div>
    );
  }
);

ClientSection.displayName = 'ClientSection';
