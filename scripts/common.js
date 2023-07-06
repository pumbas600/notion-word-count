const fs = require('fs');

const DISTRUBUTIONS = {
  CHROMIUM: 'chromium',
  FIREFOX: 'firefox',
};

const CONFIG = {
  RELEASE: './release',
  ASSETS: './src/assets',
  DIST: {
    BASE: './dist',
    BUILD: './dist/content',
  },
  MANIFEST: {
    [DISTRUBUTIONS.CHROMIUM]: './src/chromium-manifest.json',
    [DISTRUBUTIONS.FIREFOX]: './src/firefox-manifest.json',
  },
};

/**
 * Prepares the dist folder for building by cleaning it and creating it if it doesn't exist.
 */
function prepareBuild() {
  cleanDist();
  makeDist();
}

/**
 * Creates the dist folder if it doesn't exist.
 */
function makeDist() {
  if (!fs.existsSync(CONFIG.DIST.BASE)) {
    fs.mkdirSync(CONFIG.DIST.BASE);
  }
}

/**
 * Deletes the dist folder if it exists.
 */
function cleanDist() {
  if (fs.existsSync(CONFIG.DIST.BASE)) {
    fs.rmSync(CONFIG.DIST.BASE, { recursive: true });
  }
}

/**
 * Copies the assets folder to the specified location and creates an assets folder there if it doesn't already exist.
 *
 * @param {string} newLocation The location to copy the assets folder to
 */
function copyAssetsTo(newLocation) {
  if (!fs.existsSync(`${newLocation}/assets`)) {
    fs.mkdirSync(`${newLocation}/assets`);
  }

  fs.readdirSync(CONFIG.ASSETS).forEach((file) => {
    fs.copyFileSync(`${CONFIG.ASSETS}/${file}`, `${newLocation}/assets/${file}`);
  });
}

/**
 * Creates a development build of the extension for the specified distribution. This is done by copying the assets and the
 * manifest for that distribution to the dist folder.
 *
 * @param {string} distribution The distribution to make a dev build for
 */
function makeDevBuild(distribution) {
  copyAssetsTo(CONFIG.DIST.BASE);
  fs.copyFileSync(CONFIG.MANIFEST[distribution], `${CONFIG.DIST.BASE}/manifest.json`);
}

module.exports = { DISTRUBUTIONS, CONFIG, prepareBuild, makeDevBuild };
