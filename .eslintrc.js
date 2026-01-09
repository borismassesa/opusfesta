module.exports = {
  root: true,
  // Only apply this config to non-Next.js apps
  // Next.js apps have their own .eslintrc.json files
  ignorePatterns: ["apps/**"],
  extends: [
    "eslint:recommended"
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    "prefer-const": "error",
    "no-var": "error",
  },
  overrides: [
    {
      files: ["**/*.test.*", "**/*.spec.*"],
      env: {
        jest: true,
      },
    },
  ],
};
