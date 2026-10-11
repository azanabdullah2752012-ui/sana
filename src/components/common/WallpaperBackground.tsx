import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const WallpaperBackground: React.FC = () => {
  const { activeWallpaperUrl, wallpaper } = useTheme();

  if (!activeWallpaperUrl || wallpaper === 'minimal') {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* Wallpaper Image */}
      <img
        src={activeWallpaperUrl}
        alt=""
        className="w-full h-full object-cover transition-opacity duration-700 ease-in-out transform scale-105"
      />

      {/* Atmospheric Glass Overlay for High Contrast & Readability */}
      <div className="absolute inset-0 bg-cream-100/80 dark:bg-cozydark-950/85 backdrop-blur-[1.5px] transition-colors duration-500" />

      {/* Subtle Bottom Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cream-100/70 dark:to-cozydark-950/90 pointer-events-none" />
    </div>
  );
};
