"use client";

import { useEffect, useState, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase, hasSupabase } from "@/lib/supabase/client";

interface RequireAuthProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function RequireAuth({
  children,
  requireAdmin = false,
}: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    async function run() {
      if (!hasSupabase || !supabase) {
        router.replace("/?error=auth_disabled");
        return;
      }

      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      if (requireAdmin) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.session.user.id)
          .single();

        if (profile?.role !== "admin") {
          router.replace("/dashboard");
          return;
        }
      }

      setChecked(true);
    }
    run();
  }, [router, pathname, requireAdmin]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner" />
      </div>
    );
  }

  return <>{children}</>;
}
