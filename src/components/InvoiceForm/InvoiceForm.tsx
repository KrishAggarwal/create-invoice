import { useState, useCallback } from 'react';
import type {
  InvoiceData,
  PaymentAccount,
  SavedClient,
  PaymentRecord,
} from '../../types/invoice';
import { GeneralSection } from './sections/GeneralSection';
import { SenderSection } from './sections/SenderSection';
import { ClientSection } from './sections/ClientSection';
import { LineItemsSection } from './sections/LineItemsSection';
import { PaymentSection } from './sections/PaymentSection';
import { NotesSection } from './sections/NotesSection';
import PartialPaymentModal from '../PartialPaymentModal/PartialPaymentModal';

interface InvoiceFormProps {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
  savedAccounts: PaymentAccount[];
  savedClients: SavedClient[];
}

export default function InvoiceForm({
  data,
  onChange,
  savedAccounts,
  savedClients,
}: InvoiceFormProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handleUpdate = useCallback(
    (partial: Partial<InvoiceData>) => {
      onChange({ ...data, ...partial });
    },
    [data, onChange]
  );

  const handleSenderChange = useCallback(
    (sender: InvoiceData['sender']) => {
      onChange({ ...data, sender });
    },
    [data, onChange]
  );

  const handleClientChange = useCallback(
    (client: InvoiceData['client']) => {
      onChange({ ...data, client });
    },
    [data, onChange]
  );

  const handleLineItemsUpdate = useCallback(
    (updates: {
      lineItems?: InvoiceData['lineItems'];
      discount?: number;
      discountType?: 'percentage' | 'flat';
      taxRate?: number;
    }) => {
      onChange({ ...data, ...updates });
    },
    [data, onChange]
  );

  const handlePaymentUpdate = useCallback(
    (updates: {
      paymentDue?: InvoiceData['paymentDue'];
      paymentPaid?: InvoiceData['paymentPaid'];
    }) => {
      onChange({ ...data, ...updates });
    },
    [data, onChange]
  );

  const handleNotesChange = useCallback(
    (notes: string) => {
      onChange({ ...data, notes });
    },
    [data, onChange]
  );

  const handleAddPayment = useCallback(
    (payment: PaymentRecord) => {
      const existingPayments = data.payments || [];
      onChange({ ...data, payments: [...existingPayments, payment] });
    },
    [data, onChange]
  );

  const handleDeletePayment = useCallback(
    (index: number) => {
      const existingPayments = data.payments || [];
      onChange({
        ...data,
        payments: existingPayments.filter((_, idx) => idx !== index),
      });
    },
    [data, onChange]
  );

  const totalPaymentsMade = (data.payments || []).reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0
  );

  const totalAmount = data.lineItems.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  return (
    <div className="space-y-4 bg-white p-4">
      {/* ── Invoice Settings (Type, Mode, Currency, Dates) ── */}
      <GeneralSection data={data} onChange={handleUpdate} />

      <hr className="border-slate-200" />

      {/* ── Sender / Freelancer Details ── */}
      <SenderSection sender={data.sender} onChange={handleSenderChange} />

      <hr className="border-slate-200" />

      {/* ── Client Details (Bill To) ── */}
      <ClientSection
        client={data.client}
        onChange={handleClientChange}
        savedClients={savedClients}
      />

      <hr className="border-slate-200" />

      {/* ── Deliverables & Line Items ── */}
      <LineItemsSection
        lineItems={data.lineItems}
        billingMode={data.billingMode || 'fixed'}
        currency={data.currency}
        discount={data.discount}
        discountType={data.discountType}
        taxRate={data.taxRate}
        paymentsCount={(data.payments || []).length}
        paymentsTotal={totalPaymentsMade}
        onOpenLedger={() => setIsPaymentModalOpen(true)}
        onChange={handleLineItemsUpdate}
      />

      <hr className="border-slate-200" />

      {/* ── Payment Remittance / Receipt Details ── */}
      <PaymentSection
        type={data.type}
        paymentDue={data.paymentDue}
        paymentPaid={data.paymentPaid}
        invoiceDate={data.invoiceDate}
        savedAccounts={savedAccounts}
        onChange={handlePaymentUpdate}
      />

      <hr className="border-slate-200" />

      {/* ── Notes / Terms ── */}
      <NotesSection notes={data.notes} onChange={handleNotesChange} />

      {/* Partial Payment / Milestone Ledger Modal */}
      <PartialPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        currency={data.currency}
        totalAmount={totalAmount}
        payments={data.payments || []}
        onAddPayment={handleAddPayment}
        onDeletePayment={handleDeletePayment}
      />
    </div>
  );
}
