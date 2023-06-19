import fs from 'fs';

const FAILURE = 1;

const CONFIG = {
  DIST: './dist',
  MANIFEST: {
    CHROMIUM: './src/chromium-manifest.json',
    FIREFOX: './src/firefox-manifest.json',
  },
};

const OPTIONS = {
  CHROMIUM: 'CHROMIUM',
  FIREFOX: 'FIREFOX',
  RELEASE: 'RELEASE',
};

/**
 * Creates the dist folder if it doesn't exist.
 */
function makeDist() {
  if (!fs.existsSync(CONFIG.DIST)) {
    fs.mkdirSync(CONFIG.DIST);
  }
}

/**
 * Copies the manifest specified to the dist folder.
 *
 * @param {string} manifestLocation The location of the manifest to copy
 */
function copyManifest(manifestLocation) {
  fs.copyFileSync(manifestLocation, `${CONFIG.DIST}/manifest.json`);
}

function makeRelease() {
  console.log('Making release...');
}

/**
 * Processes and validates the arguments passed to the script.
 *
 * @returns {string}
 */
function processOption() {
  if (process.argv.length < 3 || process.argv.length > 3) {
    console.error('Invalid number of arguments');
    process.exit(FAILURE);
  }

  const [_node, _script, option] = process.argv;
  if (!option.startsWith('--')) {
    console.error(`Invalid option: ${option}`);
    process.exit(FAILURE);
  }

  const parsedOption = option.substring(2).toUpperCase();

  if (!(parsedOption in OPTIONS)) {
    console.error(`Invalid option: ${option}`);
    process.exit(FAILURE);
  }

  return parsedOption;
}

function main() {
  const option = processOption();

  makeDist();
  switch (option) {
    case OPTIONS.CHROMIUM:
      copyManifest(CONFIG.MANIFEST.CHROMIUM);
      break;
    case OPTIONS.FIREFOX:
      copyManifest(CONFIG.MANIFEST.FIREFOX);
      break;
    case OPTIONS.RELEASE:
      makeRelease();
      break;
  }
}

main();
