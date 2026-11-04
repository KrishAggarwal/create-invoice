/**
 * Invoice Editor Hook - Presentation Layer
 * 
 * Enterprise pattern: Thin hooks that provide clean component API
 * All business logic stays in Redux (slices, thunks, selectors)
 * This hook is just a convenient adapter for components
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
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
  saveInvoice,
  loadInvoice,
  deleteInvoice,
  clearSaveMessage,
  clearError,
} from '../store/slices/invoiceSlice';
import { loadDirectory } from '../store/slices/directorySlice';
import { generateAndDownloadPDF } from '../store/thunks/pdfThunks';
import {
  selectInvoiceCurrent,
  selectInvoiceLoading,
  selectInvoiceSaving,
  selectInvoiceError,
  selectInvoiceSaveMessage,
  selectInvoiceCalculations,
} from '../store/selectors/invoiceSelectors';
import {
  selectClients,
  selectAccounts,
} from '../store/selectors/directorySelectors';
import type { InvoiceData, DesignSettings, TemplateStyle } from '../types/invoice';

/**
 * Main hook for invoice editing operations
 * Provides a clean, type-safe API for components
 */
export function useInvoiceEditor() {
  const dispatch = useAppDispatch();
  
  // Selectors
  const invoice = useAppSelector(selectInvoiceCurrent);
  const isLoading = useAppSelector(selectInvoiceLoading);
  const isSaving = useAppSelector(selectInvoiceSaving);
  const error = useAppSelector(selectInvoiceError);
  const saveMessage = useAppSelector(selectInvoiceSaveMessage);
  const calculations = useAppSelector(selectInvoiceCalculations);
  const clients = useAppSelector(selectClients);
  const accounts = useAppSelector(selectAccounts);
  const workspace = useAppSelector(state => state.auth.workspace);

  // Action dispatchers
  const handleUpdateInvoice = useCallback(
    (data: Partial<InvoiceData>) => {
      dispatch(updateInvoice(data));
    },
    [dispatch]
  );

  const handleUpdateSender = useCallback(
    (sender: InvoiceData['sender']) => {
      dispatch(updateSender(sender));
    },
    [dispatch]
  );

  const handleUpdateClient = useCallback(
    (client: InvoiceData['client']) => {
      dispatch(updateClient(client));
    },
    [dispatch]
  );

  const handleUpdateDesign = useCallback(
    (design: Partial<DesignSettings>) => {
      dispatch(updateDesign(design));
    },
    [dispatch]
  );

  const handleSetTemplate = useCallback(
    (template: TemplateStyle) => {
      dispatch(setTemplate(template));
    },
    [dispatch]
  );

  const handleAddLineItem = useCallback(() => {
    dispatch(addLineItem());
  }, [dispatch]);

  const handleUpdateLineItem = useCallback(
    (index: number, item: Partial<InvoiceData['lineItems'][0]>) => {
      dispatch(updateLineItem({ index, item }));
    },
    [dispatch]
  );

  const handleRemoveLineItem = useCallback(
    (index: number) => {
      dispatch(removeLineItem(index));
    },
    [dispatch]
  );

  const handleAddPayment = useCallback(
    (payment: NonNullable<InvoiceData['payments']>[0]) => {
      dispatch(addPayment(payment));
    },
    [dispatch]
  );

  const handleRemovePayment = useCallback(
    (index: number) => {
      dispatch(removePayment(index));
    },
    [dispatch]
  );

  const handleReset = useCallback(() => {
    dispatch(resetInvoice({ workspace }));
  }, [dispatch, workspace]);

  const handleDuplicate = useCallback(() => {
    dispatch(duplicateInvoice());
  }, [dispatch]);

  const handleSave = useCallback(async () => {
    const result = await dispatch(saveInvoice()).unwrap();
    return result.uuid;
  }, [dispatch]);

  const handleLoad = useCallback(
    async (uuid: string) => {
      await dispatch(loadInvoice(uuid)).unwrap();
    },
    [dispatch]
  );

  const handleDelete = useCallback(
    async (uuid: string) => {
      await dispatch(deleteInvoice(uuid)).unwrap();
    },
    [dispatch]
  );

  const handleDownloadPDF = useCallback(
    async (previewElement: HTMLDivElement) => {
      await dispatch(generateAndDownloadPDF({ previewElement })).unwrap();
    },
    [dispatch]
  );

  const handleClearSaveMessage = useCallback(() => {
    dispatch(clearSaveMessage());
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleLoadDirectory = useCallback(() => {
    dispatch(loadDirectory());
  }, [dispatch]);

  return {
    // State
    invoice,
    isLoading,
    isSaving,
    error,
    saveMessage,
    calculations,
    clients,
    accounts,
    
    // Actions
    updateInvoice: handleUpdateInvoice,
    updateSender: handleUpdateSender,
    updateClient: handleUpdateClient,
    updateDesign: handleUpdateDesign,
    setTemplate: handleSetTemplate,
    addLineItem: handleAddLineItem,
    updateLineItem: handleUpdateLineItem,
    removeLineItem: handleRemoveLineItem,
    addPayment: handleAddPayment,
    removePayment: handleRemovePayment,
    reset: handleReset,
    duplicate: handleDuplicate,
    save: handleSave,
    load: handleLoad,
    deleteInvoice: handleDelete,
    downloadPDF: handleDownloadPDF,
    clearSaveMessage: handleClearSaveMessage,
    clearError: handleClearError,
    loadDirectory: handleLoadDirectory,
  };
}
