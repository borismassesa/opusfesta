import * as SecureStore from 'expo-secure-store';

/**
 * Secure token cache for Clerk using expo-secure-store.
 */
export const tokenCache = {
  async getToken(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Silently fail — secure store may not be available in dev
    }
  },
};
