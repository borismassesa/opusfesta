import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';
import { dark, light, type ColorTokens, type EditorialTokens } from '@/constants/palette';

/** User-facing appearance preference. `system` follows the OS setting. */
export type ThemePreference = 'system' | 'light' | 'dark';

/** The resolved scheme actually in effect (never `system`). */
export type EffectiveScheme = 'light' | 'dark';

export interface ThemeContextValue {
  /** What the user picked (System / Light / Dark). */
  preference: ThemePreference;
  /** The scheme actually rendered right now. */
  effective: EffectiveScheme;
  /** Active Editorial Romance tokens for the effective scheme. */
  editorial: EditorialTokens;
  /** Active flat brand tokens for the effective scheme. */
  colors: ColorTokens;
  /** Persist and apply a new preference. */
  setPreference: (preference: ThemePreference) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = '@opusfesta/color-scheme';

function isPreference(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

/**
 * The single writer for color scheme. It drives BOTH consumption paths from one
 * preference:
 *   - NativeWind `of-*` classes, via `setColorScheme()` (flips the .dark CSS vars).
 *   - Inline JS `editorial`/`colors`, via the context tokens read by `useTheme()`.
 * Keeping one writer guarantees classNames and inline styles never disagree.
 *
 * Wrap the app once, above everything that renders color. Preference is persisted
 * to AsyncStorage and restored on launch (a brief light flash on cold start is
 * possible because the read is async).
 */
export function ColorSchemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const hydrated = useRef(false);

  // Restore the saved preference once on mount.
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (active && isPreference(stored)) {
          setPreferenceState(stored);
        }
      })
      .catch(() => {
        // Ignore read failures — fall back to the `system` default.
      })
      .finally(() => {
        hydrated.current = true;
      });
    return () => {
      active = false;
    };
  }, []);

  // Apply the preference to NativeWind whenever it changes.
  useEffect(() => {
    setColorScheme(preference);
  }, [preference, setColorScheme]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      // Non-fatal: the preference still applies for this session.
    });
  }, []);

  const effective: EffectiveScheme = colorScheme === 'dark' ? 'dark' : 'light';

  const value = useMemo<ThemeContextValue>(() => {
    const tokens = effective === 'dark' ? dark : light;
    return {
      preference,
      effective,
      editorial: tokens.editorial,
      colors: tokens.colors,
      setPreference,
    };
  }, [effective, preference, setPreference]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
