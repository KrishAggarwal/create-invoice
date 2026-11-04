import type { InvoiceData } from '../types/invoice';

export const SAMPLE_INVOICE_DATA: InvoiceData = {
  type: 'due',
  status: 'partially_paid',
  billingMode: 'hourly',
  template: 'minimal',
  invoiceNumber: 'INV-2026-0042',
  invoiceDate: '2026-03-01',
  dueDate: '2026-03-15',
  servicePeriodStart: '2026-02-01',
  servicePeriodEnd: '2026-02-28',
  currency: 'USD',
  sender: {
    name: 'Acme Creative Studio Inc.',
    title: 'Product Design & Cloud Engineering',
    email: 'billing@acmestudio.io',
    phone: '+1 (415) 555-0192',
    address: '100 Innovation Way, Suite 400\nSan Francisco, CA 94107',
    taxId: 'US-94-3829104',
  },
  client: {
    name: 'Sarah Jenkins',
    companyName: 'Global Horizons Technologies',
    email: 'accounts@globalhorizons.io',
    phone: '+1 (212) 555-8492',
    address: '750 Lexington Ave, 18th Floor\nNew York, NY 10022',
    taxId: 'US-12-8473921',
  },
  lineItems: [
    {
      uuid: 'sample-item-1',
      title: 'Design System & Component Architecture',
      subtitle: 'Complete token structure, dark/light theme specs, and accessible UI kit in Figma',
      hours: 40,
      rate: 135,
      amount: 5400,
    },
    {
      uuid: 'sample-item-2',
      title: 'React & TypeScript Frontend Implementation',
      subtitle: 'Modular SPA workflow with real-time state sync, responsive canvas, and automated testing',
      hours: 65,
      rate: 150,
      amount: 9750,
    },
    {
      uuid: 'sample-item-3',
      title: 'PostgreSQL Relational Schema & REST API',
      subtitle: 'Transactional integrity, secure JWT workspace multi-tenancy, and indexing audits',
      hours: 32,
      rate: 150,
      amount: 4800,
    },
    {
      uuid: 'sample-item-4',
      title: 'Cloud Deployment & CI/CD Pipeline Setup',
      subtitle: 'Automated build verification, container orchestration, and zero-downtime staging setup',
      hours: 15,
      rate: 160,
      amount: 2400,
    },
  ],
  discount: 5,
  discountType: 'percentage',
  taxRate: 8.5,
  notes:
    'Thank you for your partnership! Payment is due within 15 days of invoice date. Please reference invoice number INV-2026-0042 on your remittance advice.',
  design: {
    paddingMm: 12,
    fontSizePt: 13,
    fontFamily: 'sans',
    accentColor: '#0f172a',
    paperFormat: 'a4',
    dateFormat: 'medium',
  },
  paymentDue: {
    dueDate: '2026-03-15',
    paymentTerms: 'Net 15',
    account: {
      label: 'Primary Operating Account',
      type: 'bank',
      bankName: 'Silicon Valley Commercial Bank',
      accountNumber: '987654321098',
      routingOrIfsc: '121000358',
      swiftBic: 'SVBUS6S',
    },
  },
  payments: [
    {
      uuid: 'sample-pay-1',
      amount: 7500,
      paymentDate: '2026-02-05',
      paymentMethod: 'Bank Wire Transfer',
      transactionRef: 'WT-894721',
      notes: 'Initial milestone deposit (35% project kickoff)',
    },
  ],
};

/**
 * Returns sample invoice data formatted with the active design and template
 * currently selected by the user, so they can visually evaluate their active theme choices.
 */
export function getSampleInvoiceForPreview(activeData: InvoiceData): InvoiceData {
  return {
    ...SAMPLE_INVOICE_DATA,
    template: activeData.template,
    design: {
      ...SAMPLE_INVOICE_DATA.design,
      ...activeData.design,
    },
  };
}

