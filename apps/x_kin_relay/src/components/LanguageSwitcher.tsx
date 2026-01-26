"use client";
import React, { useTransition } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { locales, type Locale, rtlLocales } from "../i18n/config";

// Map locale code to native language name (endonym)
const localeLabels: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  tr: "Türkçe",
  ar: "العربية",
  pl: "Polski",
  ru: "Русский",
  uk: "Українська",
  es: "Español",
  el: "Ελληνικά",
  sq: "Shqip",
  it: "Italiano",
};

function deriveLocaleFromPath(pathname: string): Locale {
  const first = pathname.split("/").filter(Boolean)[0];
  if (locales.includes(first as Locale)) return first as Locale;
  return "en"; // fallback
}

export default function LanguageSwitcher({
  compact = false,
}: {
  compact?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const current = deriveLocaleFromPath(pathname);
  const tCommon = useTranslations("common");

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as Locale;
    if (next === current) return;
    // Replace the first segment (locale) with the new one.
    const segments = pathname.split("/");
    const updated = segments.map((seg, idx) => (idx === 1 ? next : seg));
    // If no locale segment currently present (unlikely), just prefix.
    const newPath = locales.includes(segments[1] as Locale)
      ? updated.join("/")
      : `/${next}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
    startTransition(() => router.push(newPath));
  }

  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
      }}
    >
      <span
        style={{
          opacity: 0.75,
          display: compact ? "none" : "inline",
          color: "#0f172a",
          fontWeight: 600,
        }}
      >
        {tCommon("language")}
      </span>
      <select
        aria-label="Select language"
        value={current}
        onChange={onChange}
        dir={rtlLocales.has(current) ? "rtl" : "ltr"}
        style={{
          background: "#f1f5f9",
          color: "#0f172a",
          border: "1px solid #cbd5e1",
          borderRadius: 10,
          padding: "6px 10px",
          fontSize: 12,
          minWidth: 110,
          fontWeight: 600,
          boxShadow: "0 2px 4px rgba(0,0,0,0.06) inset",
          transition: "border-color .15s, background .15s",
        }}
        disabled={isPending}
      >
        {locales.map((l) => (
          <option
            key={l}
            value={l}
            dir={rtlLocales.has(l) ? "rtl" : "ltr"}
            style={{ background: "#fff", color: "#0f172a" }}
          >
            {localeLabels[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
