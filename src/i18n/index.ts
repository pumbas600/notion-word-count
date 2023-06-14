import { Translations } from './translations';

/**
 * Finds the best language to display the text to the user in. This is the first language in the user's
 * preferred languages that is supported by this extension. If no languages are supported, English is
 * used as a fallback.
 *
 * @returns The language code to display the text in, e.g. "en"
 */
export function getUserDisplayLanguage(): string {
  const supportedLanguages = getUserPrimaryLanguages().filter(isLanguageSupported);

  if (supportedLanguages.length === 0) {
    return 'en';
  }

  return supportedLanguages[0];
}

/**
 * Retrieves a list of the user's primary languages, in order of preference, with 0 being the highest
 * preference. This does not contain the region suffix or duplicates.
 *
 * @returns The ordered list of the user's primary languages, e.g. ["en", "fr"]
 */
function getUserPrimaryLanguages(): string[] {
  return (
    navigator.languages
      .map(getPrimaryLanguageCode)
      // Remove duplicates. Don't use a set as the order is important.
      .filter((languageCode, index, allLanguageCodes) => allLanguageCodes.indexOf(languageCode) === index)
  );
}

/**
 * Removes the region suffix from a language code if it exists.
 *
 * @param language A language code in either the format "en" or "en-US"
 * @returns Just the primary language code, e.g. "en" for "en-US"
 */
function getPrimaryLanguageCode(language: string): string {
  if (language.indexOf('-') !== -1) {
    return language.split('-')[0];
  }

  return language;
}

/**
 * Returns whether the given language has translations available in this extension.
 *
 * @param language The primary language code, e.g. "en"
 * @returns Whether the language is supported
 */
function isLanguageSupported(language: string): boolean {
  return language in Translations;
}
