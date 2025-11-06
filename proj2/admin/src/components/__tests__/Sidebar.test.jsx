import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Sidebar Component (Admin)', () => {
  it('should render sidebar', () => {
    renderWithRouter(<Sidebar />);
    
    // Check for sidebar navigation items
    expect(screen.getByText('Add Items')).toBeInTheDocument();
    expect(screen.getByText('List Items')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Shelters')).toBeInTheDocument();
  });

  it('should have navigation links', () => {
    const { container } = renderWithRouter(<Sidebar />);
    
    const sidebar = container.querySelector('.sidebar');
    expect(sidebar).toBeInTheDocument();
  });
});
