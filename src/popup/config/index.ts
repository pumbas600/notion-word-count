export default interface Config {
    includeHeadings: boolean;
    includeCaptions: boolean;
    includeCodeBlocks: boolean;
    includeTables: boolean;
}

export const DefaultConfig: Config = {
    includeHeadings: true,
    includeCaptions: false,
    includeCodeBlocks: false,
    includeTables: true,
};