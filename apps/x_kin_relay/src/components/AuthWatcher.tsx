"use client";
import { useEffect } from "react";
import { supabase, hasSupabase } from "@/lib/supabaseClient";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useToast } from "./Toast";

export function AuthWatcher() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split("/").filter(Boolean)[0] || "en";
  const t = useTranslations();
  const { push } = useToast();

  useEffect(() => {
    if (!hasSupabase || !supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || (event === "TOKEN_REFRESHED" && !session)) {
        push(t("auth.session_expired"), "error");
        router.replace(
          `/${locale}?auth_error=${encodeURIComponent(
            t("auth.session_expired")
          )}`
        );
      }
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, [pathname, router, locale, t, push]);
  return null;
}
