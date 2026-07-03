import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');
const SW_FILE = path.join(DIST_DIR, 'sw.js');

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getFiles(filePath, fileList);
    } else {
      const relativePath = path.relative(DIST_DIR, filePath);
      // Skip sw.js itself and any source map (.map) files
      if (relativePath !== 'sw.js' && !relativePath.endsWith('.map')) {
        const urlPath = '/' + relativePath.replace(/\\/g, '/');
        fileList.push(urlPath);
      }
    }
  }
  return fileList;
}

try {
  if (!fs.existsSync(SW_FILE)) {
    console.error('dist/sw.js not found!');
    process.exit(1);
  }

  // Get all files in dist/
  const assets = getFiles(DIST_DIR);
  
  // Ensure we include "/"
  if (!assets.includes('/')) {
    assets.unshift('/');
  }

  console.log(`Found ${assets.length} assets to cache.`);

  // Read sw.js
  let swContent = fs.readFileSync(SW_FILE, 'utf8');

  // Replace the placeholder const ASSETS_TO_CACHE = [...];
  const regex = /const\s+ASSETS_TO_CACHE\s*=\s*\[[\s\S]*?\];/;
  const replacement = `const ASSETS_TO_CACHE = ${JSON.stringify(assets, null, 2)};`;

  if (!regex.test(swContent)) {
    console.error('Could not find ASSETS_TO_CACHE placeholder in sw.js');
    process.exit(1);
  }

  swContent = swContent.replace(regex, replacement);
  fs.writeFileSync(SW_FILE, swContent, 'utf8');
  console.log('Successfully injected asset list into dist/sw.js');
} catch (error) {
  console.error('Error injecting assets into sw.js:', error);
  process.exit(1);
}
