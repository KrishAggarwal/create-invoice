/**
 * Invoice Selectors - Derived/Computed State
 * Enterprise pattern: Keep business logic for computed values here
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import {
  calculateSubtotal,
  calculateDiscount,
  calculateTax,
  calculateTotal,
  calculatePaymentsTotal,
} from '../../types/invoice';

// Base selectors
export const selectInvoiceCurrent = (state: RootState) => state.invoice.current;
export const selectInvoiceLoading = (state: RootState) => state.invoice.isLoading;
export const selectInvoiceSaving = (state: RootState) => state.invoice.isSaving;
export const selectInvoiceError = (state: RootState) => state.invoice.error;
export const selectInvoiceSaveMessage = (state: RootState) => state.invoice.saveMessage;

// Computed selectors - Memoized for performance
export const selectInvoiceCalculations = createSelector(
  [selectInvoiceCurrent],
  (invoice) => {
    const subtotal = calculateSubtotal(invoice.lineItems);
    const discountAmount = calculateDiscount(subtotal, invoice.discount, invoice.discountType);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = calculateTax(afterDiscount, invoice.taxRate);
    const total = calculateTotal(subtotal, discountAmount, taxAmount);
    const paymentsTotal = calculatePaymentsTotal(invoice.payments);
    const balanceDue = Math.max(0, total - paymentsTotal);

    return {
      subtotal,
      discountAmount,
      afterDiscount,
      taxAmount,
      total,
      paymentsTotal,
      balanceDue,
      isPaidReceipt: invoice.type === 'paid',
      hasPartialPayments: (invoice.payments?.length ?? 0) > 0,
      hasLineItems: invoice.lineItems.length > 0 && invoice.lineItems.some(item => item.title.trim() !== ''),
    };
  }
);

// Design selectors
export const selectInvoiceDesign = (state: RootState) => state.invoice.current.design;
export const selectInvoiceTemplate = (state: RootState) => state.invoice.current.template;

// Entity selectors
export const selectInvoiceSender = (state: RootState) => state.invoice.current.sender;
export const selectInvoiceClient = (state: RootState) => state.invoice.current.client;
export const selectInvoiceLineItems = (state: RootState) => state.invoice.current.lineItems;
export const selectInvoicePayments = (state: RootState) => state.invoice.current.payments || [];

// Status selectors
export const selectInvoiceUuid = (state: RootState) => state.invoice.current.uuid;
export const selectInvoiceNumber = (state: RootState) => state.invoice.current.invoiceNumber;
export const selectInvoiceType = (state: RootState) => state.invoice.current.type;
export const selectInvoiceStatus = (state: RootState) => state.invoice.current.status;

// Validation selectors
export const selectIsInvoiceModified = createSelector(
  [selectInvoiceUuid],
  (uuid) => !uuid // If no uuid, it's a new/unsaved invoice
);

export const selectCanSaveInvoice = createSelector(
  [selectInvoiceSaving, selectInvoiceLineItems, selectInvoiceClient],
  (isSaving, lineItems, client) => {
    if (isSaving) return false;
    // At least one line item with content
    const hasValidLineItems = lineItems.some(item => item.title.trim() !== '');
    // Client name is required
    const hasClient = client.name.trim() !== '' || client.companyName.trim() !== '';
    return hasValidLineItems && hasClient;
  }
);
