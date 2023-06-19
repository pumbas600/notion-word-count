import fs from 'fs';

const CONFIG = {
  MANIFEST: {
    CHROMIUM: './src/chromium-manifest.json',
    FIREFOX: './src/firefox-manifest.json',
  },
};

const OPTIONS = {
  CHROMIUM: 'chromium',
  FIREFOX: 'firefox',
  RELEASE: 'release',
};

/**
 * Copies the manifest specified to the dist folder.
 *
 * @param {string} manifestLocation The location of the manifest to copy
 */
function copyManifest(manifestLocation) {
  fs.copyFileSync(manifestLocation, './dist/manifest.json');
}

function makeRelease() {
  console.log('Making release...');
}

/**
 * Processes and validates the arguments passed to the script.
 *
 * @returns {string | undefined}
 */
function processOption() {
  if (process.argv.length < 3 || process.argv.length > 3) {
    console.error('Invalid number of arguments');
    return 1;
  }

  const [_node, _script, option] = process.argv;
  if (!option.startsWith('--')) {
    console.error(`Invalid option: ${option}`);
    return;
  }

  const parsedOption = option.substring(2).toUpperCase();

  if (!(parsedOption in OPTIONS)) {
    console.error(`Invalid option: ${option}`);
    return;
  }

  return parsedOption;
}

function main() {
  const option = processOption();
  if (!option) {
    return;
  }

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
