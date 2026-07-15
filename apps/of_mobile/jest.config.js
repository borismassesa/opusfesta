// Test-runner split (see README "Testing"): pure-logic tests are *.test.ts
// and run under Node's built-in runner via `npm run test:node`; anything
// needing the RN/Clerk/Supabase/TanStack-Query machinery is *.test.tsx and
// runs here under jest-expo. testMatch is .tsx-only so the two runners can
// never pick up each other's files.
module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/src/**/*.test.tsx', '<rootDir>/app/**/*.test.tsx'],
  // jest-expo's own pattern (see node_modules/jest-expo/jest-preset.js)
  // extended with @clerk and nativewind — replacing it wholesale breaks
  // hoisted expo-modules-core transforms.
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|@clerk|nativewind))',
    '/node_modules/react-native-reanimated/plugin/',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mirrors metro.config.js's React-version forcing: the monorepo hoists
    // react 19.2 for the web apps while this app pins 19.1 locally — mixing
    // the two copies breaks hooks with a duplicate-React error that's
    // brutal to diagnose. react-native itself only exists hoisted at the
    // repo root, so it resolves normally.
    '^react$': '<rootDir>/node_modules/react',
    '^react/(.*)$': '<rootDir>/node_modules/react/$1',
    '^react-dom$': '<rootDir>/node_modules/react-dom',
    '^react-dom/(.*)$': '<rootDir>/node_modules/react-dom/$1',
  },
};
