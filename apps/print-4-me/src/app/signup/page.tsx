"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, hasSupabase } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import { Printer, Mail, Lock, User, ArrowRight, Check } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { push } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if already logged in
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
          router.replace("/dashboard");
          return;
        }
      } catch (e) {
        console.error("Session check failed:", e);
      }
      setChecking(false);
    }
    checkSession();
  }, [router]);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!hasSupabase || !supabase) {
      push("Authentication is not configured", "error");
      return;
    }

    if (password.length < 8) {
      push("Password must be at least 8 characters", "error");
      return;
    }

    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        push(error.message, "error");
        setLoading(false);
        return;
      }

      // Update profile with name
      if (data.user) {
        await supabase
          .from("profiles")
          .update({ full_name: name })
          .eq("id", data.user.id);
      }

      push("Account created! Please check your email to verify.", "success");
      router.push("/login");
    } catch (err) {
      push("Signup failed. Please try again.", "error");
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-forge-50 p-4 sm:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-[0_25px_70px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 lg:grid-cols-[1fr_1.08fr]">
        {/* Left side — Form */}
        <div className="flex items-center justify-center bg-white p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-md">
            <Link href="/" className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 bg-gradient-to-br from-forge-500 to-flow-500 rounded-xl flex items-center justify-center shadow-lg shadow-forge-500/30">
                <Printer className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">
                Print-4-Me
              </span>
            </Link>

            <div className="mb-8">
              <p className="inline-flex items-center rounded-full bg-flow-100 text-flow-700 px-3 py-1 text-xs font-semibold tracking-wide uppercase mb-4">
                Create Account
              </p>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">
                Start creating today
              </h1>
              <p className="text-slate-600 text-base">
                Join Print-4-Me and bring your 3D designs to life.
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-12 rounded-xl border border-slate-300 bg-white pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-forge-100 focus:border-forge-400 transition-colors"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 rounded-xl border border-slate-300 bg-white pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-forge-100 focus:border-forge-400 transition-colors"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 rounded-xl border border-slate-300 bg-white pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-forge-100 focus:border-forge-400 transition-colors"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  At least 8 characters
                </p>
              </div>

              <label className="flex items-start gap-3 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-forge-600 focus:ring-forge-300"
                />
                <span>
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-forge-700 hover:text-forge-800 font-medium"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-forge-700 hover:text-forge-800 font-medium"
                  >
                    Privacy Policy
                  </a>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-forge-500 to-forge-600 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-forge-500/30 disabled:opacity-60 transition-all"
              >
                {loading ? (
                  <div className="spinner" />
                ) : (
                  <>
                    Create Account <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-slate-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-forge-700 hover:text-forge-800 font-semibold"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Right side — Marketing */}
        <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-flow-900 p-12 text-white">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -left-10 h-52 w-52 rounded-full bg-flow-500/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-forge-500/20 blur-3xl" />
          </div>

          <div className="relative max-w-lg">
            <h2 className="text-4xl font-black leading-tight mb-5 text-white">
              Bring your ideas to life
            </h2>
            <p className="text-lg text-slate-200 leading-relaxed mb-8">
              Upload your 3D models, pick materials and colors, then track every
              step from payment to delivery.
            </p>
            <ul className="space-y-4">
              {[
                "Free 3D model preview",
                "Multiple material options",
                "Fast delivery with tracking",
                "100% quality guarantee",
              ].map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-3 text-slate-200"
                >
                  <div className="w-6 h-6 rounded-full bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
            <p className="text-sm text-slate-100 leading-relaxed italic">
              &quot;Print-4-Me helped us prototype in days. The quality and
              communication were excellent.&quot;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-forge-400 to-flow-400 flex items-center justify-center text-white text-sm font-bold">
                S
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Sabrina M.</p>
                <p className="text-xs text-slate-300">Product Designer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
