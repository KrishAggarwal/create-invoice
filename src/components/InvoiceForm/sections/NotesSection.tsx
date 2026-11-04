import React from 'react';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';

interface NotesSectionProps {
  notes?: string;
  onChange: (notes: string) => void;
}

export const NotesSection: React.FC<NotesSectionProps> = React.memo(({ notes = '', onChange }) => {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="invoice-notes">Invoice Notes / Terms</Label>
      <Textarea
        id="invoice-notes"
        rows={3}
        placeholder="Payment terms, delivery conditions, or additional notes"
        value={notes}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
});

NotesSection.displayName = 'NotesSection';

