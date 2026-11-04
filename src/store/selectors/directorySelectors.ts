/**
 * Directory Selectors - Clients & Accounts
 */

import type { RootState } from '../index';

export const selectClients = (state: RootState) => state.directory.clients;
export const selectAccounts = (state: RootState) => state.directory.accounts;
export const selectDirectoryLoading = (state: RootState) => state.directory.isLoading;

// Helper selectors
export const selectClientByUuid = (state: RootState, uuid: string) =>
  state.directory.clients.find(c => c.uuid === uuid);

export const selectAccountByUuid = (state: RootState, uuid: string) =>
  state.directory.accounts.find(a => a.uuid === uuid);
