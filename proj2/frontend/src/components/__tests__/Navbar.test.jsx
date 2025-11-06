import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import { StoreContext } from '../../Context/StoreContext';
import { ThemeContext } from '../../Context/ThemeContext';

const mockStoreContext = {
  getTotalCartAmount: vi.fn(() => 5),
  token: '',
  setToken: vi.fn(),
  cartItems: {},
};

const mockThemeContext = {
  theme: 'light',
  toggleTheme: vi.fn(),
};

const renderWithProviders = (component, storeContext = mockStoreContext, themeContext = mockThemeContext) => {
  return render(
    <BrowserRouter>
      <StoreContext.Provider value={storeContext}>
        <ThemeContext.Provider value={themeContext}>
          {component}
        </ThemeContext.Provider>
      </StoreContext.Provider>
    </BrowserRouter>
  );
};

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render navbar with logo', () => {
    const setShowLogin = vi.fn();
    renderWithProviders(<Navbar setShowLogin={setShowLogin} />);

    expect(screen.getByAltText('ByteBite Logo')).toBeInTheDocument();
  });

  it('should render navigation menu items', () => {
    const setShowLogin = vi.fn();
    renderWithProviders(<Navbar setShowLogin={setShowLogin} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Mobile App')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });

  it('should show Sign In button when not logged in', () => {
    const setShowLogin = vi.fn();
    renderWithProviders(<Navbar setShowLogin={setShowLogin} />);

    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('should show profile icon when logged in', () => {
    const setShowLogin = vi.fn();
    const loggedInContext = {
      ...mockStoreContext,
      token: 'mock-token',
    };

    renderWithProviders(<Navbar setShowLogin={setShowLogin} />, loggedInContext);

    expect(screen.getByAltText('Profile')).toBeInTheDocument();
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
  });

  it('should call setShowLogin when Sign In is clicked', () => {
    const setShowLogin = vi.fn();
    renderWithProviders(<Navbar setShowLogin={setShowLogin} />);

    const signInButton = screen.getByText('Sign In');
    fireEvent.click(signInButton);

    expect(setShowLogin).toHaveBeenCalledWith(true);
  });

  it('should toggle theme when theme button is clicked', () => {
    const setShowLogin = vi.fn();
    renderWithProviders(<Navbar setShowLogin={setShowLogin} />);

    const themeButton = screen.getByLabelText('Toggle Theme');
    fireEvent.click(themeButton);

    expect(mockThemeContext.toggleTheme).toHaveBeenCalled();
  });

  it('should show cart with dot when items are in cart', () => {
    const setShowLogin = vi.fn();
    renderWithProviders(<Navbar setShowLogin={setShowLogin} />);

    expect(mockStoreContext.getTotalCartAmount).toHaveBeenCalled();
  });

  it('should navigate to orders when logged in user clicks orders', () => {
    const setShowLogin = vi.fn();
    const loggedInContext = {
      ...mockStoreContext,
      token: 'mock-token',
    };

    renderWithProviders(<Navbar setShowLogin={setShowLogin} />, loggedInContext);

    // Click on profile to open dropdown
    const profileIcon = screen.getByAltText('Profile');
    fireEvent.click(profileIcon);

    // The orders option should be in the dropdown
    expect(screen.getByText('Orders')).toBeInTheDocument();
  });

  it('should handle logout', () => {
    const setShowLogin = vi.fn();
    localStorage.setItem('token', 'mock-token');
    
    const loggedInContext = {
      ...mockStoreContext,
      token: 'mock-token',
    };

    renderWithProviders(<Navbar setShowLogin={setShowLogin} />, loggedInContext);

    const profileIcon = screen.getByAltText('Profile');
    fireEvent.click(profileIcon);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(loggedInContext.setToken).toHaveBeenCalledWith('');
    expect(localStorage.getItem('token')).toBeNull();
  });
});



