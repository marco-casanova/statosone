"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, hasSupabase } from "@/lib/supabase/client";

export function AuthWatcher() {
  const router = useRouter();

  useEffect(() => {
    if (!hasSupabase || !supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.replace("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return null;
}
