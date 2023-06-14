export type Translations = {
  'words.count.total': string;
  'words.count.selected': string;
};

export const Translations: Record<string, Translations> = {
  en: {
    'words.count.total': '{{count}} words',
    'words.count.selected': '{{count}} words selected',
  },
  fr: {
    'words.count.total': '{{count}} mots',
    'words.count.selected': '{{count}} mots sélectionnés',
  },
} as const;
