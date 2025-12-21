const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const vendorNodeModules = path.join(rootDir, 'apps', 'vendor-portal', 'node_modules');

const targets = [
  path.join(vendorNodeModules, 'react'),
  path.join(vendorNodeModules, 'react-dom'),
  path.join(vendorNodeModules, 'scheduler'),
];

for (const target of targets) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}
