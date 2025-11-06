import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import PlaceOrder from '../PlaceOrder/PlaceOrder';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

vi.mock('axios');
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const mockStoreContext = {
  getTotalCartAmount: vi.fn(() => 25.99),
  token: 'mock-token',
  food_list: [
    { _id: 'food1', name: 'Food 1', price: 10.99 },
    { _id: 'food2', name: 'Food 2', price: 15.00 },
  ],
  cartItems: { food1: 2, food2: 1 },
  url: 'http://localhost:4000',
  setCartItems: vi.fn(),
  currency: '$',
  deliveryCharge: 5,
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

describe('PlaceOrder', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    delete window.location;
    window.location = { replace: vi.fn() };
  });

  it('should render place order form', () => {
    renderWithProviders(<PlaceOrder />);
    expect(screen.getByPlaceholderText('First name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Last name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
  });

  it('should handle form input changes', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PlaceOrder />);

    const firstNameInput = screen.getByPlaceholderText('First name');
    await user.type(firstNameInput, 'John');
    expect(firstNameInput).toHaveValue('John');
  });

  it('should submit COD order successfully', async () => {
    const user = userEvent.setup();
    axios.post.mockResolvedValue({
      data: { success: true, message: 'Order placed successfully' },
    });

    renderWithProviders(<PlaceOrder />);

    await user.type(screen.getByPlaceholderText('First name'), 'John');
    await user.type(screen.getByPlaceholderText('Last name'), 'Doe');
    await user.type(screen.getByPlaceholderText('Email address'), 'john@example.com');
    await user.type(screen.getByPlaceholderText('Street'), '123 Main St');
    await user.type(screen.getByPlaceholderText('City'), 'Raleigh');
    await user.type(screen.getByPlaceholderText('State'), 'NC');
    await user.type(screen.getByPlaceholderText('Zip code'), '27601');
    await user.type(screen.getByPlaceholderText('Country'), 'USA');
    await user.type(screen.getByPlaceholderText('Phone'), '123-456-7890');

    const submitButton = screen.getByRole('button', { name: /place order/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/order/placecod'),
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  it('should switch to Stripe payment and submit', async () => {
    const user = userEvent.setup();
    axios.post.mockResolvedValue({
      data: { success: true, session_url: 'https://stripe.com/checkout' },
    });

    renderWithProviders(<PlaceOrder />);

    const stripeOption = screen.getByText(/stripe/i);
    await user.click(stripeOption);

    await user.type(screen.getByPlaceholderText('First name'), 'John');
    await user.type(screen.getByPlaceholderText('Last name'), 'Doe');
    await user.type(screen.getByPlaceholderText('Email address'), 'john@example.com');
    await user.type(screen.getByPlaceholderText('Street'), '123 Main St');
    await user.type(screen.getByPlaceholderText('City'), 'Raleigh');
    await user.type(screen.getByPlaceholderText('State'), 'NC');
    await user.type(screen.getByPlaceholderText('Zip code'), '27601');
    await user.type(screen.getByPlaceholderText('Country'), 'USA');
    await user.type(screen.getByPlaceholderText('Phone'), '123-456-7890');

    const submitButton = screen.getByRole('button', { name: /proceed to payment/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/order/place'),
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  it('should display cart totals', () => {
    renderWithProviders(<PlaceOrder />);
    expect(screen.getByText(/Cart Totals/i)).toBeInTheDocument();
    expect(screen.getByText(/\$25\.99/)).toBeInTheDocument();
  });

  it('should handle order placement error', async () => {
    const user = userEvent.setup();
    axios.post.mockResolvedValue({
      data: { success: false, message: 'Order failed' },
    });

    renderWithProviders(<PlaceOrder />);

    await user.type(screen.getByPlaceholderText('First name'), 'John');
    await user.type(screen.getByPlaceholderText('Last name'), 'Doe');
    await user.type(screen.getByPlaceholderText('Email address'), 'john@example.com');
    await user.type(screen.getByPlaceholderText('Street'), '123 Main St');
    await user.type(screen.getByPlaceholderText('City'), 'Raleigh');
    await user.type(screen.getByPlaceholderText('State'), 'NC');
    await user.type(screen.getByPlaceholderText('Zip code'), '27601');
    await user.type(screen.getByPlaceholderText('Country'), 'USA');
    await user.type(screen.getByPlaceholderText('Phone'), '123-456-7890');

    const submitButton = screen.getByRole('button', { name: /place order/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Something Went Wrong');
    });
  });
});

