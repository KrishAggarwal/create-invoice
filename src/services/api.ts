const API_BASE_URL = '/api';

function getToken(): string | null {
  return localStorage.getItem('devinvoice_token');
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem('devinvoice_token', token);
  } else {
    localStorage.removeItem('devinvoice_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  auth: {
    register: (body: { email: string; password: string; fullName: string; phone: string; workspaceName?: string; entityType?: string }) =>
      request<{ token: string; user: any; workspace: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    login: (body: { email: string; password: string }) =>
      request<{ token: string; user: any; workspace: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    me: () => request<{ user: any; workspace: any; workspaces: any[] }>('/auth/me'),
  },

  workspace: {
    get: () => request<any>('/workspace'),
    update: (body: any) =>
      request<any>('/workspace', {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
  },

  clients: {
    getAll: () => request<any[]>('/clients'),
    create: (body: any) =>
      request<any>('/clients', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    update: (uuid: string, body: any) =>
      request<any>(`/clients/${uuid}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    delete: (uuid: string) =>
      request<any>(`/clients/${uuid}`, {
        method: 'DELETE',
      }),
  },

  accounts: {
    getAll: () => request<any[]>('/accounts'),
    create: (body: any) =>
      request<any>('/accounts', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    update: (uuid: string, body: any) =>
      request<any>(`/accounts/${uuid}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    delete: (uuid: string) =>
      request<any>(`/accounts/${uuid}`, {
        method: 'DELETE',
      }),
  },

  invoices: {
    getAll: (params?: { status?: string; type?: string; search?: string }) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && String(val).trim() !== '' && val !== 'all') {
            searchParams.append(key, String(val).trim());
          }
        });
      }
      const q = searchParams.toString();
      return request<any[]>(`/invoices${q ? `?${q}` : ''}`);
    },
    get: (uuid: string) => request<any>(`/invoices/${uuid}`),
    create: (body: any) =>
      request<any>('/invoices', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    update: (uuid: string, body: any) =>
      request<any>(`/invoices/${uuid}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    delete: (uuid: string) =>
      request<any>(`/invoices/${uuid}`, {
        method: 'DELETE',
      }),
    recordPayment: (uuid: string, body: any) =>
      request<any>(`/invoices/${uuid}/payments`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  pdf: {
    generate: async (body: { html: string; filename: string; paperFormat?: string }): Promise<Blob> => {
      const token = getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_BASE_URL}/pdf/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || `PDF generation failed (${response.status})`);
      }
      return await response.blob();
    },
  },
};
