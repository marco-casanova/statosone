"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase, hasSupabase } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import { Printer, Mail, Lock, ArrowRight, Star } from "lucide-react";

const COMMUNITY_FACES = [
  { name: "Kayle", src: "/pics/kayle.png" },
  { name: "Max", src: "/pics/max.png" },
  { name: "Sabrina", src: "/pics/sabrina.png" },
  { name: "Tom", src: "/pics/tom.png" },
];

const REVIEWS = [
  {
    name: "Sabrina M.",
    role: "Product Designer",
    avatar: "/pics/sabrina.png",
    quote:
      "Print-4-Me helped us prototype in days. The quality and communication were excellent.",
  },
  {
    name: "Tom R.",
    role: "Mechanical Engineer",
    avatar: "/pics/tom.png",
    quote:
      "Fast quotes, reliable prints, and smooth delivery updates. It saved our team real time.",
  },
  {
    name: "Max K.",
    role: "Hobby Collector",
    avatar: "/pics/max.png",
    quote:
      "I’m a huge fan of printing action figures and collectibles. Print-4-Me gives me clean details, great color choices, and consistent quality every time.",
  },
  {
    name: "Kayle P.",
    role: "Maker & Cosplay Builder",
    avatar: "/pics/kayle.png",
    quote:
      "The upload-to-payment flow is simple, and the production updates are clear. It’s become my go-to service for hobby and cosplay parts.",
  },
];

function FiveStars() {
  return (
    <div className="flex items-center gap-1 text-amber-300">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className="w-4 h-4 fill-current" />
      ))}
    </div>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { push } = useToast();
  const redirect = searchParams.get("redirect") || "/dashboard";

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
          router.replace(redirect);
          return;
        }
      } catch (e) {
        console.error("Session check failed:", e);
      }
      setChecking(false);
    }
    checkSession();
  }, [router, redirect]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!hasSupabase || !supabase) {
      push("Authentication is not configured", "error");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        push(error.message, "error");
        setLoading(false);
        return;
      }

      push("Login successful!", "success");
      window.location.href = redirect;
    } catch (err) {
      push("Login failed. Please try again.", "error");
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
        {/* Left side - Form */}
        <div className="flex items-center justify-center bg-white p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-md">
            <Link href="/" className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 bg-gradient-to-br from-forge-500 to-flow-500 rounded-xl flex items-center justify-center shadow-lg shadow-forge-500/30">
                <Printer className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Print-4-Me</span>
            </Link>

            <div className="mb-8">
              <p className="inline-flex items-center rounded-full bg-forge-100 text-forge-700 px-3 py-1 text-xs font-semibold tracking-wide uppercase mb-4">
                Secure Login
              </p>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">
                Welcome back
              </h1>
              <p className="text-slate-600 text-base">
                Sign in to manage uploads, orders, and project status.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
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
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-forge-600 focus:ring-forge-300"
                  />
                  Remember me
                </label>
                <Link
                  href="/reset-password"
                  className="text-sm text-forge-700 hover:text-forge-800 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-forge-500 to-forge-600 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-forge-500/30 disabled:opacity-60 transition-all"
              >
                {loading ? (
                  <div className="spinner" />
                ) : (
                  <>
                    Sign In <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-forge-700 hover:text-forge-800 font-semibold"
              >
                Sign up
              </Link>
            </p>

            {/* Mobile review block */}
            <div className="mt-8 lg:hidden rounded-2xl bg-slate-900 text-white p-5">
              <FiveStars />
              <p className="mt-3 text-sm text-slate-200">
                &quot;Excellent quality, fast turnaround, and super clear order
                tracking from upload to delivery.&quot;
              </p>
              <div className="mt-4 flex -space-x-2">
                {COMMUNITY_FACES.map((person) => (
                  <div
                    key={person.name}
                    className="w-10 h-10 rounded-full border-2 border-slate-900 overflow-hidden"
                    title={person.name}
                  >
                    <Image
                      src={person.src}
                      alt={person.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Marketing/Testimonial */}
        <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-flow-900 p-12 text-white">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -left-10 h-52 w-52 rounded-full bg-forge-500/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-flow-500/20 blur-3xl" />
          </div>

          <div className="relative max-w-lg">
            <h2 className="text-4xl font-black leading-tight mb-5 text-white">
              Turn your ideas into reality
            </h2>
            <p className="text-lg text-slate-200 leading-relaxed mb-8">
              Upload your 3D models, choose materials and colors, then track
              your print from payment to production.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {COMMUNITY_FACES.map((person) => (
                  <div
                    key={person.name}
                    className="w-12 h-12 rounded-full border-2 border-slate-900 overflow-hidden shadow-md"
                    title={person.name}
                  >
                    <Image
                      src={person.src}
                      alt={person.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <span className="text-sm font-medium text-slate-200">
                Trusted by 2,000+ makers already printing
              </span>
            </div>
          </div>

          <div className="relative space-y-4">
            {REVIEWS.map((review) => (
              <div
                key={review.name}
                className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={review.avatar}
                        alt={review.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {review.name}
                      </p>
                      <p className="text-xs text-slate-300">{review.role}</p>
                    </div>
                  </div>
                  <FiveStars />
                </div>
                <p className="mt-3 text-sm text-slate-100 leading-relaxed">
                  &quot;{review.quote}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
          <div className="spinner" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
