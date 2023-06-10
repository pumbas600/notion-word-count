import fs from 'fs';

const CONFIG = {
  STYLES: {
    CONTENT: './src/styles/content.css',
  },
  MANIFEST: {
    CHROMIUM: './src/chromium-manifest.json',
  },
};

function copyManifest() {
  fs.copyFileSync(CONFIG.STYLES.CONTENT, './dist/content/content.css');
  fs.copyFileSync(CONFIG.MANIFEST.CHROMIUM, './dist/manifest.json');
}

copyManifest();
