export interface LineItem {
  id: string;
  title: string;
  subtitle: string; // optional detail line
  hours: number;
  amount: number;
}

export interface SavedClient {
  id: string;
  label: string; // display name for dropdown
  name: string;
  companyName: string;
  email: string;
  address: string;
}

export interface SenderInfo {
  name: string;
  title: string; // designation e.g. "Independent Software Consultant"
  email: string;
  phone: string;
  address: string;
  logo?: string; // base64 data URL
}

export interface ClientInfo {
  name: string;
  companyName: string;
  email: string;
  address: string;
}

export interface PaymentAccount {
  id: string;
  label: string; // e.g., "Chase Bank", "PayPal"
  bankName: string;
  accountNumber: string;
  routingOrIfsc: string;
  upiId: string;
}

export interface PaymentDueInfo {
  dueDate: string;
  paymentTerms: string;
  account: PaymentAccount;
}

export interface PaymentPaidInfo {
  paymentDate: string;
  paymentMethod: string;
  transactionId: string;
}

export type InvoiceType = 'paid' | 'due';
export type Currency = 'USD' | 'INR' | 'EUR';
export type TemplateStyle = 'minimal' | 'modern';

export interface InvoiceData {
  type: InvoiceType;
  template: TemplateStyle;
  invoiceNumber: string;
  invoiceDate: string;
  servicePeriod?: string;
  currency: Currency;
  sender: SenderInfo;
  client: ClientInfo;
  lineItems: LineItem[];
  discount: number;
  discountType: 'percentage' | 'flat';
  notes: string;
  // Due-specific
  paymentDue?: PaymentDueInfo;
  // Paid-specific
  paymentPaid?: PaymentPaidInfo;
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
};

export const PAYMENT_METHODS = [
  'Wise',
  'Wire Transfer',
  'UPI',
  'PayPal',
  'Check',
  'Zelle',
  'Venmo',
  'ACH',
  'Other',
] as const;

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `INV-${year}${month}-${seq}`;
}

export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}

export function calculateSubtotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}

export function calculateDiscount(
  subtotal: number,
  discount: number,
  discountType: 'percentage' | 'flat'
): number {
  if (discount <= 0) return 0;
  return discountType === 'percentage' ? (subtotal * discount) / 100 : discount;
}

export function calculateTotal(
  subtotal: number,
  discountAmount: number
): number {
  return Math.max(0, subtotal - discountAmount);
}

export function getDefaultInvoiceData(): InvoiceData {
  const today = new Date().toISOString().split('T')[0];
  const dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  return {
    type: 'paid',
    template: 'minimal',
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: today,
    servicePeriod: '',
    currency: 'USD',
    sender: {
      name: '',
      title: '',
      email: '',
      phone: '',
      address: '',
    },
    client: {
      name: '',
      companyName: '',
      email: '',
      address: '',
    },
    lineItems: [
      {
        id: generateId(),
        title: '',
        subtitle: '',
        hours: 0,
        amount: 0,
      },
    ],
    discount: 0,
    discountType: 'percentage',
    notes: 'Thank you for your business!',
    paymentDue: {
      dueDate,
      paymentTerms: 'Net 15',
      account: {
        id: generateId(),
        label: '',
        bankName: '',
        accountNumber: '',
        routingOrIfsc: '',
        upiId: '',
      },
    },
    paymentPaid: {
      paymentDate: today,
      paymentMethod: 'Wire Transfer',
      transactionId: '',
    },
  };
}
