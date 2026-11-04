/**
 * Pure utility function for invoice template calculations
 * Not a React hook - just a pure calculation function
 */

import type { InvoiceData } from '../../../types/invoice';
import {
  calculateSubtotal,
  calculateDiscount,
  calculateTax,
  calculateTotal,
  calculatePaymentsTotal,
  formatInvoiceDate,
  formatDateRange,
} from '../../../types/invoice';

export function getInvoiceTemplateData(data: InvoiceData) {
  const subtotal = calculateSubtotal(data.lineItems);
  const discountAmount = calculateDiscount(
    subtotal,
    data.discount,
    data.discountType
  );
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const taxAmount = calculateTax(afterDiscount, data.taxRate || 0);
  const total = calculateTotal(subtotal, discountAmount, taxAmount);
  const paymentsTotal = calculatePaymentsTotal(data.payments);

  const isPaidReceipt = data.type === 'paid';
  const hasPartialPayments = !isPaidReceipt && paymentsTotal > 0 && paymentsTotal < total;
  const balanceDue = isPaidReceipt ? 0 : Math.max(0, total - paymentsTotal);
  const hasLineItems = data.lineItems.length > 0 && data.lineItems.some(item => item.title.trim() !== '');

  const formatDate = (dateStr?: string) => formatInvoiceDate(dateStr || '', data.design?.dateFormat);
  const formattedPeriod =
    formatDateRange(data.servicePeriodStart, data.servicePeriodEnd, data.design?.dateFormat) ||
    data.servicePeriod;

  const rawReceivedDate =
    data.paymentPaid?.paymentDate ||
    data.payments?.[0]?.paymentDate ||
    (isPaidReceipt ? data.invoiceDate : '');
  const receivedDate = rawReceivedDate ? formatDate(rawReceivedDate) : '';

  const isLetter = data.design?.paperFormat === 'letter';
  const sheetWidth = isLetter ? '215.9mm' : '210mm';
  const sheetMinHeight = isLetter ? '279.4mm' : '297mm';
  const paddingVal = `${data.design?.paddingMm ?? 12}mm`;
  const accentColor = data.design?.accentColor || '#0f172a';

  return {
    subtotal,
    discountAmount,
    afterDiscount,
    taxAmount,
    total,
    paymentsTotal,
    isPaidReceipt,
    hasPartialPayments,
    balanceDue,
    hasLineItems,
    formatDate,
    formattedPeriod,
    receivedDate,
    isLetter,
    sheetWidth,
    sheetMinHeight,
    paddingVal,
    accentColor,
  };
}

// Backward compatibility alias
export const useInvoiceCalculations = getInvoiceTemplateData;
