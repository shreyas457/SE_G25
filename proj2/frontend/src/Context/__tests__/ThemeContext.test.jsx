import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React, { useContext } from 'react';
import { ThemeContext, ThemeProvider } from '../ThemeContext';

const Consumer = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <button onClick={toggleTheme}>Theme: {theme}</button>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => key === 'theme' ? 'light' : null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    document.documentElement.setAttribute('data-theme', '');
    document.body.className = '';
  });

  it('initializes from localStorage and toggles theme', () => {
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    );

    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent('Theme: light');

    btn.click();
    expect(btn).toHaveTextContent('Theme: dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.body.classList.contains('dark')).toBe(true);
  });
});




