import { Maybe } from '../types';
import { Block, blockFromClasses } from './notion/blocks';

const NOTION_PAGE_ROOT_CLASS = 'notion-page-content';
const NOTION_WORD_COUNT_PARENT = 'notion-app-inner';
const NOTION_WORD_COUNT_ID = 'notion-word-count-label';

let interval: Maybe<NodeJS.Timer> = undefined;
let pageRoot: Maybe<Element> = undefined;
let wordCountElement: Maybe<Element> = undefined;
let lastWarned = false;
let previousWordCount = -1;

type BlockElementPair = [Element, Maybe<Block>];

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
      // This can sometimes be undefined after switching pages
      console.warn(`Expected there to be exactly one '${NOTION_PAGE_ROOT_CLASS}' but found ${elements.length}`);
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

function getPageBlockElements(): BlockElementPair[] {
  const pageRoot = getPageRoot();
  if (pageRoot === undefined) {
    return [];
  }

  return Array.of(...pageRoot.children).map((element) => [element, blockFromClasses(element.classList)]);
}

function countTextNodeWords(textNode: ChildNode): number {
  const value = textNode.nodeValue;

  if (!value) {
    return 0;
  }

  const trimmedValue = value.trim();
  if (trimmedValue.length === 0) {
    return 0;
  }

  return trimmedValue.split(/\s+/g).length;
}

function countWords([element, block]: BlockElementPair): number {
  let wordCount = 0;

  const nodesStack: ChildNode[] = [element];

  while (nodesStack.length !== 0) {
    const node = nodesStack.pop()!;
    if (node.nodeType == Node.TEXT_NODE) {
      wordCount += countTextNodeWords(node);
    } else {
      for (const child of node.childNodes) {
        // Absolute elements seem to be UI elements that should be ignored
        if (child instanceof HTMLElement && child.style.position === 'absolute') {
          continue;
        }
        nodesStack.push(child);
      }
    }
  }

  return wordCount;
}

function countWordsInPage(excludedBlocks: Block[]): number {
  return getPageBlockElements()
    .filter(([_, block]) => block === undefined || !excludedBlocks.includes(block))
    .map(countWords)
    .reduce((a, b) => a + b, 0);
}

function updateWordCountLabel() {
  const wordCountLabel = getWordCountLabel();
  if (wordCountLabel !== undefined) {
    const wordCount = countWordsInPage([]);
    if (previousWordCount !== wordCount) {
      wordCountLabel.innerHTML = `Word count: ${wordCount}`;
      previousWordCount = wordCount;
    }
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
  previousWordCount = -1;
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
