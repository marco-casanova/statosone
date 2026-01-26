export const locales = [
  "de", // German
  "en", // English
  "tr", // Turkish
  "ar", // Arabic
  "pl", // Polish
  "ru", // Russian
  "uk", // Ukrainian
  "es", // Spanish
  "el", // Greek
  "sq", // Albanian
  "it", // Italian
] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en"; // changed fallback to English as requested
export const rtlLocales = new Set<Locale>(["ar"]);
