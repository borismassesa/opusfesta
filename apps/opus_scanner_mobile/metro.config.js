const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const Module = require('module');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Ensure hoisted NativeWind/react-native-css-interop can resolve
// react-native from this workspace in monorepo setups.
process.env.NODE_PATH = [
  path.resolve(projectRoot, 'node_modules'),
  process.env.NODE_PATH,
]
  .filter(Boolean)
  .join(path.delimiter);
Module._initPaths();

// Monorepo: watch shared packages
config.watchFolders = [monorepoRoot];

// Monorepo: resolve node_modules from both app and root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Force React-related packages to always resolve from this app's local
// node_modules — same fix as apps/mobile's metro.config.js, for the same
// reason: a monorepo-hoisted React version can otherwise conflict with the
// version Expo SDK 54 requires here.
const reactDir = path.resolve(projectRoot, 'node_modules/react');
const reactDomDir = path.resolve(projectRoot, 'node_modules/react-dom');

const forcedLocalResolutions = {
  react: path.join(reactDir, 'index.js'),
  'react/jsx-runtime': path.join(reactDir, 'jsx-runtime.js'),
  'react/jsx-dev-runtime': path.join(reactDir, 'jsx-dev-runtime.js'),
  'react-dom': path.join(reactDomDir, 'index.js'),
};

config.resolver.extraNodeModules = {
  react: reactDir,
  'react-dom': reactDomDir,
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
  'react-native-web': path.resolve(projectRoot, 'node_modules/react-native-web'),
};

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (forcedLocalResolutions[moduleName]) {
    return {
      type: 'sourceFile',
      filePath: forcedLocalResolutions[moduleName],
    };
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

const { withNativeWind } = require('nativewind/metro');
module.exports = withNativeWind(config, {
  input: path.resolve(projectRoot, 'global.css'),
  configPath: path.resolve(projectRoot, 'tailwind.config.ts'),
});
