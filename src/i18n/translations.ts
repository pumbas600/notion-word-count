export type Translations = {
  totalWords: string;
  selectedWords: string;
};

export const Translations: Record<string, Translations> = {
  en: {
    totalWords: '{{count}} words',
    selectedWords: '{{count}} words selected',
  },
} as const;
