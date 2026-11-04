import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import type { InvoiceData, DesignSettings, TemplateStyle } from '../../types/invoice';
import { getDefaultInvoiceData, generateInvoiceNumber } from '../../types/invoice';

interface InvoiceState {
  current: InvoiceData;
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
  saveMessage: string | null;
}

const initialState: InvoiceState = {
  current: getDefaultInvoiceData(),
  isSaving: false,
  isLoading: false,
  error: null,
  saveMessage: null,
};

// Async thunks
export const loadInvoice = createAsyncThunk(
  'invoice/load',
  async (uuid: string) => {
    return await api.invoices.get(uuid);
  }
);

export const saveInvoice = createAsyncThunk(
  'invoice/save',
  async (_, { getState }) => {
    const state = getState() as any;
    const invoice = state.invoice.current;

    if (invoice.uuid) {
      // Update existing
      return await api.invoices.update(invoice.uuid, {
        ...invoice,
        senderSnapshot: invoice.sender,
        clientSnapshot: invoice.client,
        accountSnapshot: invoice.paymentDue?.account,
      });
    } else {
      // Create new
      return await api.invoices.create({
        ...invoice,
        senderSnapshot: invoice.sender,
        clientSnapshot: invoice.client,
        accountSnapshot: invoice.paymentDue?.account,
      });
    }
  }
);

export const deleteInvoice = createAsyncThunk(
  'invoice/delete',
  async (uuid: string) => {
    await api.invoices.delete(uuid);
    return uuid;
  }
);

const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {
    // Update entire invoice
    setInvoice: (state, action: PayloadAction<InvoiceData>) => {
      state.current = action.payload;
    },
    
    // Update partial invoice data
    updateInvoice: (state, action: PayloadAction<Partial<InvoiceData>>) => {
      state.current = { ...state.current, ...action.payload };
    },
    
    // Update sender
    updateSender: (state, action: PayloadAction<InvoiceData['sender']>) => {
      state.current.sender = action.payload;
    },
    
    // Update client
    updateClient: (state, action: PayloadAction<InvoiceData['client']>) => {
      state.current.client = action.payload;
    },
    
    // Update design settings
    updateDesign: (state, action: PayloadAction<Partial<DesignSettings>>) => {
      state.current.design = { ...state.current.design, ...action.payload };
    },
    
    // Change template
    setTemplate: (state, action: PayloadAction<TemplateStyle>) => {
      state.current.template = action.payload;
    },
    
    // Add line item
    addLineItem: (state) => {
      state.current.lineItems.push({
        type: state.current.billingMode || 'fixed',
        title: '',
        subtitle: '',
        hours: 0,
        rate: 0,
        amount: 0,
      });
    },
    
    // Update line item
    updateLineItem: (state, action: PayloadAction<{ index: number; item: Partial<InvoiceData['lineItems'][0]> }>) => {
      const { index, item } = action.payload;
      if (state.current.lineItems[index]) {
        state.current.lineItems[index] = { ...state.current.lineItems[index], ...item };
      }
    },
    
    // Remove line item
    removeLineItem: (state, action: PayloadAction<number>) => {
      state.current.lineItems.splice(action.payload, 1);
    },
    
    // Add payment record
    addPayment: (state, action: PayloadAction<NonNullable<InvoiceData['payments']>[0]>) => {
      if (!state.current.payments) {
        state.current.payments = [];
      }
      state.current.payments.push(action.payload);
    },
    
    // Remove payment record
    removePayment: (state, action: PayloadAction<number>) => {
      if (state.current.payments) {
        state.current.payments.splice(action.payload, 1);
      }
    },
    
    // Reset to new invoice
    resetInvoice: (state, action: PayloadAction<{ workspace?: any }>) => {
      const defaults = getDefaultInvoiceData();
      const { workspace } = action.payload;
      
      if (workspace) {
        defaults.currency = workspace.defaultCurrency || defaults.currency;
        defaults.sender = {
          name: workspace.legalName || workspace.name || '',
          title: workspace.title || '',
          email: workspace.email || '',
          phone: workspace.phone || '',
          address: workspace.address || '',
          logo: workspace.logoUrl || '',
          taxId: workspace.taxId || '',
          entityType: workspace.entityType || 'individual',
        };
      }
      
      state.current = defaults;
      state.error = null;
      state.saveMessage = null;
    },
    
    // Duplicate invoice
    duplicateInvoice: (state) => {
      const duplicated = {
        ...state.current,
        uuid: undefined,
        invoiceNumber: generateInvoiceNumber(),
        status: 'due' as const,
        payments: [],
      };
      state.current = duplicated;
      state.saveMessage = 'Cloned as new draft';
    },
    
    clearSaveMessage: (state) => {
      state.saveMessage = null;
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load invoice
      .addCase(loadInvoice.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadInvoice.fulfilled, (state, action) => {
        const inv = action.payload;
        state.current = {
          uuid: inv.uuid,
          type: inv.type,
          status: inv.status,
          billingMode: inv.billingMode || 'fixed',
          template: inv.template || 'minimal',
          invoiceNumber: inv.invoiceNumber,
          invoiceDate: inv.invoiceDate ? inv.invoiceDate.split('T')[0] : '',
          dueDate: inv.dueDate ? inv.dueDate.split('T')[0] : '',
          servicePeriod: inv.servicePeriod || '',
          servicePeriodStart: inv.servicePeriodStart ? inv.servicePeriodStart.split('T')[0] : '',
          servicePeriodEnd: inv.servicePeriodEnd ? inv.servicePeriodEnd.split('T')[0] : '',
          currency: inv.currency,
          design: inv.design || getDefaultInvoiceData().design,
          sender: inv.senderSnapshot || { name: '', email: '', address: '' },
          client: inv.clientSnapshot || { name: '', companyName: '', email: '', address: '' },
          lineItems: (inv.lineItems || []).map((it: any) => ({
            uuid: it.uuid,
            type: it.type || 'fixed',
            title: it.title || '',
            subtitle: it.subtitle || '',
            hours: it.hours || 0,
            rate: it.rate || 0,
            amount: it.amount || 0,
          })),
          discount: inv.discount || 0,
          discountType: inv.discountType || 'percentage',
          taxRate: inv.taxRate || 0,
          notes: inv.notes || '',
          paymentDue: {
            dueDate: inv.dueDate ? inv.dueDate.split('T')[0] : '',
            paymentTerms: inv.paymentTerms || 'Net 15',
            account: inv.paymentAccount || inv.accountSnapshot || {} as any,
          },
          paymentPaid: {
            paymentDate: inv.invoiceDate ? inv.invoiceDate.split('T')[0] : '',
            paymentMethod: inv.paymentMethod || '',
            transactionId: inv.paymentPaid?.transactionId || '',
          },
          payments: (inv.payments || []).map((p: any) => ({
            uuid: p.uuid,
            amount: p.amount,
            paymentDate: p.paymentDate ? p.paymentDate.split('T')[0] : '',
            paymentMethod: p.paymentMethod,
            transactionRef: p.transactionRef,
            notes: p.notes,
          })),
        };
        state.isLoading = false;
      })
      .addCase(loadInvoice.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to load invoice';
        state.isLoading = false;
      })
      // Save invoice
      .addCase(saveInvoice.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(saveInvoice.fulfilled, (state, action) => {
        const saved = action.payload;
        state.current.uuid = saved.uuid;
        if (saved.lineItems) {
          state.current.lineItems = saved.lineItems.map((it: any) => ({
            ...it,
            uuid: it.uuid,
          }));
        }
        if (saved.payments) {
          state.current.payments = saved.payments.map((p: any) => ({
            ...p,
            uuid: p.uuid,
          }));
        }
        state.isSaving = false;
        state.saveMessage = state.current.uuid ? 'Invoice updated!' : 'Invoice saved!';
      })
      .addCase(saveInvoice.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to save invoice';
        state.isSaving = false;
      })
      // Delete invoice
      .addCase(deleteInvoice.fulfilled, (state) => {
        state.current = getDefaultInvoiceData();
        state.saveMessage = 'Invoice deleted';
      });
  },
});

export const {
  setInvoice,
  updateInvoice,
  updateSender,
  updateClient,
  updateDesign,
  setTemplate,
  addLineItem,
  updateLineItem,
  removeLineItem,
  addPayment,
  removePayment,
  resetInvoice,
  duplicateInvoice,
  clearSaveMessage,
  clearError,
} = invoiceSlice.actions;

export default invoiceSlice.reducer;
