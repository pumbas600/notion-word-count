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

module.exports = { DISTRUBUTIONS, CONFIG };
