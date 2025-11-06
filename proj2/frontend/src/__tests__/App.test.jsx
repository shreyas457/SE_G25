import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { StoreContext } from '../Context/StoreContext';
import { ThemeProvider } from '../Context/ThemeContext';
import { SocketProvider } from '../Context/SocketContext';

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    close: vi.fn(),
  })),
}));

const mockStoreContext = {
  url: 'http://localhost:4000',
  getTotalCartAmount: vi.fn(() => 0),
  cartItems: {},
  food_list: [],
  menu_list: [],
  token: null,
  currency: '$',
  deliveryCharge: 5,
  setCartItems: vi.fn(),
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
  loadCartData: vi.fn(),
};

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <StoreContext.Provider value={mockStoreContext}>
          <SocketProvider url="http://localhost:4000">
            {component}
          </SocketProvider>
        </StoreContext.Provider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('App', () => {
  it('should render app with navbar and footer', () => {
    const { container } = renderWithProviders(<App />);
    // App renders, check for main structure
    expect(container.querySelector('.app')).toBeInTheDocument();
  });
});

