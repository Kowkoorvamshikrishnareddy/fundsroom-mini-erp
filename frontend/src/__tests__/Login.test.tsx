import { screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../pages/Login';
import { renderWithProviders } from '../test-utils';
import { vi } from 'vitest';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('Login Component', () => {
  it('renders login form', () => {
    renderWithProviders(<Login />);
    expect(screen.getByPlaceholderText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows error on invalid login', async () => {
    (api.post as any).mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } }
    });

    renderWithProviders(<Login />);
    
    fireEvent.change(screen.getByPlaceholderText('admin@example.com'), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('calls login context on successful login', async () => {
    const mockLogin = vi.fn();
    (api.post as any).mockResolvedValueOnce({
      data: { data: { token: 'fake-token', user: { name: 'Admin', role: 'ADMIN' } } }
    });

    renderWithProviders(<Login />, {
      providerProps: { login: mockLogin, user: null, token: null, loading: false, logout: vi.fn(), getMe: vi.fn() }
    });

    fireEvent.change(screen.getByPlaceholderText('admin@example.com'), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('fake-token', { name: 'Admin', role: 'ADMIN' });
    });
  });
});
