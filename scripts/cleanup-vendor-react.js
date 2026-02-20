const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const appDirs = ['vendor-portal', 'studio'];
const packages = ['react', 'react-dom', 'scheduler'];

for (const app of appDirs) {
  const nodeModules = path.join(rootDir, 'apps', app, 'node_modules');
  for (const pkg of packages) {
    const target = path.join(nodeModules, pkg);
    try {
      if (fs.existsSync(target)) {
        fs.rmSync(target, { recursive: true, force: true });
        console.log(`removed ${pkg} from ${app}`);
      }
    } catch (err) {
      console.log(`failed to remove ${pkg} from ${app}: ${err.message}`);
    }
  }
}
