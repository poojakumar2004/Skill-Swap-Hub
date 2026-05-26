import React, { createContext, useContext, useState, useEffect } from 'react';
import http from '../services/http';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('skillswap_theme') || 'light';
  });

  // Load theme from backend on mount (if logged in)
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      http.get('/users/settings', { skipAuthRedirect: true })
        .then((res) => {
          if (res.data?.theme) {
            setTheme(res.data.theme);
            localStorage.setItem('skillswap_theme', res.data.theme);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('skillswap_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
