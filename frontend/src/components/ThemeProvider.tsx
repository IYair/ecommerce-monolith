'use client';

import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';

import { cmsApi } from '@/lib/api';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: theme, error } = useQuery({
    queryKey: ['cms', 'theme-settings'],
    queryFn: () => cmsApi.getThemeSettings(),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1,
  });

  useEffect(() => {
    if (theme) {
      console.warn('[ThemeProvider] Applying theme:', theme.themeName);

      // Apply theme colors as CSS variables to the document root
      const root = document.documentElement;

      // Convert hex to RGB for better compatibility with opacity
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
          : '0 0 0';
      };

      // Set CSS variables
      root.style.setProperty('--color-primary', hexToRgb(theme.primaryColor));
      root.style.setProperty('--color-primary-foreground', hexToRgb(theme.primaryForeground));
      root.style.setProperty('--color-secondary', hexToRgb(theme.secondaryColor));
      root.style.setProperty('--color-secondary-foreground', hexToRgb(theme.secondaryForeground));
      root.style.setProperty('--color-accent', hexToRgb(theme.accentColor));
      root.style.setProperty('--color-accent-foreground', hexToRgb(theme.accentForeground));
      root.style.setProperty('--color-background', hexToRgb(theme.backgroundColor));
      root.style.setProperty('--color-foreground', hexToRgb(theme.foregroundColor));
      root.style.setProperty('--color-muted', hexToRgb(theme.mutedColor));
      root.style.setProperty('--color-muted-foreground', hexToRgb(theme.mutedForeground));
      root.style.setProperty('--color-card', hexToRgb(theme.cardColor));
      root.style.setProperty('--color-card-foreground', hexToRgb(theme.cardForeground));
      root.style.setProperty('--color-border', hexToRgb(theme.borderColor));
      root.style.setProperty('--color-input', hexToRgb(theme.inputColor));
      root.style.setProperty('--color-ring', hexToRgb(theme.ringColor));
      root.style.setProperty('--color-destructive', hexToRgb(theme.destructiveColor));
      root.style.setProperty(
        '--color-destructive-foreground',
        hexToRgb(theme.destructiveForeground)
      );

      console.warn('[ThemeProvider] Theme applied successfully');
    } else if (error) {
      console.warn('[ThemeProvider] Failed to load theme, using defaults:', error);
    }
  }, [theme, error]);

  return <>{children}</>;
}
