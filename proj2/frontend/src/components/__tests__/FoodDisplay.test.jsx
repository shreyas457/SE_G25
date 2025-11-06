import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import FoodDisplay from '../FoodDisplay/FoodDisplay';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';

vi.mock('axios');

const mockStoreContext = {
  cartItems: {},
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
  url: 'http://localhost:4000',
  currency: '$',
  food_list: [],
};

describe('FoodDisplay Component', () => {
  it('should render food display component', () => {
    axios.get.mockResolvedValue({
      data: { success: true, data: [] }
    });

    const { container } = render(
      <StoreContext.Provider value={mockStoreContext}>
        <FoodDisplay category="All" />
      </StoreContext.Provider>
    );
    
    expect(container.firstChild).toBeInTheDocument();
  });
});

