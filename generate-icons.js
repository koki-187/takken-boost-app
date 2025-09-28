// Icon Generator for 宅建BOOST
const fs = require('fs');
const path = require('path');

// Create base64 encoded PNG icons
const createIcon = (size) => {
    // Create a simple colored square as placeholder
    // In production, you would use a proper image generation library
    const canvas = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="bg${size}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#E8EEF2;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#D1D9DE;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="arrow${size}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#00B4D8;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#0077B6;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#03045E;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="text${size}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#0096C7;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#023E8A;stop-opacity:1" />
            </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect x="0" y="0" width="${size}" height="${size}" rx="${size/6}" ry="${size/6}" 
              fill="url(#bg${size})"/>
        
        <!-- Arrow -->
        <g transform="translate(${size/2}, ${size*0.35})">
            <path d="M ${-size*0.25},${size*0.05} Q 0,${-size*0.1} ${size*0.25},${-size*0.12}" 
                  fill="none" stroke="url(#arrow${size})" stroke-width="${size*0.06}" 
                  stroke-linecap="round"/>
            <g transform="translate(${size*0.25}, ${-size*0.12}) rotate(35)">
                <path d="M 0,0 L ${size*0.08},${-size*0.03} L ${size*0.08},${size*0.03} Z" 
                      fill="url(#arrow${size})"/>
            </g>
        </g>
        
        <!-- Text -->
        <text x="${size/2}" y="${size*0.65}" font-family="sans-serif" font-size="${size*0.14}" 
              font-weight="bold" text-anchor="middle" fill="url(#text${size})">宅建</text>
        <text x="${size/2}" y="${size*0.82}" font-family="sans-serif" font-size="${size*0.16}" 
              font-weight="900" text-anchor="middle" fill="url(#text${size})">BOOST</text>
    </svg>`;
    
    return Buffer.from(canvas).toString('base64');
};

// Icon sizes for different platforms
const iconSizes = [
    16, 32, 48, 72, 96, 120, 128, 144, 152, 180, 192, 384, 512, 1024
];

// Generate placeholder icons
iconSizes.forEach(size => {
    const iconData = createIcon(size);
    const fileName = size === 180 ? `apple-touch-icon.png` : `icon-${size}x${size}.png`;
    
    console.log(`Generated: ${fileName}`);
    
    // Create a placeholder file (in real implementation, save actual PNG)
    fs.writeFileSync(
        path.join(__dirname, 'public', 'icons', fileName),
        `<!-- Placeholder for ${size}x${size} icon -->\n<!-- Base64 data would go here in production -->`,
        'utf8'
    );
});

// Create favicon.ico placeholder
fs.writeFileSync(
    path.join(__dirname, 'public', 'favicon.ico'),
    '<!-- Placeholder for favicon -->',
    'utf8'
);

console.log('Icon generation complete!');