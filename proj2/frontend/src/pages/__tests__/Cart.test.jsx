import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Cart from '../Cart/Cart';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';

vi.mock('axios');

const mockStoreContext = {
  cartItems: {
    'food1': 2,
    'food2': 1
  },
  getTotalCartAmount: vi.fn(() => 25.99),
  url: 'http://localhost:4000',
  token: 'mock-token',
  removeFromCart: vi.fn(),
  addToCart: vi.fn(),
  loadCartData: vi.fn(),
  food_list: [],
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

describe('Cart Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({
      data: { success: true, data: [] }
    });
  });

  it('should render cart page', async () => {
    renderWithProviders(<Cart />);

    // Cart page should render
    const { container } = renderWithProviders(<Cart />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle cart data loading', () => {
    axios.get.mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            _id: 'food1',
            name: 'Test Food 1',
            price: 10.99,
            image: 'test-image.jpg'
          }
        ]
      }
    });

    const { container } = renderWithProviders(<Cart />);
    
    // Component should render
    expect(container.firstChild).toBeInTheDocument();
  });
});

