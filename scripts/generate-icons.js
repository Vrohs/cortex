const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Sizes for PWA icons
const sizes = [192, 384, 512];

async function generateIcons() {
  const inputSvg = path.join(__dirname, 'public', 'icon.svg');
  const svgContent = fs.readFileSync(inputSvg);
  
  // Create output directory if it doesn't exist
  const outputDir = path.join(__dirname, 'public');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Create icons for each size
  for (const size of sizes) {
    await sharp(svgContent)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, `icon-${size}.png`));
    
    console.log(`Generated icon-${size}.png`);
  }
  
  console.log('All icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
