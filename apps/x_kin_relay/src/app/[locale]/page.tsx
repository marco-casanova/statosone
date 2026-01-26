"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase, hasSupabase } from "@/lib/supabaseClient";
import LandingPage from "./landing/page";

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/").filter(Boolean)[0] || "en";
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkSession() {
      if (!hasSupabase || !supabase) {
        setChecking(false);
        return;
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          // User is logged in, redirect to app
          router.replace(`/${locale}/app?view=dashboard`);
          return;
        }
      } catch (e) {
        console.error("Session check failed:", e);
      }
      setChecking(false);
    }

    checkSession();
  }, [router, locale]);

  // Show nothing while checking session
  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 40% 30%, #1e293b, #0f172a)",
          color: "#fff",
        }}
      >
        Loading...
      </div>
    );
  }

  return <LandingPage />;
}
