"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createBrowserClient } from "./supabase-browser";
import type { StratosUser, AuthState } from "../types";

/**
 * Lightweight hook for auth state without the full provider
 * Useful for components that just need to check auth status
 */
export function useAuthState(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const supabase = createBrowserClient();

    if (!supabase) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user as StratosUser | null,
        session,
        loading: false,
        error: null,
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setState({
          user: session?.user as StratosUser | null,
          session,
          loading: false,
          error: null,
        });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
