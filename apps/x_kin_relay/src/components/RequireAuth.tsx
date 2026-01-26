"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase, hasSupabase } from "@/lib/supabaseClient";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/").filter(Boolean)[0] || "en";
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    async function run() {
      if (!hasSupabase || !supabase) {
        router.replace(
          `/${locale}?auth_error=${encodeURIComponent("Auth disabled")}`
        );
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace(
          `/${locale}?auth_error=${encodeURIComponent("Please login")}`
        );
        return;
      }
      setChecked(true);
    }
    run();
  }, [router, locale]);

  if (!checked) return null;
  return <>{children}</>;
}
