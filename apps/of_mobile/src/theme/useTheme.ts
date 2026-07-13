import { useContext } from 'react';
import { ThemeContext, type ThemeContextValue } from './ColorSchemeProvider';

/**
 * Read the active theme tokens for the current color scheme.
 *
 * Prefer destructuring `editorial` / `colors` so migrating an inline-style
 * component is a one-line change — swap the static import for a hook call and the
 * rest of the component keeps using the same identifiers:
 *
 *   // before
 *   import { editorial } from '@/constants/theme';
 *   // after
 *   const { editorial } = useTheme();
 *
 * Unlike the static imports (always light), these values flip with dark mode.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ColorSchemeProvider');
  }
  return context;
}
