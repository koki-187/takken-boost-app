// Simple SVG-based icon generator
const fs = require('fs');
const path = require('path');

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

const svgTemplate = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#gradient)"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.3}" fill="rgba(255,255,255,0.95)"/>
  <text x="${size/2}" y="${size/2}" font-family="sans-serif" font-size="${size*0.35}" font-weight="bold" fill="#764ba2" text-anchor="middle" dominant-baseline="central">宅</text>
  ${size >= 128 ? `<text x="${size/2}" y="${size/2 + size*0.3 + size*0.12}" font-family="sans-serif" font-size="${size*0.08}" font-weight="bold" fill="white" text-anchor="middle">BOOST</text>` : ''}
</svg>`;

// Generate main icons
iconSizes.forEach(size => {
    const svg = svgTemplate(size);
    const fileName = `icon-${size}x${size}.svg`;
    const filePath = path.join(__dirname, 'public', fileName);
    fs.writeFileSync(filePath, svg);
    console.log(`Generated: ${fileName}`);
});

// Generate special icons
const specialIcons = [
    { name: 'study', symbol: '📚', color: '#667eea' },
    { name: 'exam', symbol: '📝', color: '#764ba2' },
    { name: 'progress', symbol: '📊', color: '#9f7aea' }
];

specialIcons.forEach(icon => {
    const size = 96;
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${icon.color}"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.4}" fill="rgba(255,255,255,0.95)"/>
  <text x="${size/2}" y="${size/2}" font-size="${size*0.5}" text-anchor="middle" dominant-baseline="central">${icon.symbol}</text>
</svg>`;
    
    const fileName = `icon-${icon.name}-96x96.svg`;
    const filePath = path.join(__dirname, 'public', fileName);
    fs.writeFileSync(filePath, svg);
    console.log(`Generated: ${fileName}`);
});

// Generate placeholder screenshots
const screenshots = [
    { name: 'desktop', width: 1920, height: 1080 },
    { name: 'mobile', width: 750, height: 1334 },
    { name: 'study', width: 1920, height: 1080 },
    { name: 'exam', width: 1920, height: 1080 }
];

screenshots.forEach(screen => {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${screen.width}" height="${screen.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-${screen.name}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${screen.width}" height="${screen.height}" fill="url(#grad-${screen.name})"/>
  <text x="${screen.width/2}" y="${screen.height*0.1}" font-size="${screen.height*0.05}" font-weight="bold" fill="white" text-anchor="middle">宅建BOOST v9.0.0 - ${screen.name}</text>
  <rect x="${screen.width*0.1}" y="${screen.height*0.2}" width="${screen.width*0.8}" height="${screen.height*0.7}" fill="rgba(255,255,255,0.1)" rx="20"/>
</svg>`;
    
    const fileName = `screenshot-${screen.name}.svg`;
    const filePath = path.join(__dirname, 'public', fileName);
    fs.writeFileSync(filePath, svg);
    console.log(`Generated: ${fileName}`);
});

console.log('All SVG icons generated successfully!');