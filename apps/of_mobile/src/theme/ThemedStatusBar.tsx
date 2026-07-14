import { StatusBar } from 'expo-status-bar';
import { useTheme } from './useTheme';

/**
 * StatusBar whose text/icon color tracks the active scheme: dark glyphs on the
 * light theme, light glyphs on the dark theme. Replaces the previously hardcoded
 * `<StatusBar style="dark" />`.
 */
export function ThemedStatusBar() {
  const { effective } = useTheme();
  return <StatusBar style={effective === 'dark' ? 'light' : 'dark'} />;
}
