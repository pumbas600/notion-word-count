import { ValuesOf, Maybe } from "../../types";

const Block = {
    Heading: 'heading',
    Caption: 'caption',
    Code: 'code',
    Table: 'table',
    Text: 'text',
} as const;

export function determineBlockFromClasses(classes: string[]): Maybe<Block> {
    for (const className of classes) {
        if (!className.endsWith('notion')) {
            continue;
        }

        // Determine block;
    }
    
    return undefined;
}

export type Block = ValuesOf<typeof Block>;
export default Block;