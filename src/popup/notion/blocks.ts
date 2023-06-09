import { ValuesOf, Maybe } from '../../types';

export const Block = {
  Heading: 'header',
  Caption: 'caption',
  Code: 'code',
  Table: 'table',
  Text: 'text',
} as const;

export type Block = ValuesOf<typeof Block>;

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

    // For now, group all of the headings together
    if (blockName.endsWith(Block.Heading)) {
      return Block.Heading;
    }

    if (blockName in Object.values(Block)) {
      return blockName as Block;
    }
  }

  return undefined;
}
