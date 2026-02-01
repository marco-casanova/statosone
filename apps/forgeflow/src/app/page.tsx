"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
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
  Palette,
  Zap,
  Shield,
  Star,
  ArrowRight,
} from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-forge-500 to-flow-500 rounded-xl flex items-center justify-center">
                <Printer className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ForgeFlow</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                How it Works
              </a>
              <a
                href="#pricing"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Pricing
              </a>
              <a
                href="#faq"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                FAQ
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2 bg-gradient-to-r from-forge-500 to-forge-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-forge-500/25 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-gray-50 via-white to-flow-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-forge-100 text-forge-700 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Professional 3D Printing Service
              </div>

              <h1 className="text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
                Turn Your{" "}
                <span className="bg-gradient-to-r from-forge-500 to-flow-500 bg-clip-text text-transparent">
                  3D Models
                </span>{" "}
                Into Reality
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Upload your STL or OBJ files, preview them in 3D, choose your
                materials, and get them professionally printed and delivered to
                your door.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="/signup"
                  className="btn-primary text-center text-lg flex items-center justify-center gap-2"
                >
                  Start Free <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/custom-design"
                  className="btn-secondary text-center text-lg flex items-center justify-center gap-2"
                >
                  <Palette className="w-5 h-5" /> Custom Design
                </Link>
              </div>

              <div className="flex items-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-flow-500" />
                  <span>Free Preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-flow-500" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-flow-500" />
                  <span>Quality Guarantee</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl">
                {/* 3D Preview Mockup */}
                <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(237,116,32,0.1),transparent_70%)]" />
                  <Box className="w-32 h-32 text-forge-400 animate-pulse" />
                  {/* Grid lines */}
                  <div className="absolute inset-0 opacity-10">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                      `,
                        backgroundSize: "40px 40px",
                      }}
                    />
                  </div>
                </div>

                {/* Stats overlay */}
                <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-4">
                  <div className="text-sm text-gray-500 mb-1">Quote Ready</div>
                  <div className="text-2xl font-bold text-gray-900">€24.99</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
                color: "from-forge-500 to-forge-600",
              },
              {
                icon: Box,
                title: "Preview",
                description:
                  "View your model in 3D and ensure it's ready for printing",
                color: "from-flow-500 to-flow-600",
              },
              {
                icon: CreditCard,
                title: "Order",
                description:
                  "Choose materials, quality, and pay securely via Stripe",
                color: "from-purple-500 to-purple-600",
              },
              {
                icon: Truck,
                title: "Receive",
                description: "Track your order and get it delivered via DHL",
                color: "from-green-500 to-green-600",
              },
            ].map((step, idx) => (
              <div key={idx} className="relative">
                {idx < 3 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] border-t-2 border-dashed border-gray-200" />
                )}
                <div className="text-center">
                  <div
                    className={`w-24 h-24 mx-auto mb-6 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-lg`}
                  >
                    <step.icon className="w-12 h-12 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-gray-400 mb-2">
                    Step {idx + 1}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Materials Section */}
      <section id="pricing" className="py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Material
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We offer premium materials for every need
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
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
                color: "border-green-500",
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
                color: "border-forge-500",
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
                color: "border-purple-500",
                popular: false,
              },
            ].map((material) => (
              <div
                key={material.name}
                className={`relative bg-white rounded-2xl p-8 shadow-sm border-2 ${material.color} ${
                  material.popular ? "scale-105 shadow-xl" : ""
                }`}
              >
                {material.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-forge-500 text-white text-sm font-semibold rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {material.name}
                </h3>
                <div className="text-3xl font-black text-gray-900 mb-4">
                  {material.price}
                </div>
                <p className="text-gray-600 mb-6">{material.description}</p>
                <ul className="space-y-3">
                  {material.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-gray-600"
                    >
                      <Check className="w-5 h-5 text-flow-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose ForgeFlow?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
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
              <div key={feature.title} className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-forge-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
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
                className="bg-white rounded-xl p-6 shadow-sm group"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-4 text-gray-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Printing?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of makers who trust ForgeFlow for their 3D printing
            needs
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-forge-500 to-forge-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-forge-500/30 transition-all"
          >
            Create Your Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-forge-500 to-flow-500 rounded-lg flex items-center justify-center">
                <Printer className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-white">ForgeFlow</span>
            </div>
            <div className="flex gap-8 text-sm">
              <a href="#" className="hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white">
                Contact
              </a>
            </div>
            <div className="text-sm">
              © 2026 ForgeFlow. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
