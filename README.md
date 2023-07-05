## Notion Word Count

## Development

You can build the extension in it's unpacked form for local development using either:
* `npm run build:chrome`.
* `npm run build:firefox`.

To watch for changes to the `css` or `ts` files, you can use:
* `npm run dev:chrome`.
* `npm run dev:firefox`.
> **Note**
> This does not listen to changes in the manifest files or assets. If these change you will need to re-run the command.

## Release

You can make a new release of the extension by using one of the following commands:
```sh
npm run release:patch
npm run release:minor
npm run release:majot
```

Each does a respective version update, builds the code, and creates a release zip file for each of the distributions in the `release` folder. It then creates a commit with all the updated files and tags it with the new version before pushing it to GitHub.
