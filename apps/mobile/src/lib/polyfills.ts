import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
  const g = globalThis as typeof globalThis & { crypto?: any };
  const cryptoObj = g.crypto ?? {};

  if (!cryptoObj.getRandomValues) {
    cryptoObj.getRandomValues = Crypto.getRandomValues as any;
  }
  if (!cryptoObj.randomUUID) {
    cryptoObj.randomUUID = Crypto.randomUUID as any;
  }

  g.crypto = cryptoObj;
}
