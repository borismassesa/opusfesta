const fs = require('fs');
const path = require('path');

// For now, let's just copy the logo and we'll ask user to create proper OG image later
const logoPath = path.join(__dirname, 'assets/images/Black Color/4x/Asset 1@4x.png');
const ogPath = path.join(__dirname, 'public/opengraph.png');

fs.copyFileSync(logoPath, ogPath);
console.log('Open Graph image created');
