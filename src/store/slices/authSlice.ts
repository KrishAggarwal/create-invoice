import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, setToken } from '../../services/api';

interface User {
  uuid: string;
  email: string;
  fullName: string;
}

interface Workspace {
  uuid: string;
  name: string;
  entityType: 'individual' | 'agency';
  legalName?: string;
  taxId?: string;
  logoUrl?: string;
  defaultCurrency: string;
  address?: string;
  phone?: string;
  email?: string;
  title?: string;
}

interface AuthState {
  user: User | null;
  workspace: Workspace | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  workspace: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Async thunks
export const initializeAuth = createAsyncThunk('auth/initialize', async () => {
  const token = localStorage.getItem('devinvoice_token');
  if (!token) {
    throw new Error('No token found');
  }
  return await api.auth.me();
});

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await api.auth.login(credentials);
    setToken(response.token);
    return response;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    workspaceName?: string;
    entityType?: string;
  }) => {
    const response = await api.auth.register(data);
    setToken(response.token);
    return response;
  }
);

export const updateWorkspace = createAsyncThunk(
  'auth/updateWorkspace',
  async (data: Partial<Workspace>) => {
    return await api.workspace.update(data);
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.workspace = null;
      state.isAuthenticated = false;
      setToken(null);
      localStorage.clear();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.workspace = action.payload.workspace;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      })
      // Login
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.workspace = action.payload.workspace;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.error.message || 'Login failed';
      })
      // Register
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.workspace = action.payload.workspace;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.error = action.error.message || 'Registration failed';
      })
      // Update workspace
      .addCase(updateWorkspace.fulfilled, (state, action) => {
        state.workspace = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
