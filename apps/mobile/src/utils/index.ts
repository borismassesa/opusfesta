// Re-export utilities from shared lib package
export * from '@thefesta/lib';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Linking, Platform } from 'react-native';
import { STORAGE_KEYS } from '@/constants';

// Storage utilities
export const storage = {
  async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  },

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

// Auth utilities
export const auth = {
  async saveToken(token: string): Promise<void> {
    await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  async getToken(): Promise<string | null> {
    return await storage.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  },

  async removeToken(): Promise<void> {
    await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  async saveUser(user: any): Promise<void> {
    await storage.setItem(STORAGE_KEYS.USER_DATA, user);
  },

  async getUser(): Promise<any | null> {
    return await storage.getItem(STORAGE_KEYS.USER_DATA);
  },

  async removeUser(): Promise<void> {
    await storage.removeItem(STORAGE_KEYS.USER_DATA);
  },

  async logout(): Promise<void> {
    await Promise.all([
      this.removeToken(),
      this.removeUser(),
    ]);
  },
};

// Platform utilities
export const platform = {
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  isWeb: Platform.OS === 'web',
};

// Device utilities
export const device = {
  async openSettings(): Promise<void> {
    if (platform.isIOS) {
      await Linking.openURL('app-settings:');
    } else {
      await Linking.openSettings();
    }
  },

  async openURL(url: string): Promise<void> {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        throw new Error('Cannot open URL');
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Error', 'Cannot open this link');
    }
  },

  async openPhone(phoneNumber: string): Promise<void> {
    const url = `tel:${phoneNumber}`;
    await this.openURL(url);
  },

  async openEmail(email: string, subject?: string, body?: string): Promise<void> {
    let url = `mailto:${email}`;
    const params: string[] = [];
    
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (body) params.push(`body=${encodeURIComponent(body)}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    await this.openURL(url);
  },

  async openWhatsApp(phoneNumber: string, message?: string): Promise<void> {
    let url = `whatsapp://send?phone=${phoneNumber}`;
    if (message) {
      url += `&text=${encodeURIComponent(message)}`;
    }
    await this.openURL(url);
  },
};

// Validation utilities
export const validation = {
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+255|255|0)?[67]\d{8}$/;
    return phoneRegex.test(phone);
  },

  isValidPassword(password: string): boolean {
    return password.length >= 8;
  },

  isRequired(value: any): boolean {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value != null && value !== '';
  },
};

// Date utilities
export const dateUtils = {
  formatDate(date: Date, format: string = 'MMM dd, yyyy'): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    };
    
    if (format.includes('HH:mm')) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return new Intl.DateTimeFormat('en-TZ', options).format(date);
  },

  getDaysUntil(date: Date): number {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  },

  isTomorrow(date: Date): boolean {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  },

  isPast(date: Date): boolean {
    return date < new Date();
  },

  isFuture(date: Date): boolean {
    return date > new Date();
  },
};

// Image utilities
export const imageUtils = {
  getImageDimensions(uri: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const Image = require('react-native').Image;
      Image.getSize(
        uri,
        (width: number, height: number) => {
          resolve({ width, height });
        },
        (error: any) => {
          reject(error);
        }
      );
    });
  },

  resizeImageUri(uri: string, maxWidth: number = 800, maxHeight: number = 600): string {
    // This would typically use a library like react-native-image-resizer
    // For now, return the original URI
    return uri;
  },
};

// Error handling utilities
export const errorUtils = {
  handleError(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    
    return 'An unexpected error occurred';
  },

  showError(error: any): void {
    const message = this.handleError(error);
    Alert.alert('Error', message);
  },

  showSuccess(message: string): void {
    Alert.alert('Success', message);
  },

  showConfirm(
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ): void {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: 'Confirm',
          onPress: onConfirm,
        },
      ]
    );
  },
};

// Haptic feedback utilities
export const haptics = {
  async light(): Promise<void> {
    const { Haptics } = require('expo-haptics');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  async medium(): Promise<void> {
    const { Haptics } = require('expo-haptics');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  async heavy(): Promise<void> {
    const { Haptics } = require('expo-haptics');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  async success(): Promise<void> {
    const { Haptics } = require('expo-haptics');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  async warning(): Promise<void> {
    const { Haptics } = require('expo-haptics');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },

  async error(): Promise<void> {
    const { Haptics } = require('expo-haptics');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },
};

// Clipboard utilities
export const clipboard = {
  async copy(text: string): Promise<void> {
    const { setStringAsync } = require('expo-clipboard');
    await setStringAsync(text);
  },

  async paste(): Promise<string> {
    const { getStringAsync } = require('expo-clipboard');
    return await getStringAsync();
  },
};

// Network utilities
export const network = {
  isOnline(): boolean {
    // This would typically use @react-native-netinfo/netinfo
    // For now, return true
    return true;
  },

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        mode: 'no-cors',
      });
      return true;
    } catch {
      return false;
    }
  },
};
