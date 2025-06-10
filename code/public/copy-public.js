const fs = require('fs');
const path = require('path');

// Create the public/public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy index.html to public/public/index.html
fs.copyFileSync(
  path.join(__dirname, 'index.html'),
  path.join(publicDir, 'index.html')
);

// Copy other public assets
const publicAssets = ['manifest.json', 'robots.txt', 'HelpMyPetAI.png'];
publicAssets.forEach(asset => {
  const sourcePath = path.join(__dirname, asset);
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(
      sourcePath,
      path.join(publicDir, asset)
    );
  }
});

console.log('Public assets copied successfully!'); 