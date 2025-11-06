import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('App (Admin)', () => {
  it('should render app with navbar and sidebar', () => {
    renderWithRouter(<App />);
    expect(document.querySelector('.app')).toBeInTheDocument();
    expect(document.querySelector('.app-content')).toBeInTheDocument();
  });
});

