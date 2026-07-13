import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

// Flat config for the Expo / React Native app. The monorepo's root .eslintrc.js
// ignores apps/**, delegating to each app's own config (matching the Next.js
// siblings, which each ship an eslint.config.mjs). This one covers RN/TSX.
export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      ".expo/**",
      "ios/**",
      "android/**",
      "assets/**",
      "*.config.js",
      "*.config.ts",
      "babel.config.js",
      "metro.config.js",
      "expo-env.d.ts",
      "nativewind-env.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  {
    // Registered manually: eslint-plugin-react-hooks@7's preset ships an
    // ESLint-9-style plugins array that ESLint 8.57 (the monorepo's version)
    // rejects, so we wire the plugin + its recommended rules by hand.
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    settings: {
      react: { version: "detect" },
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        __DEV__: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        fetch: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        AbortController: "readonly",
        FormData: "readonly",
        Blob: "readonly",
        __filename: "readonly",
        __dirname: "readonly",
      },
    },
    rules: {
      // Matches the monorepo root .eslintrc.js baseline.
      "prefer-const": "error",
      "no-var": "error",
      // Matches the Next.js siblings' shared rule choices.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-ignore": "allow-with-description",
          "ts-expect-error": "allow-with-description",
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // React Native idioms that eslint-config-expo also disables:
      // require() is the standard way to reference static assets, and
      // apostrophes/quotes inside <Text> are plain strings, not HTML entities.
      "@typescript-eslint/no-require-imports": "off",
      "react/no-unescaped-entities": "off",
    },
  },
  {
    files: ["**/*.test.*", "**/*.spec.*", "src/test/**"],
    languageOptions: {
      globals: {
        jest: "readonly",
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
      },
    },
  },
);
