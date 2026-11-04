import { formatCurrencyAmount } from '../data/currencies';

export interface LineItem {
  uuid?: string;
  type?: 'fixed' | 'hourly';
  title: string;
  subtitle?: string; // optional detail line
  hours?: number;
  rate?: number;
  amount: number;
}

export interface SavedClient {
  uuid?: string;
  label?: string; // display name for dropdown
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  currency?: string;
}

export interface SenderInfo {
  name: string;
  title?: string; // designation
  email: string;
  phone?: string;
  address?: string;
  logo?: string; // base64 data URL
  taxId?: string; // optional for registered agencies
  entityType?: 'individual' | 'agency'; // individual vs business
}

export interface ClientInfo {
  name: string;
  companyName: string;
  email: string;
  phone?: string;
  address: string;
  taxId?: string;
}

export interface PaymentAccount {
  uuid?: string;
  label: string;
  type?: 'bank' | 'wire' | 'upi' | 'wise' | 'paypal';
  bankName: string;
  accountNumber: string;
  routingOrIfsc: string;
  upiId?: string;
  swiftBic?: string;
}

export interface PaymentDueInfo {
  dueDate: string;
  paymentTerms: string;
  account: PaymentAccount;
}

export interface PaymentRecord {
  uuid?: string;
  amount: number;
  paymentDate: string;
  paymentMethod?: string;
  transactionRef?: string;
  notes?: string;
}

export interface PaymentPaidInfo {
  paymentDate: string;
  paymentMethod?: string;
  transactionId?: string;
}

export type InvoiceType = 'due' | 'paid';
export type InvoiceStatus = 'draft' | 'due' | 'partially_paid' | 'paid' | 'overdue';
export type BillingMode = 'fixed' | 'hourly';
export type TemplateStyle = 'minimal' | 'modern' | 'executive' | 'tech';

export interface DesignSettings {
  paddingMm: number; // default: 12 (compact: 12mm, range 4 to 48)
  fontSizePt: number; // default: 13 (range 11 to 15)
  fontFamily: 'sans' | 'serif' | 'mono';
  accentColor: string; // hex
  paperFormat: 'a4' | 'letter'; // A4 (210x297mm) vs US Letter (215.9x279.4mm)
  dateFormat: 'medium' | 'eu' | 'iso'; // 'MMM D, YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
}

export interface InvoiceData {
  uuid?: string;
  type: InvoiceType;
  status?: InvoiceStatus;
  billingMode?: BillingMode;
  template: TemplateStyle;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  servicePeriod?: string;
  servicePeriodStart?: string;
  servicePeriodEnd?: string;
  currency: string; // standard ISO 4217 code
  sender: SenderInfo;
  client: ClientInfo;
  lineItems: LineItem[];
  discount: number;
  discountType: 'percentage' | 'flat';
  taxRate?: number;
  notes: string;
  
  // Customization & formatting settings
  design: DesignSettings;

  // Conditional based on invoice type
  paymentDue?: PaymentDueInfo;
  paymentPaid?: PaymentPaidInfo;

  // Milestone / Partial payments ledger
  payments?: PaymentRecord[];
}

export const PAYMENT_METHODS = [
  'Bank Wire Transfer',
  'ACH / Direct Deposit',
  'UPI (Instant Pay)',
  'PayPal',
  'Stripe / Credit Card',
  'Wise',
  'Crypto / Stablecoin',
  'Cheque',
] as const;

export function generateInvoiceNumber(): string {
  const d = new Date();
  const year = d.getFullYear().toString().slice(-2);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}${month}-${random}`;
}

export function formatInvoiceDate(
  dateStr?: string,
  format: 'medium' | 'eu' | 'iso' = 'medium'
): string {
  if (!dateStr) return '';
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00Z');
  if (isNaN(d.getTime())) return dateStr;

  if (format === 'iso') {
    return dateStr.split('T')[0];
  }

  if (format === 'eu') {
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  return d.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateRange(
  startDateStr?: string,
  endDateStr?: string,
  format: 'medium' | 'eu' | 'iso' = 'medium'
): string {
  if (!startDateStr && !endDateStr) return '';
  const sFmt = formatInvoiceDate(startDateStr, format);
  const eFmt = formatInvoiceDate(endDateStr, format);

  if (sFmt && eFmt) {
    return `${sFmt} – ${eFmt}`;
  }
  if (sFmt) return `From ${sFmt}`;
  if (eFmt) return `Until ${eFmt}`;
  return '';
}

export function formatCurrency(amount: number, currency: string): string {
  return formatCurrencyAmount(amount, currency);
}

export function calculateSubtotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}

export function calculateDiscount(
  subtotal: number,
  discount: number,
  discountType: 'percentage' | 'flat'
): number {
  if (discount <= 0) return 0;
  return discountType === 'percentage' ? (subtotal * discount) / 100 : discount;
}

export function calculateTax(afterDiscount: number, taxRate: number = 0): number {
  if (taxRate <= 0) return 0;
  return (afterDiscount * taxRate) / 100;
}

export function calculateTotal(
  subtotal: number,
  discountAmount: number,
  taxAmount: number = 0
): number {
  return Math.max(0, subtotal - discountAmount + taxAmount);
}

export function calculatePaymentsTotal(payments: PaymentRecord[] = []): number {
  return payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
}

export function getDefaultInvoiceData(): InvoiceData {
  const today = new Date().toISOString().split('T')[0];
  const dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  return {
    type: 'due',
    status: 'due',
    billingMode: 'fixed',
    template: 'minimal',
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: today,
    dueDate,
    servicePeriod: '',
    servicePeriodStart: '',
    servicePeriodEnd: '',
    currency: 'USD',
    design: {
      paddingMm: 12, // Default to compact (12mm)
      fontSizePt: 13,
      fontFamily: 'sans',
      accentColor: '#0f172a',
      paperFormat: 'a4',
      dateFormat: 'medium',
    },
    sender: {
      name: '',
      title: '',
      email: '',
      phone: '',
      address: '',
      entityType: 'individual',
    },
    client: {
      name: '',
      companyName: '',
      email: '',
      phone: '',
      address: '',
    },
    lineItems: [
      {
        type: 'fixed',
        title: '',
        subtitle: '',
        hours: 0,
        rate: 0,
        amount: 0,
      },
    ],
    discount: 0,
    discountType: 'percentage',
    taxRate: 0,
    notes: '',
    paymentDue: {
      dueDate,
      paymentTerms: 'Net 15',
      account: {
        label: 'Primary Account',
        type: 'bank',
        bankName: '',
        accountNumber: '',
        routingOrIfsc: '',
        upiId: '',
      },
    },
    paymentPaid: {
      paymentDate: today,
      paymentMethod: '',
      transactionId: '',
    },
    payments: [],
  };
}
