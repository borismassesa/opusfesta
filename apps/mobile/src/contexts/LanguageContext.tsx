import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '@/utils';
import { STORAGE_KEYS, LANGUAGES } from '@/constants';

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Simple translation object - in production, this would be loaded from i18n files
const translations = {
  en: {
    'home.title': 'Home',
    'plan.title': 'Plan',
    'guests.title': 'Guests',
    'messages.title': 'Messages',
    'more.title': 'More',
    'welcome': 'Welcome to The Festa',
    'create.event': 'Create Event',
    'find.vendors': 'Find Vendors',
    'view.bookings': 'View Bookings',
    'settings': 'Settings',
    'profile': 'Profile',
    'logout': 'Logout',
  },
  sw: {
    'home.title': 'Nyumbani',
    'plan.title': 'Mpango',
    'guests.title': 'Wageni',
    'messages.title': 'Ujumbe',
    'more.title': 'Zaidi',
    'welcome': 'Karibu The Festa',
    'create.event': 'Unda Tukio',
    'find.vendors': 'Tafuta Wauzaji',
    'view.bookings': 'Angalia Maagizo',
    'settings': 'Mipangilio',
    'profile': 'Wasifu',
    'logout': 'Ondoka',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<string>(LANGUAGES.ENGLISH);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLanguage = await storage.getItem<string>(STORAGE_KEYS.LANGUAGE);
        if (storedLanguage && Object.values(LANGUAGES).includes(storedLanguage as any)) {
          setLanguageState(storedLanguage);
        }
      } catch (error) {
        console.error('Failed to load language:', error);
      }
    };

    loadLanguage();
  }, []);

  const setLanguage = async (newLanguage: string) => {
    try {
      setLanguageState(newLanguage);
      await storage.setItem(STORAGE_KEYS.LANGUAGE, newLanguage);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  };

  const t = (key: string): string => {
    const langTranslations = translations[language as keyof typeof translations];
    if (!langTranslations) return key;
    return (langTranslations as Record<string, string>)[key] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
