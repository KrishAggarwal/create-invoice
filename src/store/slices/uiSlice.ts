import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  editorTab: 'invoice' | 'design';
  showMobilePreview: boolean;
  showAuthModal: boolean;
  showDownloadSuccessModal: boolean;
  previewMode: 'real' | 'sample';
}

const initialState: UIState = {
  editorTab: 'invoice',
  showMobilePreview: false,
  showAuthModal: false,
  showDownloadSuccessModal: false,
  previewMode: 'real',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setEditorTab: (state, action: PayloadAction<'invoice' | 'design'>) => {
      state.editorTab = action.payload;
      state.showMobilePreview = false;
    },
    setShowMobilePreview: (state, action: PayloadAction<boolean>) => {
      state.showMobilePreview = action.payload;
    },
    setShowAuthModal: (state, action: PayloadAction<boolean>) => {
      state.showAuthModal = action.payload;
    },
    setShowDownloadSuccessModal: (state, action: PayloadAction<boolean>) => {
      state.showDownloadSuccessModal = action.payload;
    },
    setPreviewMode: (state, action: PayloadAction<'real' | 'sample'>) => {
      state.previewMode = action.payload;
    },
  },
});

export const { 
  setEditorTab, 
  setShowMobilePreview, 
  setShowAuthModal, 
  setShowDownloadSuccessModal,
  setPreviewMode 
} = uiSlice.actions;
export default uiSlice.reducer;
