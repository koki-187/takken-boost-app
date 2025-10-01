// Node.js script to generate PWA icons
const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Add text
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = size * 0.02;
    
    if (size >= 192) {
        // Large icons - full text
        ctx.font = `bold ${size * 0.22}px sans-serif`;
        ctx.fillText('宅建', size / 2, size / 2 - size * 0.15);
        ctx.fillText('BOOST', size / 2, size / 2 + size * 0.05);
        
        ctx.font = `bold ${size * 0.08}px sans-serif`;
        ctx.fillStyle = '#FFD700';
        ctx.fillText('v9.0.0', size / 2, size / 2 + size * 0.25);
    } else if (size >= 128) {
        // Medium icons
        ctx.font = `bold ${size * 0.25}px sans-serif`;
        ctx.fillText('宅建', size / 2, size / 2 - size * 0.1);
        ctx.font = `bold ${size * 0.18}px sans-serif`;
        ctx.fillText('BOOST', size / 2, size / 2 + size * 0.15);
    } else {
        // Small icons - simplified
        ctx.font = `bold ${size * 0.35}px sans-serif`;
        ctx.fillText('宅', size / 2, size / 2 - size * 0.1);
        ctx.fillText('建', size / 2, size / 2 + size * 0.2);
    }
    
    // Save to file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`icon-${size}x${size}.png`, buffer);
    console.log(`Generated icon-${size}x${size}.png`);
});

console.log('All PWA icons generated successfully!');
