import fs from 'fs';
import JSZip from 'jszip';

const FAILURE = 1;

const DISTRUBUTIONS = {
  CHROMIUM: 'CHROMIUM',
  FIREFOX: 'FIREFOX',
};

const CONFIG = {
  RELEASE: './release',
  DIST: {
    BASE: './dist',
    BUILD: './dist/content',
  },
  MANIFEST: {
    [DISTRUBUTIONS.CHROMIUM]: './src/chromium-manifest.json',
    [DISTRUBUTIONS.FIREFOX]: './src/firefox-manifest.json',
  },
};

const OPTIONS = {
  RELEASE: 'RELEASE',
};

/**
 * Creates the dist folder if it doesn't exist.
 */
function makeDist() {
  if (!fs.existsSync(CONFIG.DIST.BASE)) {
    fs.mkdirSync(CONFIG.DIST.BASE);
  }
}

/**
 * Copies the manifest specified to the dist folder.
 *
 * @param {string} manifestLocation The location of the manifest to copy
 */
function copyManifest(manifestLocation) {
  fs.copyFileSync(manifestLocation, `${CONFIG.DIST.BASE}/manifest.json`);
}

// TODO: Version and actually compress files
function makeReleaseZip(release) {
  const zip = new JSZip();
  zip.file('manifest.json', fs.readFileSync(CONFIG.MANIFEST[release]));

  fs.readdirSync(CONFIG.DIST.BUILD).forEach((file) => {
    zip.file(`content/${file}`, fs.readFileSync(`${CONFIG.DIST.BUILD}/${file}`));
  });

  zip.generateAsync({ type: 'nodebuffer' }).then((content) => {
    fs.writeFileSync(`${CONFIG.RELEASE}/${release}.zip`, content);
  });
}

function makeRelease() {
  if (!fs.existsSync(CONFIG.RELEASE)) {
    fs.mkdirSync(CONFIG.RELEASE);
  }

  Object.values(DISTRUBUTIONS).forEach(makeReleaseZip);
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

  if (!(parsedOption in OPTIONS) && parsedOption !== OPTIONS.RELEASE) {
    console.error(`Invalid option: ${option}`);
    process.exit(FAILURE);
  }

  return parsedOption;
}

function main() {
  const option = processOption();

  makeDist();
  switch (option) {
    case DISTRUBUTIONS.CHROMIUM:
      copyManifest(CONFIG.MANIFEST.CHROMIUM);
      break;
    case DISTRUBUTIONS.FIREFOX:
      copyManifest(CONFIG.MANIFEST.FIREFOX);
      break;
    case OPTIONS.RELEASE:
      makeRelease();
      break;
  }
}

main();
