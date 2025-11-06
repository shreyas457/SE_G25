import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Header from '../Header/Header';

describe('Header Component', () => {
  it('should render header component', () => {
    const { container } = render(<Header />);
    
    expect(container.firstChild).toBeInTheDocument();
  });
});



