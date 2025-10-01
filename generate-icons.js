const fs = require('fs');
const path = require('path');

// Canvas APIを使用してアイコンを生成
const { createCanvas } = require('canvas');

// アイコンサイズのリスト
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512, 1024];

// パープルグラデーションカラー
const gradientStart = '#667eea';
const gradientEnd = '#764ba2';

// 各サイズのアイコンを生成
iconSizes.forEach(size => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // グラデーション背景
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, gradientStart);
    gradient.addColorStop(1, gradientEnd);
    
    // 背景を塗りつぶし
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // 円形の白い背景（中央）
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.3;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fill();
    
    // テキスト「宅」を描画
    ctx.font = `bold ${size * 0.35}px sans-serif`;
    ctx.fillStyle = gradientEnd;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('宅', centerX, centerY);
    
    // BOOSTテキスト（小さく）
    if (size >= 128) {
        ctx.font = `bold ${size * 0.08}px sans-serif`;
        ctx.fillStyle = 'white';
        ctx.fillText('BOOST', centerX, centerY + radius + size * 0.12);
    }
    
    // ファイルとして保存
    const buffer = canvas.toBuffer('image/png');
    const fileName = `icon-${size}x${size}.png`;
    const filePath = path.join(__dirname, 'public', fileName);
    
    fs.writeFileSync(filePath, buffer);
    console.log(`Generated: ${fileName}`);
});

// 特殊アイコンの生成（学習、試験、進捗）
const specialIcons = [
    { name: 'study', emoji: '📚' },
    { name: 'exam', emoji: '📝' },
    { name: 'progress', emoji: '📊' }
];

specialIcons.forEach(icon => {
    const size = 96;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // グラデーション背景
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, gradientStart);
    gradient.addColorStop(1, gradientEnd);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // 絵文字を中央に配置
    ctx.font = `${size * 0.6}px sans-serif`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon.emoji, size / 2, size / 2);
    
    const buffer = canvas.toBuffer('image/png');
    const fileName = `icon-${icon.name}-96x96.png`;
    const filePath = path.join(__dirname, 'public', fileName);
    
    fs.writeFileSync(filePath, buffer);
    console.log(`Generated: ${fileName}`);
});

console.log('All icons generated successfully!');