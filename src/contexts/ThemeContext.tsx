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

const VALID_ACCENTS: AccentColor[] = ['blush', 'lavender', 'cream', 'rose', 'peach', 'mint', 'sky', 'violet'];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(() => {
    const saved = localStorage.getItem('sana_theme_pref') as ThemePreference;
    return saved === 'dark' || saved === 'light' || saved === 'system' ? saved : 'light';
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const saved = localStorage.getItem('sana_accent_color') as AccentColor;
    return VALID_ACCENTS.includes(saved) ? saved : 'blush';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    const saved = (localStorage.getItem('sana_theme_pref') as ThemePreference) || 'light';
    return resolveIsDark(saved) ? 'dark' : 'light';
  });

  // Apply classes and data attribute to root element immediately
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

  const setThemePreference = useCallback((pref: ThemePreference) => {
    const validPref = pref === 'dark' || pref === 'light' || pref === 'system' ? pref : 'light';
    setThemePreferenceState(validPref);
    localStorage.setItem('sana_theme_pref', validPref);
    const isDark = resolveIsDark(validPref);
    setResolvedTheme(isDark ? 'dark' : 'light');
    applyThemeToDOM(isDark, accentColor);
  }, [accentColor, applyThemeToDOM]);

  const setAccentColor = useCallback((accent: AccentColor) => {
    const validAccent = VALID_ACCENTS.includes(accent) ? accent : 'blush';
    setAccentColorState(validAccent);
    localStorage.setItem('sana_accent_color', validAccent);
    applyThemeToDOM(resolveIsDark(themePreference), validAccent);
  }, [themePreference, applyThemeToDOM]);

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
