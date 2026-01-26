import { NextIntlClientProvider } from "next-intl";
import { ToastProvider } from "../../components/Toast";
import { AuthWatcher } from "../../components/AuthWatcher";
import { notFound } from "next/navigation";
import { locales, rtlLocales, type Locale } from "../../i18n/config";
import "../globals.css";

export async function generateStaticParams() {
  return locales.map((l) => ({ locale: l }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return {
    metadataBase: new URL("https://carebridge.example"),
    title: {
      default: "Care Bridge — Simple care handovers",
      template: "%s · Care Bridge",
    },
    description: "Daily care logs and one-tap handover PDFs.",
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
  } as const;
}

export default async function RootLayout({
  children,
  params,
}: {
  children: any;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale)) notFound();

  async function loadMessages(l: Locale): Promise<Record<string, unknown>> {
    try {
      const mod = await import(`../../messages/${l}.json`);
      const data = (mod.default ?? {}) as Record<string, unknown>;
      if (Object.keys(data).length === 0)
        throw new Error("empty locale messages");
      return data;
    } catch {
      // Fallback to English if specific locale messages are missing or invalid
      const fallback = await import(`../../messages/en.json`);
      return (fallback.default ?? {}) as Record<string, unknown>;
    }
  }

  const messages = await loadMessages(locale);
  const dir = rtlLocales.has(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ToastProvider>
            <AuthWatcher />
            {children}
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
