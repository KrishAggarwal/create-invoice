import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './app.layout';
import { AuthGuard } from './features/auth/auth.guard';

// Lazy load heavy routes
const EditorPage = lazy(() => import('./features/editor/editor.page'));
const InvoicesPage = lazy(() => import('./features/invoices/invoices.page'));
const InvoicesLayout = lazy(() => import('./features/invoices/invoices.layout'));
const TemplatesPage = lazy(() => import('./features/templates/templates.page'));
const TemplatesLayout = lazy(() => import('./features/templates/templates.layout'));
const ProfilePage = lazy(() => import('./features/profile/profile.page'));
const ProfileLayout = lazy(() => import('./features/profile/profile.layout'));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="text-xs text-slate-400 animate-pulse">Loading...</div>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        {/* 1. Invoice Editor Route (Default /) */}
        <Route index element={
          <Suspense fallback={<LoadingFallback />}>
            <EditorPage />
          </Suspense>
        } />
        <Route path="editor" element={
          <Suspense fallback={<LoadingFallback />}>
            <EditorPage />
          </Suspense>
        } />

        {/* 2. Invoices Directory Route (Auth Guarded) */}
        <Route
          path="invoices"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <AuthGuard>
                <InvoicesLayout />
              </AuthGuard>
            </Suspense>
          }
        >
          <Route index element={
            <Suspense fallback={<LoadingFallback />}>
              <InvoicesPage />
            </Suspense>
          } />
        </Route>

        {/* 3. Templates Gallery Route */}
        <Route path="templates" element={
          <Suspense fallback={<LoadingFallback />}>
            <TemplatesLayout />
          </Suspense>
        }>
          <Route index element={
            <Suspense fallback={<LoadingFallback />}>
              <TemplatesPage />
            </Suspense>
          } />
        </Route>

        {/* 4. Profile & Payment Details Route (Auth Guarded) */}
        <Route
          path="profile"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <AuthGuard>
                <ProfileLayout />
              </AuthGuard>
            </Suspense>
          }
        >
          <Route index element={
            <Suspense fallback={<LoadingFallback />}>
              <ProfilePage />
            </Suspense>
          } />
        </Route>

        {/* Catch-all redirect to / */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

