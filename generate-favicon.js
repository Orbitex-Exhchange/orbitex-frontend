const fs = require('fs');
const path = require('path');

// Create the correct Orbitex favicon with green square and black O
const faviconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Green background square -->
  <rect width="32" height="32" fill="#00ff88" rx="4"/>
  
  <!-- Black O letter -->
  <text x="16" y="22" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="black">O</text>
</svg>`;

// Write the favicon SVG
fs.writeFileSync(path.join(__dirname, 'public', 'favicon.svg'), faviconSvg);

console.log('✅ Correct Orbitex favicon created!');
console.log('📁 Location: public/favicon.svg');
console.log('🎨 Design: Green square (#00ff88) with black "O" letter');
console.log('');
console.log('Converting to ICO format...');
