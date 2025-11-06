import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from '../Header/Header';

describe('Header', () => {
  it('should render header content', () => {
    render(<Header />);
    expect(screen.getByText(/Byte into the future/i)).toBeInTheDocument();
    expect(screen.getByText(/Elevate your dining experience/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View Menu/i })).toBeInTheDocument();
  });
});
