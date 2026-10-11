import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ThemePreference, AccentColor } from '../types/database';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => void;
  accentColor: AccentColor;
  setAccentColor: (accent: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const resolveIsDark = (pref: ThemePreference): boolean => {
  if (pref === 'dark') return true;
  if (pref === 'light') return false;
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return true;
  }
  return false;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(() => {
    const saved = localStorage.getItem('sana_theme_pref');
    return (saved as ThemePreference) || 'light';
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const saved = localStorage.getItem('sana_accent_color');
    return (saved as AccentColor) || 'blush';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    const saved = (localStorage.getItem('sana_theme_pref') as ThemePreference) || 'light';
    return resolveIsDark(saved) ? 'dark' : 'light';
  });

  // Apply classes to root element immediately
  const applyThemeToDOM = useCallback((isDark: boolean, accent: AccentColor) => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.setAttribute('data-accent', accent);
  }, []);

  // Sync on mount and preference change
  useEffect(() => {
    const isDark = resolveIsDark(themePreference);
    setResolvedTheme(isDark ? 'dark' : 'light');
    applyThemeToDOM(isDark, accentColor);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (themePreference === 'system') {
        const dark = e.matches;
        setResolvedTheme(dark ? 'dark' : 'light');
        applyThemeToDOM(dark, accentColor);
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [themePreference, accentColor, applyThemeToDOM]);

  const setThemePreference = (pref: ThemePreference) => {
    setThemePreferenceState(pref);
    localStorage.setItem('sana_theme_pref', pref);
    const isDark = resolveIsDark(pref);
    setResolvedTheme(isDark ? 'dark' : 'light');
    applyThemeToDOM(isDark, accentColor);
  };

  const setAccentColor = (accent: AccentColor) => {
    setAccentColorState(accent);
    localStorage.setItem('sana_accent_color', accent);
    document.documentElement.setAttribute('data-accent', accent);
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
