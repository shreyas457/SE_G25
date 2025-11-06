import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FoodDisplay from '../FoodDisplay/FoodDisplay';
import { StoreContext } from '../../Context/StoreContext';

const mockFoodList = [
  {
    _id: 'food1',
    name: 'Pizza',
    description: 'Delicious pizza',
    price: 12.99,
    image: { data: 'base64data', contentType: 'image/png' },
  },
  {
    _id: 'food2',
    name: 'Burger',
    description: 'Tasty burger',
    price: 9.99,
    image: null,
  },
];

const mockStoreContext = {
  food_list: mockFoodList,
  cartItems: {},
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
};

const renderWithStore = (ui, value = {}) => {
  return render(
    <StoreContext.Provider value={{ ...mockStoreContext, ...value }}>
      {ui}
    </StoreContext.Provider>
  );
};

describe('FoodDisplay', () => {
  it('should render food display with heading', () => {
    renderWithStore(<FoodDisplay category="All" />);
    expect(screen.getByText('Top dishes near you')).toBeInTheDocument();
  });

  it('should display food items from context', () => {
    renderWithStore(<FoodDisplay category="All" />);
    expect(screen.getByText('Pizza')).toBeInTheDocument();
    expect(screen.getByText('Burger')).toBeInTheDocument();
  });

  it('should handle empty food list', () => {
    renderWithStore(<FoodDisplay category="All" />, { food_list: [] });
    expect(screen.getByText('Top dishes near you')).toBeInTheDocument();
  });
});
