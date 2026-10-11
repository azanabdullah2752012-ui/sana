import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemePreference, AccentColor } from '../types/database';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => void;
  accentColor: AccentColor;
  setAccentColor: (accent: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(() => {
    const saved = localStorage.getItem('sana_theme_pref');
    return (saved as ThemePreference) || 'light';
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const saved = localStorage.getItem('sana_accent_color');
    return (saved as AccentColor) || 'blush';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateResolvedTheme = () => {
      if (themePreference === 'dark') {
        setResolvedTheme('dark');
      } else if (themePreference === 'light') {
        setResolvedTheme('light');
      } else {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    updateResolvedTheme();
    mediaQuery.addEventListener('change', updateResolvedTheme);
    return () => mediaQuery.removeEventListener('change', updateResolvedTheme);
  }, [themePreference]);

  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [resolvedTheme]);

  const setThemePreference = (pref: ThemePreference) => {
    setThemePreferenceState(pref);
    localStorage.setItem('sana_theme_pref', pref);
  };

  const setAccentColor = (accent: AccentColor) => {
    setAccentColorState(accent);
    localStorage.setItem('sana_accent_color', accent);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: resolvedTheme,
        themePreference,
        setThemePreference,
        accentColor,
        setAccentColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
