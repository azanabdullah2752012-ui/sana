import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { ThemePreference } from '../types/database';

export type WallpaperId =
  | 'minimal'
  | 'galaxy'
  | 'rainy_cafe'
  | 'sunset'
  | 'sakura'
  | 'pine_forest'
  | 'city_dusk'
  | 'custom';

export interface WallpaperOption {
  id: WallpaperId;
  name: string;
  subtitle: string;
  emoji: string;
  url?: string;
  thumbGradient: string;
}

export const WALLPAPER_PRESETS: WallpaperOption[] = [
  {
    id: 'minimal',
    name: 'Clean Minimal',
    subtitle: 'Classic cozy sanctuary tone',
    emoji: '☁️',
    thumbGradient: 'from-cream-200 to-cream-100 dark:from-cozydark-900 dark:to-cozydark-950',
  },
  {
    id: 'galaxy',
    name: 'Cosmic Starlight',
    subtitle: 'Starry galaxy & midnight aurora',
    emoji: '🌌',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80',
    thumbGradient: 'from-indigo-950 via-purple-900 to-slate-950',
  },
  {
    id: 'rainy_cafe',
    name: 'Cozy Rainy Cafe',
    subtitle: 'Window rain droplets & warm bokeh lights',
    emoji: '🌧️',
    url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1920&q=80',
    thumbGradient: 'from-slate-800 via-amber-950/40 to-slate-900',
  },
  {
    id: 'sunset',
    name: 'Golden Hour Dusk',
    subtitle: 'Warm sunset clouds & peach horizons',
    emoji: '🌅',
    url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=1920&q=80',
    thumbGradient: 'from-amber-500 via-rose-500 to-purple-900',
  },
  {
    id: 'sakura',
    name: 'Cherry Blossom Park',
    subtitle: 'Pastel sakura tree & soft daylight',
    emoji: '🌸',
    url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1920&q=80',
    thumbGradient: 'from-pink-300 via-rose-200 to-pink-400',
  },
  {
    id: 'pine_forest',
    name: 'Misty Pine Forest',
    subtitle: 'Lush evergreen morning mist & moss',
    emoji: '🌲',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=80',
    thumbGradient: 'from-emerald-950 via-green-900 to-teal-950',
  },
  {
    id: 'city_dusk',
    name: 'Lofi City Lights',
    subtitle: 'Evening skyline with glowing windows',
    emoji: '🏙️',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1920&q=80',
    thumbGradient: 'from-blue-950 via-indigo-900 to-slate-900',
  },
  {
    id: 'custom',
    name: 'Our Bestie Photo',
    subtitle: 'Uploaded photo of Sana & Azan',
    emoji: '📸',
    thumbGradient: 'from-blush-400 via-lavender-400 to-cream-400',
  },
];

interface ThemeContextType {
  theme: 'light' | 'dark';
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => void;
  toggleTheme: () => void;
  wallpaper: WallpaperId;
  setWallpaper: (id: WallpaperId) => void;
  customWallpaperUrl: string | null;
  setCustomWallpaperUrl: (url: string | null) => void;
  activeWallpaperUrl: string | null;
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
    const saved = localStorage.getItem('sana_theme_pref') as ThemePreference;
    return saved === 'dark' || saved === 'light' || saved === 'system' ? saved : 'light';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    const saved = (localStorage.getItem('sana_theme_pref') as ThemePreference) || 'light';
    return resolveIsDark(saved) ? 'dark' : 'light';
  });

  const [wallpaper, setWallpaperState] = useState<WallpaperId>(() => {
    const saved = localStorage.getItem('sana_wallpaper') as WallpaperId;
    return saved || 'minimal';
  });

  const [customWallpaperUrl, setCustomWallpaperUrlState] = useState<string | null>(() => {
    return localStorage.getItem('sana_custom_wallpaper') || null;
  });

  // Apply dark class to root element immediately
  const applyThemeToDOM = useCallback((isDark: boolean) => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // Sync on mount and preference change
  useEffect(() => {
    const isDark = resolveIsDark(themePreference);
    setResolvedTheme(isDark ? 'dark' : 'light');
    applyThemeToDOM(isDark);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (themePreference === 'system') {
        const dark = e.matches;
        setResolvedTheme(dark ? 'dark' : 'light');
        applyThemeToDOM(dark);
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [themePreference, applyThemeToDOM]);

  const setThemePreference = useCallback((pref: ThemePreference) => {
    const validPref = pref === 'dark' || pref === 'light' || pref === 'system' ? pref : 'light';
    setThemePreferenceState(validPref);
    localStorage.setItem('sana_theme_pref', validPref);
    const isDark = resolveIsDark(validPref);
    setResolvedTheme(isDark ? 'dark' : 'light');
    applyThemeToDOM(isDark);
  }, [applyThemeToDOM]);

  const toggleTheme = useCallback(() => {
    const nextTheme: ThemePreference = resolvedTheme === 'dark' ? 'light' : 'dark';
    setThemePreference(nextTheme);
  }, [resolvedTheme, setThemePreference]);

  const setWallpaper = useCallback((id: WallpaperId) => {
    setWallpaperState(id);
    localStorage.setItem('sana_wallpaper', id);
  }, []);

  const setCustomWallpaperUrl = useCallback((url: string | null) => {
    setCustomWallpaperUrlState(url);
    if (url) {
      try {
        localStorage.setItem('sana_custom_wallpaper', url);
      } catch {
        // Quota safety
      }
    } else {
      localStorage.removeItem('sana_custom_wallpaper');
    }
  }, []);

  const activeWallpaperUrl = useMemo(() => {
    if (wallpaper === 'minimal') return null;
    if (wallpaper === 'custom') return customWallpaperUrl;
    const preset = WALLPAPER_PRESETS.find((p) => p.id === wallpaper);
    return preset?.url || null;
  }, [wallpaper, customWallpaperUrl]);

  return (
    <ThemeContext.Provider
      value={{
        theme: resolvedTheme,
        themePreference,
        setThemePreference,
        toggleTheme,
        wallpaper,
        setWallpaper,
        customWallpaperUrl,
        setCustomWallpaperUrl,
        activeWallpaperUrl,
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
