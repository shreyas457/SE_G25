import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, useSearchParams } from 'react-router-dom';
import Verify from '../Verify/Verify';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

vi.mock('axios');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useSearchParams: vi.fn(),
  };
});

const mockStoreContext = {
  url: 'http://localhost:4000',
};

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <StoreContext.Provider value={mockStoreContext}>
        {component}
      </StoreContext.Provider>
    </BrowserRouter>
  );
};

describe('Verify', () => {
  const mockNavigate = vi.fn();
  const mockSearchParams = {
    get: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useSearchParams.mockReturnValue([mockSearchParams, vi.fn()]);
  });

  it('should render loading spinner', () => {
    mockSearchParams.get.mockImplementation((key) => {
      if (key === 'success') return 'true';
      if (key === 'orderId') return 'order123';
      return null;
    });

    axios.post.mockResolvedValue({
      data: { success: true },
    });

    const { container } = renderWithProviders(<Verify />);
    expect(container.querySelector('.spinner')).toBeInTheDocument();
  });

  it('should verify payment successfully and navigate to myorders', async () => {
    mockSearchParams.get.mockImplementation((key) => {
      if (key === 'success') return 'true';
      if (key === 'orderId') return 'order123';
      return null;
    });

    const mockPost = vi.fn().mockResolvedValue({
      data: { success: true },
    });
    axios.post = mockPost;

    renderWithProviders(<Verify />);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        'http://localhost:4000/api/order/verify',
        { success: 'true', orderId: 'order123' }
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/myorders');
    }, { timeout: 3000 });
  });

  it('should navigate to home on verification failure', async () => {
    mockSearchParams.get.mockImplementation((key) => {
      if (key === 'success') return 'false';
      if (key === 'orderId') return 'order123';
      return null;
    });

    const mockPost = vi.fn().mockResolvedValue({
      data: { success: false },
    });
    axios.post = mockPost;

    renderWithProviders(<Verify />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    }, { timeout: 3000 });
  });
});

