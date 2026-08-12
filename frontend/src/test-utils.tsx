import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';

import { vi } from 'vitest';
import { ToastProvider } from './contexts/ToastContext';

export const renderWithProviders = (
  ui: React.ReactElement,
  {
    providerProps = {
      user: null,
      token: null,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      getMe: vi.fn()
    },
    ...renderOptions
  } = {}
) => {
  return render(
    <ToastProvider>
      <AuthContext.Provider value={providerProps as any}>
        <BrowserRouter>{ui}</BrowserRouter>
      </AuthContext.Provider>
    </ToastProvider>,
    renderOptions
  );
};
