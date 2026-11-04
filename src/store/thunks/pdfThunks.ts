/**
 * PDF Generation Thunks
 * Enterprise pattern: Side effects (PDF download) belong in thunks, not components
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { downloadPDF } from '../../utils/pdf';
import type { RootState } from '../index';

interface DownloadPDFParams {
  previewElement: HTMLDivElement;
}

export const generateAndDownloadPDF = createAsyncThunk<
  void,
  DownloadPDFParams,
  { state: RootState }
>(
  'pdf/generateAndDownload',
  async ({ previewElement }, { getState }) => {
    const state = getState();
    const invoice = state.invoice.current;
    
    const filename = `${invoice.invoiceNumber || 'Invoice'}.pdf`;
    const paperFormat = invoice.design?.paperFormat;
    
    await downloadPDF(previewElement, filename, paperFormat);
  }
);
