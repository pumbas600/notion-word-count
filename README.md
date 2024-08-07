![Notion Word Count](./images/notion_word_count_banner.png#gh-light-mode-only)
![Notion Word Count](./images/notion_word_count_banner_dark.png#gh-dark-mode-only)


This is a browser extension that adds a word count to the **bottom right corner** of the web version of [Notion](https://www.notion.so/). Highlighting text will only show the word count for the selected text.

| Default | Selecting |
| ------- | --------- |
| ![A simple notion page with a word count displayed in the bottom right corner.](./images/word_count_example.png#gh-light-mode-only) ![A simple notion page with a word count displayed in the bottom right corner.](./images/word_count_example_dark.png#gh-dark-mode-only)| ![A simple notion page with a word count displayed for the selected text in the bottom right corner.](./images/word_count_selecting_example.png#gh-light-mode-only) ![A simple notion page with a word count displayed in the bottom right corner.](./images/word_count_example_dark.png#gh-dark-mode-only) | 


## 🌐 Internationalisation

This extension is currently available in **English** and **French**. You can add more languages by creating a pull request translating the [two lines here](./src/i18n/translations.ts).

Your preferred language is **automatically** determined by first checking the language set in Notion and then checking your browser languages until a supported language is found. If no supported language is found, it will default to English.

<img alt="A simple notion page with a word count displayed in French for the selected text in the bottom right corner" src="./images/word_count_selecting_french_example.png#gh-light-mode-only" width=350px/>
<img alt="A simple notion page with a word count displayed in French for the selected text in the bottom right corner" src="./images/word_count_selecting_french_example_dark.png#gh-dark-mode-only" width=350px/>

## 🔨 Development

You can build the extension in it's unpacked form for local development using either:
* `npm run build:chrome`.
* `npm run build:firefox`.

To watch for changes to the `css` or `ts` files, you can use:
* `npm run dev:chrome`.
* `npm run dev:firefox`.
> [!NOTE]
> This does not listen to changes in the manifest files or assets. If these change you will need to re-run the command.

### Loading unpacked extensions

**Chrome**
- Go to `chrome://extensions/`.
- Enable `Developer mode`.
- Click `Load unpacked` and select the `dist` folder.

**Firefox**
- Go to `about:debugging#/runtime/this-firefox`.
- Click `Load Temporary Add-on...` and select the `manifest.json` file in the `dist` folder.

## 🚀 Release

You can make a new release of the extension by using one of the following commands:
```sh
npm run release:patch
npm run release:minor
npm run release:major
```

Each does a respective version update, builds the code, and creates a release zip file for each of the distributions in the `release` folder. It then creates a commit with all the updated files and tags it with the new version before pushing it to GitHub.

## 💌 Acknowledgements

A big thank you to [Notion](https://www.notion.so/) for creating something worth making this for 💖.