import { Translations } from './translations';

export type TranslationFunc = (key: keyof Translations, values?: Record<string, string | number>) => string;

/**
 * Builds a translation function that determines the best language to display the text in based on the user's
 * preferred languages. This is then used internally within the returned translation function whenever a value
 * is translated.
 *
 * @returns The constructed translation function
 */
export function buildTranslationFunction(): TranslationFunc {
  const language = getUserDisplayLanguage();
  console.debug(`Using language ${language} for translations`);

  return (key: keyof Translations, values?: Record<string, string | number>): string => {
    let translation = Translations[language][key];

    if (values !== undefined) {
      Object.entries(values).forEach(([key, value]) => {
        translation = translation.replace(`{{${key}}}`, translateValue(language, value));
      });
    }

    return translation;
  };
}

/**
 * Translates a value into the given language. If the value is a string, it is returned as-is. If the value
 * is a number than it is converted to a string using `toLocaleString` with the given language.
 *
 * @param language The language to translate the value into
 * @param value The value to translate
 * @returns The translated value
 */
function translateValue(language: string, value: string | number): string {
  if (typeof value === 'string') {
    return value;
  }
  return value.toLocaleString(language);
}

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
