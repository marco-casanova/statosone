import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
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
  params: Promise<{ locale: string }>;
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
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  if (!locales.includes(locale)) notFound();

  // Inform next-intl of the active locale when we're not using its middleware
  setRequestLocale(locale);

  const messages = await getMessages();
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
