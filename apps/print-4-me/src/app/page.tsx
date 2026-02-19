"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase, hasSupabase } from "@/lib/supabase/client";
import {
  Printer,
  Upload,
  CreditCard,
  Truck,
  Sparkles,
  ChevronRight,
  Check,
  Box,
  Zap,
  Shield,
  Star,
  ArrowRight,
  ExternalLink,
  Download,
} from "lucide-react";

const PRINTER_VIDEOS = [
  "/multiple-3dprinters.mp4",
  "/multiple-3dprinters1.mp4",
];

function PrinterVideoShowcase() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const videoRefs = [
    useRef<HTMLVideoElement>(null),
    useRef<HTMLVideoElement>(null),
  ];

  const handleEnded = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setActiveIdx((prev) => (prev + 1) % PRINTER_VIDEOS.length);
      setFading(false);
    }, 600);
  }, []);

  useEffect(() => {
    const vid = videoRefs[activeIdx].current;
    if (vid) {
      vid.currentTime = 0;
      vid.play().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx]);

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/30 ring-1 ring-white/10 aspect-video bg-slate-900">
      {PRINTER_VIDEOS.map((src, idx) => (
        <video
          key={src}
          ref={videoRefs[idx]}
          src={src}
          autoPlay={idx === 0}
          muted
          playsInline
          onEnded={idx === activeIdx ? handleEnded : undefined}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-600 ${
            idx === activeIdx
              ? fading
                ? "opacity-0"
                : "opacity-100"
              : "opacity-0"
          }`}
        />
      ))}
      {/* Play indicator dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {PRINTER_VIDEOS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setFading(true);
              setTimeout(() => {
                setActiveIdx(idx);
                setFading(false);
              }, 600);
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === activeIdx ? "w-6 bg-white" : "w-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
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

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-forge-50">
        <div className="spinner" />
      </div>
    );
  }

  return (
    /* Single full-page gradient canvas — sections use opacity layers on top */
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(160deg, #f8fafc 0%, #ffffff 35%, #fff7f0 65%, #f0fdfb 100%)",
      }}
    >
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-br from-forge-500 to-flow-500 rounded-xl flex items-center justify-center shadow-md shadow-forge-500/20">
                <Printer className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Print-4-Me</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#how-it-works"
                className="text-slate-300 hover:text-white font-medium transition-colors text-sm"
              >
                How it Works
              </a>
              <a
                href="#pricing"
                className="text-slate-300 hover:text-white font-medium transition-colors text-sm"
              >
                Pricing
              </a>
              <a
                href="#faq"
                className="text-slate-300 hover:text-white font-medium transition-colors text-sm"
              >
                FAQ
              </a>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/try-it"
                className="px-4 py-2 text-forge-400 font-semibold hover:text-forge-300 transition-colors text-sm"
              >
                Try It Now
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 text-slate-300 font-medium hover:text-white transition-colors text-sm"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 bg-gradient-to-r from-forge-500 to-forge-600 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow-md hover:shadow-forge-500/25 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── §1 Hero — ODD (darker) ── */}
      <section className="pt-32 pb-24 px-4 relative overflow-hidden bg-slate-900/[0.04] border-b border-slate-200/50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-forge-400/12 blur-3xl" />
          <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-flow-400/12 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-forge-50 text-forge-700 rounded-full text-xs font-semibold tracking-wide uppercase mb-8 border border-forge-100">
                <Sparkles className="w-3.5 h-3.5" />
                Professional 3D Printing Service
              </div>

              <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-6">
                Turn Your{" "}
                <span className="bg-gradient-to-r from-forge-500 to-flow-500 bg-clip-text text-transparent">
                  3D Models
                </span>{" "}
                Into Reality
              </h1>

              <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-lg">
                Upload your STL or OBJ files, preview them in 3D, choose your
                materials, and get them professionally printed and delivered to
                your door.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-12">
                <Link
                  href="/try-it"
                  className="px-8 py-3.5 bg-gradient-to-r from-forge-500 to-forge-600 text-white font-semibold text-base rounded-xl shadow-md shadow-forge-500/20 hover:shadow-lg hover:shadow-forge-500/30 transition-all text-center flex items-center justify-center gap-2"
                >
                  Try It Now <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/signup"
                  className="px-8 py-3.5 bg-white text-slate-700 font-semibold text-base rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all text-center flex items-center justify-center gap-2"
                >
                  Create Account
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-flow-500" />
                  <span>Free Preview</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-flow-500" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-flow-500" />
                  <span>Quality Guarantee</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-5 shadow-2xl shadow-slate-900/20 ring-1 ring-slate-900/5">
                <div className="aspect-square rounded-2xl relative overflow-hidden bg-slate-900">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                  >
                    <source src="/3dp.mp4" type="video/mp4" />
                  </video>
                </div>
                {/* Stats chip */}
                <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl shadow-xl shadow-slate-200/80 p-4 ring-1 ring-slate-100">
                  <div className="text-xs text-slate-400 mb-0.5 font-medium">
                    Quote Ready
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    €24.99
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── §2 How It Works — EVEN (lighter) ── */}
      <section
        id="how-it-works"
        className="py-24 px-4 bg-white/75 backdrop-blur-sm border-y border-slate-100"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="inline-flex items-center rounded-full bg-forge-50 text-forge-600 px-3 py-1 text-xs font-semibold tracking-widest uppercase mb-4 border border-forge-100">
              Simple Process
            </p>
            <h2 className="text-4xl font-bold text-slate-900 mb-3">
              How It Works
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              From upload to delivery in 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: Upload,
                title: "Upload",
                description:
                  "Upload your STL or OBJ file directly to our platform",
                gradient: "from-forge-500 to-orange-400",
              },
              {
                icon: Box,
                title: "Preview",
                description:
                  "View your model in 3D and ensure it's ready for printing",
                gradient: "from-blue-500 to-cyan-400",
              },
              {
                icon: CreditCard,
                title: "Order",
                description:
                  "Choose materials, quality, and pay securely via Stripe",
                gradient: "from-purple-500 to-violet-400",
              },
              {
                icon: Truck,
                title: "Receive",
                description: "Track your order and get it delivered via DHL",
                gradient: "from-flow-500 to-emerald-400",
              },
            ].map((step, idx) => {
              const IconComponent = step.icon;
              return (
                <div key={idx} className="relative">
                  {idx < 3 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] border-t-2 border-dashed border-slate-200" />
                  )}
                  <div className="text-center">
                    <div
                      className={`w-20 h-20 mx-auto mb-5 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center shadow-lg`}
                    >
                      <IconComponent className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-xs font-semibold text-slate-400 tracking-widest uppercase mb-2">
                      Step {idx + 1}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── §3 Try-It CTA — ODD (darker) ── */}
      <section className="py-24 px-4 relative overflow-hidden bg-slate-900/[0.04] border-y border-slate-200/50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-64 w-[40rem] rounded-full bg-forge-400/15 blur-3xl" />
          </div>
        </div>
        <div className="max-w-5xl mx-auto text-center relative">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Try The Full Flow Before You Order
          </h2>
          <p className="text-lg text-slate-500 mb-8 max-w-2xl mx-auto">
            Upload a model, configure material and color, pay with Stripe, and
            track your order status.
          </p>
          <Link
            href="/try-it"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-forge-500 to-forge-600 text-white font-semibold text-base shadow-lg shadow-forge-500/25 hover:shadow-xl hover:shadow-forge-500/30 transition-all"
          >
            Try It Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── §4 Printers in Action — ODD (darker) ── */}
      <section className="py-20 px-4 relative overflow-hidden bg-slate-900/[0.04] border-y border-slate-200/50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 h-80 w-80 rounded-full bg-forge-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-flow-400/10 blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-10">
            <p className="inline-flex items-center rounded-full bg-forge-50 text-forge-600 px-3 py-1 text-xs font-semibold tracking-widest uppercase mb-4 border border-forge-100">
              Our Printers
            </p>
            <h2 className="text-4xl font-bold text-slate-900 mb-3">
              See Them in Action
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Watch our fleet of professional 3D printers at work — producing
              your parts with precision and care.
            </p>
          </div>
          <PrinterVideoShowcase />
        </div>
      </section>

      {/* ── §5 Repositories — EVEN (lighter) ── */}
      <section className="py-24 px-4 bg-white/75 backdrop-blur-sm border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-flow-50 text-flow-700 rounded-full text-xs font-semibold tracking-widest uppercase mb-4 border border-flow-100">
              <Download className="w-3.5 h-3.5" />
              Free Resources
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-3">
              Find Your Perfect Model
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Download free 3D printable models from these popular repositories
              and upload them to our visualizer
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                name: "Printables",
                url: "https://www.printables.com/",
                description:
                  "One of the largest free STL repositories for 3D printing",
                color: "from-orange-500 to-red-500",
                featured: true,
              },
              {
                name: "Thingiverse",
                url: "https://www.thingiverse.com/",
                description:
                  "Huge database of free 3D-printable designs and community files",
                color: "from-blue-500 to-cyan-500",
                featured: true,
              },
              {
                name: "Cults3D",
                url: "https://cults3d.com/",
                description:
                  "Marketplace with many free 3D printing models and premium designs",
                color: "from-purple-500 to-pink-500",
                featured: false,
              },
              {
                name: "Thangs",
                url: "https://thangs.com/",
                description: "Free & paid 3D model community and search engine",
                color: "from-green-500 to-emerald-500",
                featured: false,
              },
              {
                name: "MakerWorld",
                url: "https://makerworld.com/",
                description:
                  "Thousands of free printable models: toys, tools, decor & more",
                color: "from-indigo-500 to-blue-500",
                featured: false,
              },
              {
                name: "MyMiniFactory",
                url: "https://www.myminifactory.com/",
                description: "Curated 3D designs tested for printability",
                color: "from-red-500 to-orange-500",
                featured: false,
              },
              {
                name: "Pinshape",
                url: "https://pinshape.com/",
                description:
                  "3D printing marketplace with free and premium files",
                color: "from-teal-500 to-cyan-500",
                featured: false,
              },
              {
                name: "3D For Print",
                url: "https://www.3dforprint.com/",
                description: "Free STL/OBJ models ready to download and print",
                color: "from-violet-500 to-purple-500",
                featured: false,
              },
            ].map((repo) => (
              <a
                key={repo.name}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 flex flex-col ${
                  repo.featured ? "md:col-span-1 lg:col-span-2" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-11 h-11 bg-gradient-to-br ${repo.color} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}
                  >
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-forge-500 transition-colors" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1.5 group-hover:text-forge-600 transition-colors">
                  {repo.name}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed grow">
                  {repo.description}
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-forge-500 group-hover:gap-2.5 transition-all">
                  <span>Visit site</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            ))}
          </div>

          <div className="mt-10 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 text-forge-600 font-semibold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Pro Tip:</span>
              </div>
              <p className="text-slate-600 text-sm">
                Download any model, then upload it to{" "}
                <Link
                  href="/signup"
                  className="text-forge-600 hover:text-forge-700 font-semibold underline underline-offset-2"
                >
                  your dashboard
                </Link>{" "}
                to preview and get instant quotes!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── §6 Materials — ODD (darker) ── */}
      <section
        id="pricing"
        className="py-24 px-4 relative overflow-hidden bg-slate-900/[0.04] border-y border-slate-200/50"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-flow-400/15 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-forge-400/10 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <p className="inline-flex items-center rounded-full bg-flow-50 text-flow-700 px-3 py-1 text-xs font-semibold tracking-widest uppercase mb-4 border border-flow-100">
              Materials
            </p>
            <h2 className="text-4xl font-bold text-slate-900 mb-3">
              Choose Your Material
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              We offer premium materials for every need
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "PLA",
                price: "From €15",
                description: "Perfect for prototypes and decorative items",
                features: [
                  "Biodegradable",
                  "Easy to print",
                  "Wide color range",
                  "Cost effective",
                ],
                gradient: "from-green-500 to-emerald-500",
                popular: false,
              },
              {
                name: "PETG",
                price: "From €20",
                description: "Strong and durable for functional parts",
                features: [
                  "Heat resistant",
                  "Food safe",
                  "UV resistant",
                  "Stronger than PLA",
                ],
                gradient: "from-forge-500 to-orange-400",
                popular: true,
              },
              {
                name: "Resin",
                price: "From €35",
                description: "Maximum detail for precise models",
                features: [
                  "Ultra smooth finish",
                  "High detail",
                  "Perfect for miniatures",
                  "Professional quality",
                ],
                gradient: "from-purple-500 to-violet-500",
                popular: false,
              },
            ].map((material) => (
              <div
                key={material.name}
                className={`relative bg-white rounded-2xl p-8 border shadow-sm transition-all ${
                  material.popular
                    ? "border-forge-200 shadow-forge-100 ring-2 ring-forge-400/20 scale-105"
                    : "border-slate-100 hover:shadow-md"
                }`}
              >
                {material.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-forge-500 to-forge-600 text-white text-xs font-bold rounded-full shadow-md shadow-forge-500/20 tracking-wide uppercase">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-slate-800 mb-1">
                  {material.name}
                </h3>
                <div
                  className={`text-3xl font-black bg-gradient-to-r ${material.gradient} bg-clip-text text-transparent mb-4`}
                >
                  {material.price}
                </div>
                <p className="text-slate-500 text-sm mb-6">
                  {material.description}
                </p>
                <ul className="space-y-2.5">
                  {material.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-slate-600 text-sm"
                    >
                      <Check className="w-4 h-4 text-flow-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── §7 Features — EVEN (lighter) ── */}
      <section className="py-24 px-4 bg-white/75 backdrop-blur-sm border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-3">
              Why Choose Print-4-Me?
            </h2>
            <p className="text-lg text-slate-500">
              Everything you need in one place
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Fast Turnaround",
                description:
                  "Most orders printed and shipped within 3-5 business days",
              },
              {
                icon: Shield,
                title: "Quality Guarantee",
                description: "100% satisfaction guarantee or your money back",
              },
              {
                icon: Star,
                title: "Expert Support",
                description:
                  "Our team helps optimize your designs for best results",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="text-center p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 mx-auto mb-5 bg-forge-50 rounded-2xl flex items-center justify-center border border-forge-100">
                  <feature.icon className="w-7 h-7 text-forge-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── §8 FAQ — ODD (darker) ── */}
      <section
        id="faq"
        className="py-24 px-4 relative bg-slate-900/[0.04] border-y border-slate-200/50"
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-slate-500">
              Quick answers to common questions
            </p>
          </div>

          <div className="space-y-2">
            {[
              {
                q: "What file formats do you accept?",
                a: "We accept STL and OBJ files. Make sure your model is watertight and manifold for best results.",
              },
              {
                q: "How long does printing take?",
                a: "Most orders are printed within 2-3 business days. Shipping typically takes an additional 2-3 days within Europe.",
              },
              {
                q: "What's the maximum print size?",
                a: "Our printers can handle models up to 250x210x210mm for FDM and 192x120x245mm for resin.",
              },
              {
                q: "Do you offer custom design services?",
                a: "Yes! Use our Custom Design Request form and our team will work with you to create the perfect model.",
              },
              {
                q: "What's your return policy?",
                a: "We offer a 100% satisfaction guarantee. If there's an issue with print quality, we'll reprint or refund.",
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="bg-white rounded-xl border border-slate-100 shadow-sm group overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none px-6 py-5">
                  <span className="font-semibold text-slate-800 text-sm">
                    {faq.q}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform shrink-0 ml-4" />
                </summary>
                <p className="px-6 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-50 pt-3">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA — dark accent block ── */}
      <section className="py-24 px-4 mx-4 mb-16 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -left-8 h-52 w-52 rounded-full bg-forge-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-flow-500/15 blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Printing?
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Join thousands of makers who trust Print-4-Me for their 3D printing
            needs
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-forge-500 to-forge-600 text-white font-bold text-base rounded-xl shadow-xl shadow-forge-500/30 hover:shadow-forge-500/40 transition-all"
          >
            Create Your Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-forge-500 to-flow-500 rounded-lg flex items-center justify-center">
                <Printer className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-slate-700 text-sm">
                Print-4-Me
              </span>
            </div>
            <div className="flex gap-6 text-xs text-slate-400">
              <a href="#" className="hover:text-slate-600 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-slate-600 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-slate-600 transition-colors">
                Contact
              </a>
            </div>
            <div className="text-xs text-slate-400">
              © 2026 Print-4-Me. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
