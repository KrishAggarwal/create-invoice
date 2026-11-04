import { configureStore } from '@reduxjs/toolkit';
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import invoiceReducer from './slices/invoiceSlice';
import authReducer from './slices/authSlice';
import directoryReducer from './slices/directorySlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    invoice: invoiceReducer,
    auth: authReducer,
    directory: directoryReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Pre-typed hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
