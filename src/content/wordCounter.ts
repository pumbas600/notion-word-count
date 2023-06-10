import { Maybe } from '../types';
import { Block, blockFromClasses } from './notion/blocks';

const NOTION_PAGE_ROOT_CLASS = 'notion-page-content';
const NOTION_WORD_COUNT_ID = 'notion-word-count-label';

let pageRoot: Maybe<Element> = undefined;
let wordCountElement: Maybe<Element> = undefined;

type BlockElementPair = [Element, Maybe<Block>];

function attachWordCountLabel(): Element {
  throw new Error('Function not implemented.');
}

function getPageRoot(): Element {
  if (pageRoot === undefined) {
    const elements = document.getElementsByClassName(NOTION_PAGE_ROOT_CLASS);
    if (elements.length !== 0) {
      throw new Error(`Expected there to only be exactly one '${NOTION_PAGE_ROOT_CLASS}' but found ${elements.length}`);
    }

    pageRoot = elements[0];
  }

  return pageRoot;
}

function getWordCountElement(): Element {
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
  return Array.of(...pageRoot.children).map((element) => [element, blockFromClasses(element.classList)]);
}

function countTextNodeWords(textNode: ChildNode): number {
  const value = textNode.nodeValue;

  if (!value || value.trim().length === 0) {
    return 0;
  }

  return value.split(/\s+/g).length;
}

function countWords([element, block]: BlockElementPair): number {
  let wordCount = 0;

  const nodesStack: ChildNode[] = [element];

  while (nodesStack.length !== 0) {
    const node = nodesStack.pop()!;
    if (node.nodeType == Node.TEXT_NODE) {
      wordCount += countTextNodeWords(node);
    } else {
      nodesStack.push(...node.childNodes);
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

console.log('Hello there!');
