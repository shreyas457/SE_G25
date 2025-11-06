import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ShelterHistory from '../ShelterHistory/ShelterHistory';
import axios from 'axios';
import { toast } from 'react-toastify';

vi.mock('axios');
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const mockReroutes = [
  {
    _id: 'r1',
    orderId: 'order1',
    order: { orderNumber: 'ORD-001' },
    restaurant: { name: 'Restaurant A' },
    restaurantName: 'Restaurant A',
    shelter: { name: 'Shelter 1' },
    shelterName: 'Shelter 1',
    items: [{ name: 'Food 1', qty: 2 }],
    total: 25.99,
    reason: 'Cancelled order',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'r2',
    orderId: 'order2',
    order: { orderNumber: 'ORD-002' },
    restaurant: { name: 'Restaurant B' },
    restaurantName: 'Restaurant B',
    shelter: { name: 'Shelter 2' },
    shelterName: 'Shelter 2',
    items: [{ name: 'Food 2', qty: 1 }],
    total: 15.50,
    reason: 'Redistribution',
    createdAt: new Date().toISOString(),
  },
];

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ShelterHistory Page (Admin)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render shelter history page', async () => {
    axios.get.mockResolvedValue({
      data: { success: true, data: mockReroutes, total: 2, page: 1 },
    });

    renderWithRouter(<ShelterHistory />);

    await waitFor(() => {
      expect(screen.getByText('Shelter Redistribution History')).toBeInTheDocument();
    });
  });

  it('should display reroute records', async () => {
    axios.get.mockResolvedValue({
      data: { success: true, data: mockReroutes, total: 2, page: 1 },
    });

    renderWithRouter(<ShelterHistory />);

    await waitFor(() => {
      expect(screen.getByText('ORD-001')).toBeInTheDocument();
      expect(screen.getByText('Restaurant A')).toBeInTheDocument();
      expect(screen.getByText('Shelter 1')).toBeInTheDocument();
    });
  });

  it('should filter records by search query', async () => {
    axios.get.mockResolvedValue({
      data: { success: true, data: mockReroutes, total: 2, page: 1 },
    });

    renderWithRouter(<ShelterHistory />);

    await waitFor(() => {
      expect(screen.getByText('ORD-001')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Filter by order/i);
    fireEvent.change(searchInput, { target: { value: 'ORD-001' } });

    await waitFor(() => {
      expect(screen.getByText('ORD-001')).toBeInTheDocument();
      expect(screen.queryByText('ORD-002')).not.toBeInTheDocument();
    });
  });

  it('should handle pagination', async () => {
    axios.get.mockResolvedValue({
      data: { success: true, data: mockReroutes, total: 25, page: 1, limit: 20 },
    });

    renderWithRouter(<ShelterHistory />);

    await waitFor(() => {
      expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/reroutes'),
        expect.objectContaining({
          params: expect.objectContaining({ page: 2 }),
        })
      );
    });
  });

  it('should handle empty results', async () => {
    axios.get.mockResolvedValue({
      data: { success: true, data: [], total: 0, page: 1 },
    });

    renderWithRouter(<ShelterHistory />);

    await waitFor(() => {
      expect(screen.getByText(/No redistribution records yet/i)).toBeInTheDocument();
    });
  });

  it('should handle fetch error', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));

    renderWithRouter(<ShelterHistory />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error while fetching shelter history');
    });
  });

  it('should display items as chips', async () => {
    axios.get.mockResolvedValue({
      data: { success: true, data: mockReroutes, total: 2, page: 1 },
    });

    renderWithRouter(<ShelterHistory />);

    await waitFor(() => {
      expect(screen.getByText(/Food 1/)).toBeInTheDocument();
      expect(screen.getByText(/× 2/)).toBeInTheDocument();
    });
  });
});

