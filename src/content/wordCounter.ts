import { Maybe } from '../types';
import { Block, blockFromClasses } from './notion/blocks';

type BlockElementPair = [Element, Maybe<Block>];
interface WordCount {
  total: number;
  selected: number;
}

const NOTION_PAGE_ROOT_CLASS = 'notion-page-content';
const NOTION_WORD_COUNT_PARENT = 'notion-app-inner';
const NOTION_WORD_COUNT_ID = 'notion-word-count-label';

let interval: Maybe<NodeJS.Timer> = undefined;
let pageRoot: Maybe<Element> = undefined;
let wordCountElement: Maybe<Element> = undefined;
let lastWarned = false;
let previousWordCount: WordCount = {
  total: -1,
  selected: -1,
};

function createWordCountLabel(parent: HTMLElement): Element {
  const wordCountParent = document.createElement('div');
  wordCountParent.id = 'notion-word-count-label-parent';

  const wordCountLabel = document.createElement('div');
  wordCountLabel.id = NOTION_WORD_COUNT_ID;

  wordCountParent.appendChild(wordCountLabel);
  parent.insertBefore(wordCountParent, parent.firstChild);
  return wordCountLabel;
}

function attachWordCountLabel(): Maybe<Element> {
  const helpButtons = document.getElementsByClassName(NOTION_WORD_COUNT_PARENT);
  if (helpButtons.length !== 1) {
    if (!lastWarned) {
      lastWarned = true;
      console.warn(
        `Expected there to only be exactly one '${NOTION_WORD_COUNT_PARENT}' but found ${helpButtons.length}`,
      );
    }
    return undefined;
  }

  lastWarned = false;
  const helpButton = helpButtons[0] as HTMLElement;
  return createWordCountLabel(helpButton);
}

function getPageRoot(): Maybe<Element> {
  if (pageRoot === undefined) {
    const elements = document.getElementsByClassName(NOTION_PAGE_ROOT_CLASS);
    if (elements.length !== 1) {
      // This could be caused by the page still loading or the user being redirected.
      return undefined;
    }

    pageRoot = elements[0];
  }

  return pageRoot;
}

function getWordCountLabel(): Maybe<Element> {
  if (wordCountElement === undefined) {
    wordCountElement = document.getElementById(NOTION_WORD_COUNT_ID) ?? undefined;
    if (wordCountElement === undefined) {
      wordCountElement = attachWordCountLabel();
    }
  }

  return wordCountElement;
}

function getPageBlockElements(pageRoot: Maybe<Element>): BlockElementPair[] {
  if (pageRoot === undefined) {
    return [];
  }

  return Array.of(...pageRoot.children).map((element) => [element, blockFromClasses(element.classList)]);
}

function countWords(value: string): number {
  const trimmedValue = value.trim();
  if (trimmedValue.length === 0) {
    return 0;
  }

  return trimmedValue.split(/\s+/g).length;
}

function countTextNodeWords(textNode: HTMLElement): number {
  // InnerText joins all the text together, ignoring any elements for inline styling (I.e. bold, italics)
  return countWords(textNode.innerText);
}

function countWordsInBlock([element, block]: BlockElementPair): number {
  let wordCount = 0;

  const textNodes = element.querySelectorAll<HTMLElement>('[data-content-editable-leaf="true"]');
  for (const textNode of textNodes) {
    wordCount += countTextNodeWords(textNode);
  }

  return wordCount;
}

function countWordsInPage(pageRoot: Maybe<Element>, excludedBlocks: Block[]): number {
  return getPageBlockElements(pageRoot)
    .filter(([_, block]) => block === undefined || !excludedBlocks.includes(block))
    .map(countWordsInBlock)
    .reduce((a, b) => a + b, 0);
}

function countSelectedWords(): number {
  const selection = window.getSelection();
  if (selection === null) {
    return 0;
  }

  const selectedText = selection.toString().trim();
  if (selectedText.length === 0) {
    return 0;
  }

  return countWords(selectedText);
}

function wordCountChanged(newWordCount: WordCount): boolean {
  return previousWordCount.total !== newWordCount.total || previousWordCount.selected !== newWordCount.selected;
}

function updateWordCountLabel() {
  const pageRoot = getPageRoot();
  const wordCountLabel = getWordCountLabel();
  if (pageRoot !== undefined && wordCountLabel !== undefined) {
    const wordCount: WordCount = {
      total: countWordsInPage(pageRoot, []),
      selected: countSelectedWords(),
    };

    if (wordCount.selected !== 0) {
      if (wordCount.selected !== previousWordCount.selected) {
        wordCountLabel.innerHTML = `${wordCount.selected} words selected`;
      }
    } else if (wordCount.total !== previousWordCount.total) {
      wordCountLabel.innerHTML = `${wordCount.total} words`;
    }

    previousWordCount = wordCount;
  } else {
    cleanUp();
  }
}

// Modified from: https://stackoverflow.com/questions/3522090/event-when-window-location-href-changes
function onUrlChange(onChange: VoidFunction): void {
  let oldHref = document.location.href;
  const body = document.querySelector('body');
  if (body === null) {
    throw new Error('Expected html body tag to be defined');
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
      if (oldHref !== document.location.href) {
        oldHref = document.location.href;
        onChange();
      }
    });
  });

  observer.observe(body, { childList: true, subtree: true });
}

function cleanUp(): void {
  if (wordCountElement !== undefined) {
    if (wordCountElement.parentElement !== null) {
      wordCountElement.parentElement.remove();
    } else {
      wordCountElement.remove();
    }
  }

  pageRoot = undefined;
  wordCountElement = undefined;
  lastWarned = false;
  previousWordCount = {
    total: -1,
    selected: -1,
  };
}

function main(): void {
  interval = setInterval(updateWordCountLabel, 100);
  onUrlChange(() => cleanUp());
  console.log('main');
}

window.onload = () => {
  main();
};

window.onunload = () => {
  if (interval !== undefined) {
    clearInterval(interval);
  }
};
