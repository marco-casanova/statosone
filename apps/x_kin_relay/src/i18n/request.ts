import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale, type Locale } from "./config";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = (await requestLocale) as Locale | null;
  if (!locale || !locales.includes(locale)) {
    locale = defaultLocale;
  }

  try {
    const messages = (await import(`../messages/${locale}.json`)).default;
    return { locale, messages };
  } catch {
    const messages = (await import(`../messages/${defaultLocale}.json`))
      .default;
    return { locale: defaultLocale, messages };
  }
});
