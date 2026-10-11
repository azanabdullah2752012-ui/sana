import React from 'react';

interface AvatarProps {
  name: string;
  url?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  isOnline?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  url,
  size = 'md',
  showStatus = false,
  isOnline = true,
  className = '',
}) => {
  const getInitials = (n: string) => {
    if (!n) return '?';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const sizeClasses = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-9 h-9 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl font-serif',
  };

  const statusSizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
  };

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {url ? (
        <img
          src={url}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white dark:border-cozydark-800 shadow-sm`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-medium bg-gradient-to-br from-blush-200 via-blush-100 to-lavender-200 text-blush-800 dark:from-blush-900/60 dark:via-cozydark-800 dark:to-lavender-900/60 dark:text-blush-200 border-2 border-white dark:border-cozydark-800 shadow-sm select-none`}
        >
          {getInitials(name)}
        </div>
      )}

      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-cream-100 dark:border-cozydark-950 ${
            statusSizeClasses[size]
          } ${isOnline ? 'bg-emerald-400' : 'bg-cream-400 dark:bg-cozydark-600'}`}
          title={isOnline ? 'Connected & Online' : 'Offline'}
        />
      )}
    </div>
  );
};
