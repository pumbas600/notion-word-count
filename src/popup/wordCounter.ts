import { Maybe } from "../types";
import { Block } from "./notion/blocks";

let pageRoot: Maybe<Element> = undefined;

function getPageRoot() {
    if (pageRoot === undefined) {
        const elements = document.getElementsByClassName('notion-page-content');
        if (elements.length !== 0) {
            throw new Error(`Expected there to only be one 'notion-page-content' but found ${elements.length}`);
        }

        pageRoot = elements[0];
    }
    
    return pageRoot;
}

function countTextNodeWords(textNode: ChildNode): number {
    const value = textNode.nodeValue;
    
    if (!value || value.trim().length === 0) {
        return 0;
    }

    return value.split(/\s+/g).length;


}

function countWords(blockElement: HTMLDivElement, block: Block): number {
    let wordCount = 0;

    const nodesStack: ChildNode[] = [blockElement];

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