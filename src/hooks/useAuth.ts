import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { initializeAuth, login as loginAction, register as registerAction, logout as logoutAction, updateWorkspace as updateWorkspaceAction } from '../store/slices/authSlice';

export function useAuth() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  const login = async (email: string, password: string) => {
    await dispatch(loginAction({ email, password })).unwrap();
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    phone: string,
    workspaceName?: string,
    entityType?: string
  ) => {
    await dispatch(registerAction({ email, password, fullName, phone, workspaceName, entityType })).unwrap();
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  const updateWorkspace = async (data: any) => {
    await dispatch(updateWorkspaceAction(data)).unwrap();
  };

  return {
    user: auth.user,
    workspace: auth.workspace,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    login,
    register,
    logout,
    updateWorkspace,
  };
}
