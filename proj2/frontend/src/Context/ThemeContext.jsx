import React, { createContext, useEffect, useState } from 'react';

export const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

/**
 * ThemeProvider - Context provider for theme management (light/dark mode)
 * Persists theme preference in localStorage and applies it to document
 * @param {Object} props - React component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {JSX.Element} ThemeContext provider with theme and toggleTheme
 */
export const ThemeProvider = ({ children }) => {
  // read from localStorage once; default light
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    // set an attribute on <html> and a class on <body> for CSS to hook into
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  /**
   * Toggles between light and dark theme
   * @returns {void}
   */
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

