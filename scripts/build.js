const fs = require('fs');
const JSZip = require('jszip');
const { exec } = require('child_process');
const packageJson = require('../package.json');

const FAILURE = 1;

const DISTRUBUTIONS = {
  CHROMIUM: 'chromium',
  FIREFOX: 'firefox',
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
  RELEASE: 'release',
  VERSION: 'version',
  PUSH: 'push',
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

/**
 * Gets the full release name and path for the specified distribution.
 *
 * @param {string} distribution The distribution to get the release name for
 * @returns {string} The full release name and path
 */
function getReleaseName(distribution) {
  return `${CONFIG.RELEASE}/${distribution}/${packageJson.name}-${distribution}-v${packageJson.version}.zip`;
}

// TODO: Actually compress files
function makeReleaseZip(distribution) {
  const zip = new JSZip();
  zip.file('manifest.json', fs.readFileSync(CONFIG.MANIFEST[distribution]));

  fs.readdirSync(CONFIG.DIST.BUILD).forEach((file) => {
    zip.file(`content/${file}`, fs.readFileSync(`${CONFIG.DIST.BUILD}/${file}`));
  });

  zip.generateAsync({ type: 'nodebuffer' }).then((content) => {
    fs.writeFileSync(getReleaseName(distribution), content);
  });
}

function makeRelease() {
  if (!fs.existsSync(CONFIG.RELEASE)) {
    fs.mkdirSync(CONFIG.RELEASE);
  }

  Object.values(DISTRUBUTIONS).forEach((distribution) => {
    if (!fs.existsSync(`${CONFIG.RELEASE}/${distribution}`)) {
      fs.mkdirSync(`${CONFIG.RELEASE}/${distribution}`);
    }

    makeReleaseZip(distribution);
  });
}

function updateManifestVersions() {
  const newVersion = packageJson.version;

  Object.values(CONFIG.MANIFEST).forEach((manifestLocation) => {
    const manifest = JSON.parse(fs.readFileSync(manifestLocation));
    manifest.version = newVersion;

    fs.writeFileSync(manifestLocation, JSON.stringify(manifest, null, 2));
  });
}

function pushRelease() {
  const commitMessage = `release: :label: v${packageJson.version}`;
  const releaseMessage = `Release v${packageJson.version}. You can download the latest version by referring to the links in the README.md.`;
  exec(
    `git commit -m "${commitMessage}" && git tag -a v${packageJson.version} -m "${releaseMessage}" && git push --follow-tags`,
  );
}

/**
 * Processes and validates the arguments passed to the script. If the option is not valid then the script will exit.
 *
 * @returns {string} The processed option
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
  if (parsedOption in DISTRUBUTIONS) {
    return DISTRUBUTIONS[parsedOption];
  }

  if (parsedOption in OPTIONS) {
    return OPTIONS[parsedOption];
  }

  console.error(`Invalid option: ${option}`);
  process.exit(FAILURE);
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
    case OPTIONS.VERSION:
      updateManifestVersions();
      break;
    case OPTIONS.PUSH:
      pushRelease();
  }
}

main();
