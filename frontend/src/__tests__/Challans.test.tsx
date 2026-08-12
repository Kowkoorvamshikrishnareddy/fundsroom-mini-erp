import { screen, waitFor } from '@testing-library/react';
import Challans from '../pages/Challans';
import { renderWithProviders } from '../test-utils';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('Challans Component', () => {
  it('renders challans list correctly', async () => {
    (api.get as any).mockResolvedValueOnce({
      data: {
        data: [
          { id: '1', challan_number: 'CHAL-001', status: 'DRAFT', customer: { name: 'Test Customer' }, total_quantity: 10, created_at: new Date().toISOString() }
        ]
      }
    });

    renderWithProviders(<Challans />, {
      providerProps: { user: { role: 'ADMIN' }, token: 'token', loading: false, login: vi.fn(), logout: vi.fn(), getMe: vi.fn() } as any
    });

    await waitFor(() => {
      expect(screen.getByText('CHAL-001')).toBeInTheDocument();
      expect(screen.getByText('Test Customer')).toBeInTheDocument();
      expect(screen.getByText('DRAFT')).toBeInTheDocument();
    });
  });
});
