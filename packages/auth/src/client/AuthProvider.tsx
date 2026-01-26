"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { createBrowserClient } from "./supabase-browser";
import type { StratosUser, AuthState, UserRole } from "../types";

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  defaultRole?: UserRole;
}

export function AuthProvider({
  children,
  defaultRole = "user",
}: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  const supabase = createBrowserClient();

  const fetchUserRole = useCallback(
    async (userId: string): Promise<UserRole> => {
      if (!supabase) return defaultRole;

      try {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();

        return (data?.role as UserRole) || defaultRole;
      } catch {
        return defaultRole;
      }
    },
    [supabase, defaultRole]
  );

  const updateAuthState = useCallback(
    async (session: Session | null) => {
      if (!session?.user) {
        setState({
          user: null,
          session: null,
          loading: false,
          error: null,
        });
        return;
      }

      const role = await fetchUserRole(session.user.id);
      const stratosUser: StratosUser = {
        ...session.user,
        role,
      };

      setState({
        user: stratosUser,
        session,
        loading: false,
        error: null,
      });
    },
    [fetchUserRole]
  );

  useEffect(() => {
    if (!supabase) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateAuthState(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      updateAuthState(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, updateAuthState]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) {
        return { error: new Error("Auth not available") };
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setState((prev) => ({ ...prev, loading: false, error }));
        return { error };
      }

      return { error: null };
    },
    [supabase]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (!supabase) {
        return { error: new Error("Auth not available") };
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setState((prev) => ({ ...prev, loading: false, error }));
        return { error };
      }

      return { error: null };
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;

    await supabase.auth.signOut();
    setState({
      user: null,
      session: null,
      loading: false,
      error: null,
    });
  }, [supabase]);

  const resetPassword = useCallback(
    async (email: string) => {
      if (!supabase) {
        return { error: new Error("Auth not available") };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        return { error };
      }

      return { error: null };
    },
    [supabase]
  );

  const refreshSession = useCallback(async () => {
    if (!supabase) return;

    const {
      data: { session },
    } = await supabase.auth.refreshSession();
    await updateAuthState(session);
  }, [supabase, updateAuthState]);

  const value: AuthContextValue = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
