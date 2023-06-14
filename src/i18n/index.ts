/**
 * Retrieves a list of the user's primary languages, in order of preference, with 0 being the highest
 * preference. This does not contain the region suffix or duplicates.
 *
 * @returns The ordered list of the user's primary languages, e.g. ["en", "fr"]
 */
export function getUserPrimaryLanguages(): string[] {
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
