import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '@/utils';
import { STORAGE_KEYS, THEMES } from '@/constants';

interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<string>(THEMES.LIGHT);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await storage.getItem<string>(STORAGE_KEYS.THEME);
        if (storedTheme && Object.values(THEMES).includes(storedTheme as any)) {
          setThemeState(storedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
    };

    loadTheme();
  }, []);

  const setTheme = async (newTheme: string) => {
    try {
      setThemeState(newTheme);
      await storage.setItem(STORAGE_KEYS.THEME, newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    setTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
