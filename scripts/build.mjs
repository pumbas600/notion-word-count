import fs from 'fs';

const CONFIG = {
  MANIFEST: {
    CHROMIUM: './src/chromium-manifest.json',
  },
};

function copyManifest() {
  fs.copyFileSync(CONFIG.MANIFEST.CHROMIUM, './dist/manifest.json');
}

copyManifest();
