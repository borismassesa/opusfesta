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

// Exclude nested git worktrees and stray backup dirs from the watched tree.
// watchFolders above pulls in the ENTIRE monorepo root, which in this repo
// includes several `git worktree`-checked-out copies (.worktrees/,
// .claude/worktrees/) plus a stray apps/.git.bak/ — paths that other,
// concurrently-running sessions actively mutate (branch switches, worktree
// add/remove). Metro's file-map crawler isn't safe against a watched
// directory changing mid-crawl and throws `TreeFS: remove called on a
// non-empty directory`; blocking these paths keeps the watched tree stable
// regardless of what else is happening elsewhere in the monorepo.
const blockedMonorepoPaths = ['.worktrees', path.join('.claude', 'worktrees'), path.join('apps', '.git.bak')];
config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList) ? config.resolver.blockList : [config.resolver.blockList]),
  ...blockedMonorepoPaths.map((rel) => {
    const abs = path.join(monorepoRoot, rel).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`^${abs}(/.*)?$`);
  }),
];

// Monorepo: resolve node_modules from both app and root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Force React-related packages to always resolve from mobile's local node_modules.
// This prevents React 18 (hoisted at monorepo root for website) from conflicting
// with React 19 (required by Expo SDK 54 in mobile).
const reactDir = path.resolve(projectRoot, 'node_modules/react');
const reactDomDir = path.resolve(projectRoot, 'node_modules/react-dom');

// Map of exact module specifiers to their resolved file paths
const forcedLocalResolutions = {
  'react': path.join(reactDir, 'index.js'),
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

// Override resolveRequest to intercept react requires from ANY location
// (including hoisted packages like react-native-css-interop at monorepo root)
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Exact match — return the known local file path
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
