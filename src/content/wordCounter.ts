import { buildTranslationFunction } from '../i18n';
import { Maybe } from '../types';
import { isNotNull } from '../utils';
import { Block, blockFromClasses } from './notion/blocks';

type BlockElementPair = [Element, Maybe<Block>];
type LabelContent = {
  isSelected: boolean;
  count: number;
};
type WordCount = {
  total: number;
  selected: number;
};

const NOTION_PAGE_ROOT_CLASS = 'notion-page-content';
const NOTION_WORD_COUNT_PARENT = 'notion-app-inner';
const NOTION_WORD_COUNT_ID = 'notion-word-count-label';
const NOTION_SELECTABLE_CLASS = 'notion-selectable';
const NOTION_SELECTED_CLASS = 'notion-selectable-halo';

const translate = buildTranslationFunction();

let interval: Maybe<NodeJS.Timer> = undefined;
let pageRoot: Maybe<Element> = undefined;
let wordCountElement: Maybe<Element> = undefined;
let previousLabelContent: Maybe<LabelContent> = undefined;

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
  const parents = document.getElementsByClassName(NOTION_WORD_COUNT_PARENT);
  if (parents.length !== 1) {
    // This could be caused by the page still loading or the user being redirected.
    console.debug(`Expected 1 word count parent element, found ${parents.length}`);
    return undefined;
  }

  const parent = parents[0] as HTMLElement;
  return createWordCountLabel(parent);
}

function getPageRoot(): Maybe<Element> {
  if (pageRoot === undefined) {
    const elements = document.getElementsByClassName(NOTION_PAGE_ROOT_CLASS);
    if (elements.length !== 1) {
      // This could be caused by the page still loading or the user being redirected.
      console.debug(`Expected 1 page root element, found ${elements.length}`);
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

function isWord(value: string): boolean {
  return value.length !== 0;
}

function countWords(value: string): number {
  const trimmedValue = value.trim();
  if (trimmedValue.length === 0) {
    return 0;
  }

  return trimmedValue.split(/[\s\.\(\)]+/g).filter(isWord).length;
}

function countTextNodeWords(textNode: HTMLElement): number {
  // InnerText joins all the text together, ignoring any elements for inline styling (I.e. bold, italics)
  return countWords(textNode.innerText);
}

function getSelectedHaloBlock(selectedHalo: Element): Element | null {
  let parent = selectedHalo.parentElement;
  while (parent !== null && !parent.classList.contains(NOTION_SELECTABLE_CLASS)) {
    parent = parent.parentElement;
  }

  return parent;
}

function countWordsInBlock(element: Element): number {
  let totalWordCount = 0;

  const textNodes = element.querySelectorAll<HTMLElement>('[data-content-editable-leaf="true"]');
  for (const textNode of textNodes) {
    totalWordCount += countTextNodeWords(textNode);
  }

  return totalWordCount;
}

function countSelectedAndTotalWordsInBlock(element: Element): WordCount {
  const totalWordCount = countWordsInBlock(element);
  const selectedBlocks = [
    ...new Set([...element.getElementsByClassName(NOTION_SELECTED_CLASS)].map(getSelectedHaloBlock).filter(isNotNull)),
  ];

  const selectedWordCount = selectedBlocks.map(countWordsInBlock).reduce((a, b) => a + b, 0);

  return {
    total: totalWordCount,
    selected: selectedWordCount,
  };
}

function countWordsInPage(pageRoot: Maybe<Element>, excludedBlocks: Block[]): WordCount {
  return getPageBlockElements(pageRoot)
    .filter(([_, block]) => block === undefined || !excludedBlocks.includes(block))
    .map(([element]) => countSelectedAndTotalWordsInBlock(element))
    .reduce(
      (aggregate, next) => {
        aggregate.total += next.total;
        aggregate.selected += next.selected;
        return aggregate;
      },
      { total: 0, selected: 0 },
    );
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

function setWordCountLabel(wordCountLabel: Element, labelContent: LabelContent) {
  // Only update the DOM if the label has changed
  if (
    previousLabelContent !== undefined &&
    previousLabelContent.isSelected === labelContent.isSelected &&
    previousLabelContent.count === labelContent.count
  ) {
    return;
  }

  const label = labelContent.isSelected
    ? translate('words.count.selected', { count: labelContent.count })
    : translate('words.count.total', { count: labelContent.count });

  wordCountLabel.innerHTML = label;
  previousLabelContent = labelContent;
}

function updateWordCountLabel(): void {
  const pageRoot = getPageRoot();
  const wordCountLabel = getWordCountLabel();

  if (pageRoot === undefined || wordCountLabel === undefined) {
    cleanUp();
    return;
  }

  const wordCount = countWordsInPage(pageRoot, [Block.Equation]);
  const selectedWordCount = countSelectedWords();

  if (wordCount.selected !== 0) {
    setWordCountLabel(wordCountLabel, { isSelected: true, count: wordCount.selected });
  } else if (selectedWordCount !== 0) {
    setWordCountLabel(wordCountLabel, { isSelected: true, count: selectedWordCount });
  } else {
    setWordCountLabel(wordCountLabel, { isSelected: false, count: wordCount.total });
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
  previousLabelContent = undefined;
}

function main(): void {
  interval = setInterval(updateWordCountLabel, 100);
  onUrlChange(() => cleanUp());
}

window.onunload = () => {
  if (interval !== undefined) {
    clearInterval(interval);
  }
};

main();
