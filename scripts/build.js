const fs = require('fs');
const JSZip = require('jszip');
const { exec } = require('child_process');
const { DISTRUBUTIONS, CONFIG, makeDevBuild } = require('./common');
const packageJson = require('../package.json');

const FAILURE = 1;

const OPTIONS = {
  BUILD: 'build',
  RELEASE: 'release',
  VERSION: 'version',
  PUSH: 'push',
};

/**
 * Gets the full release name and path for the specified distribution.
 *
 * @param {string} distribution The distribution to get the release name for
 * @returns {string} The full release name and path
 */
function getReleaseName(distribution) {
  return `${CONFIG.RELEASE}/${distribution}/${packageJson.name}-${distribution}-v${packageJson.version}.zip`;
}

/**
 * Create a zip file with the manifest and built files for the specified distribution and save it to the release folder
 * with the latest version.
 *
 * @param {string} distribution A value of DISTRUBUTIONS
 */
// TODO: Actually compress files
function makeReleaseZip(distribution) {
  const zip = new JSZip();
  zip.file('manifest.json', fs.readFileSync(CONFIG.MANIFEST[distribution]));

  fs.readdirSync(CONFIG.DIST.BUILD).forEach((file) => {
    zip.file(`content/${file}`, fs.readFileSync(`${CONFIG.DIST.BUILD}/${file}`));
  });

  fs.readdirSync(CONFIG.ASSETS).forEach((file) => {
    zip.file(`assets/${file}`, fs.readFileSync(`${CONFIG.ASSETS}/${file}`));
  });

  zip.generateAsync({ type: 'nodebuffer' }).then((content) => {
    fs.writeFileSync(getReleaseName(distribution), content);
  });
}

/**
 * Creates a release folder if it doesn't exist and creates a release zip file for each distribution.
 */
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

/**
 * Updates the version in the manifest files to the latest version specified in the package.json file.
 */
function updateManifestVersions() {
  const newVersion = packageJson.version;

  Object.values(CONFIG.MANIFEST).forEach((manifestLocation) => {
    const manifest = JSON.parse(fs.readFileSync(manifestLocation));
    manifest.version = newVersion;

    fs.writeFileSync(manifestLocation, JSON.stringify(manifest, null, 2));
  });
}

/**
 * Git add all the release files and create a commit of them with a tag of the latest version. Then push the commit and
 * tag to the remote repository.
 */
function pushRelease() {
  const commitMessage = `release: :label: v${packageJson.version}`;
  const releaseMessage = `Release v${packageJson.version}. You can download the latest version by referring to the links in the README.md.`;

  exec(
    'git add ./release/* *-manifest.json package.json package-lock.json' +
      `&& git commit -m "${commitMessage}"` +
      `&& git tag -a v${packageJson.version} -m "${releaseMessage}"` +
      `&& git push --follow-tags`,
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
/**
 * The main function of the script that will execute the relevant function depending on the flag passed to the script.
 */
function main() {
  const option = processOption();

  switch (option) {
    case DISTRUBUTIONS.CHROMIUM:
      makeDevBuild(DISTRUBUTIONS.CHROMIUM);
      break;
    case DISTRUBUTIONS.FIREFOX:
      makeDevBuild(DISTRUBUTIONS.FIREFOX);
      break;
    case OPTIONS.RELEASE:
      makeRelease();
      break;
    case OPTIONS.VERSION:
      updateManifestVersions();
      break;
    case OPTIONS.PUSH:
      pushRelease();
      break;
  }
}

main();
