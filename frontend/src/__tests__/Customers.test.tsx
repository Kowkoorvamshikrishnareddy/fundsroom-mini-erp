import { screen, waitFor } from '@testing-library/react';
import Customers from '../pages/Customers';
import { renderWithProviders } from '../test-utils';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('Customers Component', () => {
  it('renders customers list and hides add button for WAREHOUSE role', async () => {
    (api.get as any).mockResolvedValueOnce({
      data: {
        data: [
          { id: '1', name: 'John Doe', mobile: '1234567890', customer_type: 'RETAIL', status: 'ACTIVE' }
        ]
      }
    });

    renderWithProviders(<Customers />, {
      providerProps: { user: { role: 'WAREHOUSE' }, token: 'token', loading: false, login: vi.fn(), logout: vi.fn(), getMe: vi.fn() } as any
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // WAREHOUSE role shouldn't see Add button
    expect(screen.queryByText(/Add Customer/i)).not.toBeInTheDocument();
  });

  it('shows add button for ADMIN role', async () => {
    (api.get as any).mockResolvedValueOnce({ data: { data: [] } });

    renderWithProviders(<Customers />, {
      providerProps: { user: { role: 'ADMIN' }, token: 'token', loading: false, login: vi.fn(), logout: vi.fn(), getMe: vi.fn() } as any
    });

    await waitFor(() => {
      expect(screen.getByText(/Add Customer/i)).toBeInTheDocument();
    });
  });
});
