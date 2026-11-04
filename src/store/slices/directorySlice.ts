import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import type { PaymentAccount, SavedClient } from '../../types/invoice';

interface DirectoryState {
  clients: SavedClient[];
  accounts: PaymentAccount[];
  isLoading: boolean;
}

const initialState: DirectoryState = {
  clients: [],
  accounts: [],
  isLoading: false,
};

// Async thunks
export const loadDirectory = createAsyncThunk(
  'directory/load',
  async () => {
    const [clients, accounts] = await Promise.all([
      api.clients.getAll(),
      api.accounts.getAll(),
    ]);
    return { clients, accounts };
  }
);

export const saveClient = createAsyncThunk(
  'directory/saveClient',
  async (client: SavedClient) => {
    if (client.uuid) {
      return await api.clients.update(client.uuid, client);
    } else {
      return await api.clients.create(client);
    }
  }
);

export const deleteClient = createAsyncThunk(
  'directory/deleteClient',
  async (uuid: string) => {
    await api.clients.delete(uuid);
    return uuid;
  }
);

export const saveAccount = createAsyncThunk(
  'directory/saveAccount',
  async (account: PaymentAccount) => {
    if (account.uuid) {
      return await api.accounts.update(account.uuid, account);
    } else {
      return await api.accounts.create(account);
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'directory/deleteAccount',
  async (uuid: string) => {
    await api.accounts.delete(uuid);
    return uuid;
  }
);

const directorySlice = createSlice({
  name: 'directory',
  initialState,
  reducers: {
    clearDirectory: (state) => {
      state.clients = [];
      state.accounts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Load directory
      .addCase(loadDirectory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadDirectory.fulfilled, (state, action) => {
        state.clients = action.payload.clients;
        state.accounts = action.payload.accounts;
        state.isLoading = false;
      })
      .addCase(loadDirectory.rejected, (state) => {
        state.isLoading = false;
      })
      // Save client
      .addCase(saveClient.fulfilled, (state, action) => {
        const saved = action.payload;
        const index = state.clients.findIndex(c => c.uuid === saved.uuid);
        if (index >= 0) {
          state.clients[index] = saved;
        } else {
          state.clients.push(saved);
        }
      })
      // Delete client
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.clients = state.clients.filter(c => c.uuid !== action.payload);
      })
      // Save account
      .addCase(saveAccount.fulfilled, (state, action) => {
        const saved = action.payload;
        const index = state.accounts.findIndex(a => a.uuid === saved.uuid);
        if (index >= 0) {
          state.accounts[index] = saved;
        } else {
          state.accounts.push(saved);
        }
      })
      // Delete account
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.accounts = state.accounts.filter(a => a.uuid !== action.payload);
      });
  },
});

export const { clearDirectory } = directorySlice.actions;
export default directorySlice.reducer;
