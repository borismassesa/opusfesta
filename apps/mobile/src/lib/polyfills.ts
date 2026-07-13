import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

// React Native has no global WebCrypto; several deps (Supabase auth, uuid)
// expect `globalThis.crypto.getRandomValues`/`randomUUID`. Shim them from
// expo-crypto. The casts bridge expo-crypto's typings to the DOM Crypto
// interface, whose generics don't line up exactly.
if (Platform.OS !== 'web') {
  const g = globalThis as typeof globalThis & { crypto?: Crypto };
  const cryptoObj = (g.crypto ?? {}) as Crypto;

  if (!cryptoObj.getRandomValues) {
    cryptoObj.getRandomValues = Crypto.getRandomValues as Crypto['getRandomValues'];
  }
  if (!cryptoObj.randomUUID) {
    cryptoObj.randomUUID = Crypto.randomUUID as Crypto['randomUUID'];
  }

  g.crypto = cryptoObj;
}
