"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Video,
  Store,
  Users,
  Clock,
  Star,
  ArrowRight,
  CheckCircle,
  Play,
  ChevronDown,
  Zap,
  Globe,
  Shield,
  TrendingUp,
  Heart,
  Award,
} from "lucide-react";

// ========================================
// NAVIGATION
// ========================================
function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-glam-gradient flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">GlamCall</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a
            href="#how-it-works"
            className="text-gray-700 hover:text-glam-600 font-medium transition-colors"
          >
            How It Works
          </a>
          <a
            href="#benefits"
            className="text-gray-700 hover:text-glam-600 font-medium transition-colors"
          >
            Benefits
          </a>
          <a
            href="#testimonials"
            className="text-gray-700 hover:text-glam-600 font-medium transition-colors"
          >
            Testimonials
          </a>
          <a
            href="#faq"
            className="text-gray-700 hover:text-glam-600 font-medium transition-colors"
          >
            FAQ
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-gray-700 hover:text-glam-600 font-medium transition-colors hidden sm:block"
          >
            Log In
          </Link>
          <Link
            href="/apply"
            className="btn-primary flex items-center gap-2 text-sm"
          >
            Become a Consultant
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ========================================
// HERO SECTION
// ========================================
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-glam-50 via-rose-50 to-gold-50" />

      {/* Floating shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-glam-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float animation-delay-2000" />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-gold-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float animation-delay-4000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-glam-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-glam-500" />
              <span className="text-sm font-medium text-glam-700">
                The Future of Retail Beauty
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
              <span className="gradient-text">Remote Beauty</span>
              <br />
              <span className="text-gray-900">Consultants for</span>
              <br />
              <span className="text-gray-900">Your Store</span>
            </h1>

            <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
              Connect your customers with expert beauty consultants via instant
              video calls. Elevate the shopping experience with personalized
              advice, anytime.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/partner"
                className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2"
              >
                Partner With Us
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/apply"
                className="btn-secondary text-lg px-8 py-4 flex items-center justify-center gap-2"
              >
                Become a Consultant
                <Sparkles className="w-5 h-5" />
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-glam-400 to-rose-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-gold-400 text-gold-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Trusted by 500+ stores worldwide
                </p>
              </div>
            </div>
          </div>

          {/* Right: Video call mockup */}
          <div className="relative">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-glam-lg">
              {/* Gradient border */}
              <div className="absolute inset-0 bg-glam-gradient p-1 rounded-3xl">
                <div className="w-full h-full bg-white rounded-[22px] overflow-hidden">
                  {/* Video call UI mockup */}
                  <div className="relative h-full bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col">
                    {/* Main video area */}
                    <div className="flex-1 relative">
                      <Image
                        src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800"
                        alt="Beauty consultant"
                        fill
                        className="object-cover"
                      />
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                      {/* Consultant info */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl glass-dark">
                          <div className="w-12 h-12 rounded-full bg-glam-gradient flex items-center justify-center">
                            <span className="text-white font-bold">ER</span>
                          </div>
                          <div>
                            <p className="text-white font-semibold">
                              Elena Rodriguez
                            </p>
                            <p className="text-gray-300 text-sm">
                              Beauty Expert • 8 years
                            </p>
                          </div>
                          <div className="ml-auto badge-available">Live</div>
                        </div>
                      </div>

                      {/* Self video */}
                      <div className="absolute top-4 right-4 w-24 h-32 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg">
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <Users className="w-8 h-8 text-gray-500" />
                        </div>
                      </div>
                    </div>

                    {/* Call controls */}
                    <div className="p-4 flex items-center justify-center gap-4">
                      <button className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors">
                        <Video className="w-6 h-6 text-white" />
                      </button>
                      <button className="w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center hover:bg-rose-600 transition-colors">
                        <Play className="w-7 h-7 text-white fill-white" />
                      </button>
                      <button className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors">
                        <Sparkles className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -left-4 px-4 py-2 rounded-full bg-white shadow-lg flex items-center gap-2 animate-bounce-gentle">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium">12 Consultants Online</span>
            </div>

            <div className="absolute -bottom-4 -right-4 px-4 py-2 rounded-full bg-white shadow-lg flex items-center gap-2 animate-bounce-gentle animation-delay-1000">
              <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
              <span className="text-sm font-medium">4.9 Average Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-sm text-gray-500">Scroll to explore</span>
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </div>
    </section>
  );
}

// ========================================
// HOW IT WORKS SECTION
// ========================================
function HowItWorksSection() {
  const steps = [
    {
      icon: Store,
      title: "Customer Scans QR",
      description:
        "Place QR codes at your beauty counters. Customers scan to instantly connect with an expert consultant.",
      color: "glam",
    },
    {
      icon: Video,
      title: "Video Call Starts",
      description:
        "One tap connects customers to available beauty consultants for personalized advice via HD video.",
      color: "rose",
    },
    {
      icon: Sparkles,
      title: "Get Recommendations",
      description:
        "Consultants recommend perfect products. Orders are sent to store staff for easy pickup.",
      color: "gold",
    },
  ];

  return (
    <section id="how-it-works" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-glam-50 border border-glam-100 mb-6">
            <Zap className="w-4 h-4 text-glam-500" />
            <span className="text-sm font-medium text-glam-700">
              Simple Process
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            How <span className="gradient-text">GlamCall</span> Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your retail beauty experience in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-glam-200 to-rose-200 -translate-x-1/2 z-0" />
              )}

              <div className="relative z-10 bg-white rounded-3xl p-8 shadow-lg border border-gray-100 card-hover">
                {/* Step number */}
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-glam-gradient flex items-center justify-center text-white font-bold shadow-glam">
                  {index + 1}
                </div>

                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center ${
                    step.color === "glam"
                      ? "bg-glam-100"
                      : step.color === "rose"
                        ? "bg-rose-100"
                        : "bg-gold-100"
                  }`}
                >
                  <step.icon
                    className={`w-8 h-8 ${
                      step.color === "glam"
                        ? "text-glam-600"
                        : step.color === "rose"
                          ? "text-rose-600"
                          : "text-gold-600"
                    }`}
                  />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========================================
// BENEFITS SECTION
// ========================================
function BenefitsSection() {
  const storesBenefits = [
    {
      icon: TrendingUp,
      title: "Increase Sales",
      description: "Expert recommendations drive 40% higher conversion rates",
    },
    {
      icon: Clock,
      title: "24/7 Coverage",
      description: "Never miss a consultation with global consultant network",
    },
    {
      icon: Heart,
      title: "Customer Satisfaction",
      description: "Personalized service leads to loyal customers",
    },
  ];

  const consultantsBenefits = [
    {
      icon: Globe,
      title: "Work From Anywhere",
      description: "Flexible remote work with your own schedule",
    },
    {
      icon: Award,
      title: "Competitive Pay",
      description: "Earn €25-40/hour based on experience",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Reliable payments and professional support",
    },
  ];

  return (
    <section
      id="benefits"
      className="py-32 bg-gradient-to-br from-gray-900 to-glam-950"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
            <Award className="w-4 h-4 text-glam-400" />
            <span className="text-sm font-medium text-glam-300">
              Benefits for Everyone
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Win-Win for <span className="text-glam-400">Stores</span> &{" "}
            <span className="text-rose-400">Consultants</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* For Stores */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-glam-gradient flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">For Stores</h3>
            </div>

            <div className="space-y-6">
              {storesBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-glam-500/20 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-5 h-5 text-glam-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">
                      {benefit.title}
                    </h4>
                    <p className="text-gray-400">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/partner"
              className="mt-8 w-full btn-primary flex items-center justify-center gap-2"
            >
              Partner With Us
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* For Consultants */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">For Consultants</h3>
            </div>

            <div className="space-y-6">
              {consultantsBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">
                      {benefit.title}
                    </h4>
                    <p className="text-gray-400">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/apply"
              className="mt-8 w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:shadow-rose transition-all"
            >
              Apply Now
              <Sparkles className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ========================================
// TESTIMONIALS SECTION
// ========================================
function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "GlamCall transformed our beauty department. Customers love getting expert advice instantly, and our sales have increased by 35%.",
      author: "Sarah M.",
      role: "Store Manager, BeautyMax Berlin",
      avatar: "SM",
    },
    {
      quote:
        "As a consultant, I love the flexibility. I work from home, set my own hours, and help customers find their perfect products.",
      author: "Elena R.",
      role: "Beauty Consultant, 2 years",
      avatar: "ER",
    },
    {
      quote:
        "The video quality is excellent and the platform is so easy to use. My customers always leave with exactly what they need.",
      author: "Sophie C.",
      role: "Skincare Specialist",
      avatar: "SC",
    },
  ];

  return (
    <section id="testimonials" className="py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 mb-6">
            <Heart className="w-4 h-4 text-rose-500" />
            <span className="text-sm font-medium text-gray-700">
              Loved by Many
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            What People <span className="gradient-text">Say</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 card-hover"
            >
              <div className="flex items-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-gold-400 text-gold-400"
                  />
                ))}
              </div>

              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                "{testimonial.quote}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-glam-gradient flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========================================
// FAQ SECTION
// ========================================
function FAQSection() {
  const faqs = [
    {
      question: "How quickly can customers connect with a consultant?",
      answer:
        "Instantly! When a customer scans the QR code, they're immediately shown available consultants and can connect in under 30 seconds.",
    },
    {
      question: "What equipment do consultants need?",
      answer:
        "Just a computer or tablet with a webcam, good lighting, and a stable internet connection. We provide all the software and training.",
    },
    {
      question: "How much do consultants earn?",
      answer:
        "Consultants typically earn between €25-40 per hour depending on experience and specialization. Payment is processed weekly.",
    },
    {
      question: "Is there a setup fee for stores?",
      answer:
        "We offer flexible pricing plans starting with a free trial. No hidden fees - just pay for the consultations you use.",
    },
    {
      question: "What languages are supported?",
      answer:
        "Our consultants speak over 15 languages including English, German, French, Spanish, Mandarin, and more.",
    },
    {
      question: "How do you ensure consultant quality?",
      answer:
        "All consultants go through a rigorous application process, interview, and training. We also monitor ratings and feedback continuously.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-32 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-glam-50 border border-glam-100 mb-6">
            <CheckCircle className="w-4 h-4 text-glam-500" />
            <span className="text-sm font-medium text-glam-700">FAQ</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========================================
// CTA SECTION
// ========================================
function CTASection() {
  return (
    <section className="py-32 bg-glam-gradient">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Transform Your Beauty Experience?
        </h2>
        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          Join hundreds of stores and consultants already using GlamCall to
          deliver exceptional beauty consultations.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/partner"
            className="bg-white text-glam-600 font-bold py-4 px-8 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Store className="w-5 h-5" />
            Partner Your Store
          </Link>
          <Link
            href="/apply"
            className="bg-white/20 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-xl border-2 border-white/30 hover:bg-white/30 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Become a Consultant
          </Link>
        </div>
      </div>
    </section>
  );
}

// ========================================
// FOOTER
// ========================================
function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-glam-gradient flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">GlamCall</span>
            </div>
            <p className="text-gray-500">
              Connecting retail stores with remote beauty experts worldwide.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">For Stores</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/partner" className="hover:text-white transition">
                  Partner Program
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:text-white transition">
                  Request Demo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">For Consultants</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/apply" className="hover:text-white transition">
                  Apply Now
                </Link>
              </li>
              <li>
                <Link
                  href="/consultant"
                  className="hover:text-white transition"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/training" className="hover:text-white transition">
                  Training
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm">
            © {new Date().getFullYear()} GlamCall. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition">
              Twitter
            </a>
            <a href="#" className="hover:text-white transition">
              LinkedIn
            </a>
            <a href="#" className="hover:text-white transition">
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ========================================
// MAIN PAGE
// ========================================
export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <HowItWorksSection />
      <BenefitsSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
