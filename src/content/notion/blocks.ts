import { ValuesOf, Maybe } from '../../types';

export type Block = ValuesOf<typeof Block>;

export const Block = {
  Heading: 'header',
  SubHeading: 'sub_header',
  SubSubHeading: 'sub_sub_header',
  Caption: 'caption',
  Code: 'code',
  Table: 'table',
  Text: 'text',
  Equation: 'equation',
  TodoList: 'to_do',
} as const;

const BlockValues: string[] = Object.values(Block);
export const DEFAULT_EXCLUDED_BLOCKS = [Block.Code, Block.Caption];

export function isBlock(blockName: string): blockName is Block {
  return BlockValues.includes(blockName);
}

export function blockFromClasses(classes: DOMTokenList): Maybe<Block> {
  for (const className of classes) {
    if (!className.startsWith('notion') || !className.endsWith('block')) {
      continue;
    }

    const blockNameStartIndex = className.indexOf('-') + 1;
    const blockNameEndIndex = className.lastIndexOf('-');

    if (blockNameStartIndex == -1 || blockNameEndIndex == -1) {
      continue;
    }

    const blockName = className.substring(blockNameStartIndex, blockNameEndIndex);
    if (isBlock(blockName)) {
      return blockName;
    }
  }

  return undefined;
}
