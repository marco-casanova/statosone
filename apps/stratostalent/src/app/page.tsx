"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  GlassCard,
  GradientButton,
  Badge,
  Avatar,
  Rating,
  SkillTag,
} from "@/components/ui";
import {
  ArrowRight,
  Check,
  Star,
  Users,
  Zap,
  Shield,
  Globe,
  Clock,
  Code2,
  Sparkles,
  ChevronRight,
  Play,
  Award,
  TrendingUp,
  MessageSquare,
} from "lucide-react";

// Featured developers for the hero section
const featuredDevelopers = [
  {
    name: "Alex T.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    role: "Full-Stack",
    rating: 4.9,
    skills: ["React", "Node.js"],
  },
  {
    name: "Sarah C.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    role: "Mobile Dev",
    rating: 4.8,
    skills: ["React Native", "iOS"],
  },
  {
    name: "Marcus W.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    role: "DevOps",
    rating: 5.0,
    skills: ["AWS", "Kubernetes"],
  },
];

const stats = [
  { value: "500+", label: "Expert Developers", icon: <Users size={24} /> },
  { value: "98%", label: "Satisfaction Rate", icon: <Star size={24} /> },
  { value: "48h", label: "Avg. Match Time", icon: <Clock size={24} /> },
  { value: "40+", label: "Countries", icon: <Globe size={24} /> },
];

const features = [
  {
    icon: <Shield size={28} />,
    title: "Pre-Vetted Talent",
    description:
      "Every developer passes our rigorous 5-step screening. Only the top 5% make it to our platform.",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
  },
  {
    icon: <Zap size={28} />,
    title: "Start in 48 Hours",
    description:
      "Skip months of recruiting. Get matched with the perfect developer and start working within days.",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
  },
  {
    icon: <Shield size={28} />,
    title: "Risk-Free Trial",
    description:
      "Not satisfied? Get a full replacement within 2 weeks, no questions asked. Your success is guaranteed.",
    gradient: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
  },
  {
    icon: <MessageSquare size={28} />,
    title: "Direct Communication",
    description:
      "Work directly with your developer. No middlemen, no delays. Seamless collaboration from day one.",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
  },
];

const pricingPlans = [
  {
    name: "Part-Time",
    price: "€3,500",
    period: "/month",
    description: "20 hours per week",
    features: [
      "Senior developer",
      "Direct communication",
      "Weekly reports",
      "Slack integration",
      "Flexible schedule",
    ],
    highlighted: false,
  },
  {
    name: "Full-Time",
    price: "€6,500",
    period: "/month",
    description: "40 hours per week",
    features: [
      "Senior developer",
      "Direct communication",
      "Daily standups",
      "Priority support",
      "Dedicated PM",
      "24/7 Slack access",
    ],
    highlighted: true,
  },
  {
    name: "Team",
    price: "Custom",
    period: "",
    description: "Multiple developers",
    features: [
      "Multiple developers",
      "Dedicated team lead",
      "Custom workflow",
      "On-site visits",
      "Enterprise SLA",
      "Volume discounts",
    ],
    highlighted: false,
  },
];

const testimonials = [
  {
    quote:
      "StratosTalent helped us scale our engineering team in weeks, not months. The quality of developers is exceptional.",
    author: "Jennifer Martinez",
    role: "CTO",
    company: "TechStart",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  },
  {
    quote:
      "We've tried other platforms, but StratosTalent's vetting process is on another level. Every developer has been outstanding.",
    author: "Michael Chen",
    role: "VP Engineering",
    company: "FinanceFlow",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    quote:
      "The flexibility to scale up or down based on our needs has been game-changing for our startup. Highly recommended.",
    author: "Sarah Williams",
    role: "Founder",
    company: "InnovateLab",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  },
];

const trustedCompanies = [
  "Stripe",
  "Vercel",
  "Linear",
  "Notion",
  "Figma",
  "Shopify",
];

export default function HomePage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      {/* Navigation */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "1rem 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: "2.25rem",
                height: "2.25rem",
                borderRadius: "var(--radius-lg)",
                background: "var(--gradient-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
              }}
            >
              <Code2 size={20} />
            </div>
            <span
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--gray-900)",
              }}
            >
              StratosTalent
            </span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              {["How it Works", "Developers", "Pricing"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 500,
                    color: "var(--gray-600)",
                    textDecoration: "none",
                    transition: "color var(--transition-fast)",
                  }}
                >
                  {item}
                </a>
              ))}
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <Link href="/login">
                <GradientButton variant="ghost" size="sm">
                  Log In
                </GradientButton>
              </Link>
              <Link href="/signup">
                <GradientButton size="sm">Get Started</GradientButton>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          paddingTop: "5rem",
        }}
      >
        {/* Background decorations */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "5%",
            width: "600px",
            height: "600px",
            borderRadius: "var(--radius-full)",
            background: "var(--gradient-primary)",
            opacity: 0.05,
            filter: "blur(100px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "10%",
            width: "500px",
            height: "500px",
            borderRadius: "var(--radius-full)",
            background: "var(--gradient-secondary)",
            opacity: 0.05,
            filter: "blur(80px)",
          }}
        />

        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "4rem 2rem",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Left Content */}
          <div>
            <Badge
              variant="secondary"
              size="md"
              style={{ marginBottom: "1.5rem" }}
            >
              <Sparkles size={14} />
              Now with AI-Powered Matching
            </Badge>

            <h1
              style={{
                fontSize: "4rem",
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: "1.5rem",
                color: "var(--gray-900)",
              }}
            >
              Rent{" "}
              <span
                style={{
                  background: "var(--gradient-primary)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Top Developers
              </span>
              ,<br />
              Not Hire Them
            </h1>

            <p
              style={{
                fontSize: "1.25rem",
                lineHeight: 1.7,
                color: "var(--gray-600)",
                marginBottom: "2rem",
                maxWidth: "540px",
              }}
            >
              Access a curated network of pre-vetted senior developers. No
              lengthy hiring, no long-term commitments. Just exceptional talent
              when you need it.
            </p>

            <div style={{ display: "flex", gap: "1rem", marginBottom: "3rem" }}>
              <Link href="/talent">
                <GradientButton size="xl">
                  Browse Developers
                  <ArrowRight size={20} />
                </GradientButton>
              </Link>
              <Link href="/signup?role=developer">
                <GradientButton variant="outline" size="xl">
                  Join as Developer
                </GradientButton>
              </Link>
            </div>

            {/* Trust indicators */}
            <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                {[...Array(3)].map((_, i) => (
                  <Avatar
                    key={i}
                    src={featuredDevelopers[i].avatar}
                    name={featuredDevelopers[i].name}
                    size="sm"
                    style={{
                      marginLeft: i > 0 ? "-0.5rem" : 0,
                      border: "2px solid white",
                    }}
                  />
                ))}
                <span
                  style={{
                    marginLeft: "0.75rem",
                    fontSize: "0.875rem",
                    color: "var(--gray-600)",
                  }}
                >
                  <strong style={{ color: "var(--gray-900)" }}>500+</strong>{" "}
                  developers
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  background: "var(--gray-50)",
                  borderRadius: "var(--radius-full)",
                }}
              >
                <Rating value={4.9} size="sm" showValue={false} />
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--gray-900)",
                  }}
                >
                  4.9
                </span>
                <span
                  style={{ fontSize: "0.8125rem", color: "var(--gray-500)" }}
                >
                  average rating
                </span>
              </div>
            </div>
          </div>

          {/* Right Content - Developer Cards */}
          <div style={{ position: "relative" }}>
            {/* Main card */}
            <GlassCard
              variant="light"
              padding="xl"
              glow
              style={{
                position: "relative",
                zIndex: 2,
                animation: "float 6s ease-in-out infinite",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <Avatar
                  src={featuredDevelopers[0].avatar}
                  name={featuredDevelopers[0].name}
                  size="xl"
                  status="online"
                  verified
                />
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        color: "var(--gray-900)",
                      }}
                    >
                      {featuredDevelopers[0].name}
                    </span>
                    <Badge variant="secondary" size="xs">
                      Top Rated
                    </Badge>
                  </div>
                  <div
                    style={{
                      fontSize: "0.9375rem",
                      color: "var(--gray-600)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Senior Full-Stack Developer
                  </div>
                  <Rating
                    value={featuredDevelopers[0].rating}
                    reviewCount={47}
                    size="sm"
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.375rem",
                  marginBottom: "1.5rem",
                }}
              >
                {["React", "Node.js", "TypeScript", "AWS"].map((skill) => (
                  <SkillTag key={skill} skill={skill} level="expert" />
                ))}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "1rem",
                  padding: "1rem",
                  background: "var(--gray-50)",
                  borderRadius: "var(--radius-lg)",
                  marginBottom: "1.5rem",
                  textAlign: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "var(--primary-600)",
                    }}
                  >
                    8+
                  </div>
                  <div
                    style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}
                  >
                    Years Exp
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "var(--accent-600)",
                    }}
                  >
                    32
                  </div>
                  <div
                    style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}
                  >
                    Projects
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "var(--secondary-600)",
                    }}
                  >
                    4.9
                  </div>
                  <div
                    style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}
                  >
                    Rating
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "1.75rem",
                      fontWeight: 800,
                      color: "var(--gray-900)",
                    }}
                  >
                    €95
                  </span>
                  <span
                    style={{ fontSize: "0.9375rem", color: "var(--gray-500)" }}
                  >
                    /hour
                  </span>
                </div>
                <Badge variant="success" size="sm" dot pulse>
                  Available Now
                </Badge>
              </div>
            </GlassCard>

            {/* Floating mini cards */}
            <GlassCard
              variant="light"
              padding="md"
              style={{
                position: "absolute",
                top: "-20px",
                right: "-40px",
                zIndex: 1,
                animation: "float 6s ease-in-out infinite",
                animationDelay: "-2s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <Avatar
                  src={featuredDevelopers[1].avatar}
                  name={featuredDevelopers[1].name}
                  size="md"
                  status="online"
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
                    {featuredDevelopers[1].name}
                  </div>
                  <div
                    style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}
                  >
                    {featuredDevelopers[1].role}
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard
              variant="light"
              padding="md"
              style={{
                position: "absolute",
                bottom: "40px",
                left: "-60px",
                zIndex: 1,
                animation: "float 6s ease-in-out infinite",
                animationDelay: "-4s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <Avatar
                  src={featuredDevelopers[2].avatar}
                  name={featuredDevelopers[2].name}
                  size="md"
                  status="busy"
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
                    {featuredDevelopers[2].name}
                  </div>
                  <div
                    style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}
                  >
                    {featuredDevelopers[2].role}
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        style={{
          padding: "4rem 2rem",
          background: "var(--gradient-dark)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "2rem",
          }}
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              style={{
                textAlign: "center",
                color: "#ffffff",
              }}
            >
              <div
                style={{
                  width: "3.5rem",
                  height: "3.5rem",
                  margin: "0 auto 1rem",
                  borderRadius: "var(--radius-xl)",
                  background: "rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {stat.icon}
              </div>
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 800,
                  marginBottom: "0.25rem",
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "0.9375rem", opacity: 0.7 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" style={{ padding: "6rem 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <Badge variant="primary" size="md" style={{ marginBottom: "1rem" }}>
              Why Choose Us
            </Badge>
            <h2
              style={{
                fontSize: "2.75rem",
                fontWeight: 800,
                color: "var(--gray-900)",
                marginBottom: "1rem",
              }}
            >
              The Smarter Way to Hire
            </h2>
            <p
              style={{
                fontSize: "1.125rem",
                color: "var(--gray-600)",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              We've reimagined the hiring process to be faster, safer, and more
              flexible for modern teams.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1.5rem",
            }}
          >
            {features.map((feature, index) => (
              <GlassCard
                key={index}
                variant="light"
                padding="xl"
                hover
                style={{ display: "flex", gap: "1.5rem" }}
              >
                <div
                  style={{
                    width: "3.5rem",
                    height: "3.5rem",
                    borderRadius: "var(--radius-xl)",
                    background: feature.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    flexShrink: 0,
                  }}
                >
                  {feature.icon}
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "var(--gray-900)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.9375rem",
                      color: "var(--gray-600)",
                      lineHeight: 1.7,
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        style={{
          padding: "6rem 2rem",
          background: "var(--gray-50)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <Badge variant="accent" size="md" style={{ marginBottom: "1rem" }}>
              Transparent Pricing
            </Badge>
            <h2
              style={{
                fontSize: "2.75rem",
                fontWeight: 800,
                color: "var(--gray-900)",
                marginBottom: "1rem",
              }}
            >
              Simple, Predictable Pricing
            </h2>
            <p
              style={{
                fontSize: "1.125rem",
                color: "var(--gray-600)",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              No hidden fees, no surprises. Pay only for the talent you need,
              when you need it.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1.5rem",
              alignItems: "stretch",
            }}
          >
            {pricingPlans.map((plan, index) => (
              <GlassCard
                key={index}
                variant={plan.highlighted ? "gradient" : "light"}
                padding="xl"
                borderGradient={plan.highlighted}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                }}
              >
                {plan.highlighted && (
                  <Badge
                    variant="secondary"
                    size="sm"
                    style={{
                      position: "absolute",
                      top: "-12px",
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  >
                    Most Popular
                  </Badge>
                )}
                <div style={{ marginBottom: "1.5rem" }}>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "var(--gray-900)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {plan.name}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>
                    {plan.description}
                  </p>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <span
                    style={{
                      fontSize: "3rem",
                      fontWeight: 800,
                      color: "var(--gray-900)",
                    }}
                  >
                    {plan.price}
                  </span>
                  <span style={{ fontSize: "1rem", color: "var(--gray-500)" }}>
                    {plan.period}
                  </span>
                </div>

                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "0 0 1.5rem 0",
                    flex: 1,
                  }}
                >
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.5rem 0",
                        fontSize: "0.9375rem",
                        color: "var(--gray-700)",
                      }}
                    >
                      <Check size={18} color="var(--accent-500)" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <GradientButton
                  variant={plan.highlighted ? "primary" : "outline"}
                  fullWidth
                  size="lg"
                >
                  Get Started
                </GradientButton>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: "6rem 2rem" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <Badge
              variant="secondary"
              size="md"
              style={{ marginBottom: "1rem" }}
            >
              Testimonials
            </Badge>
            <h2
              style={{
                fontSize: "2.75rem",
                fontWeight: 800,
                color: "var(--gray-900)",
                marginBottom: "1rem",
              }}
            >
              Loved by Teams Worldwide
            </h2>
          </div>

          <GlassCard variant="gradient" padding="xl" glow>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontStyle: "italic",
                  color: "var(--gray-700)",
                  lineHeight: 1.8,
                  marginBottom: "2rem",
                  maxWidth: "700px",
                  margin: "0 auto 2rem",
                }}
              >
                "{testimonials[activeTestimonial].quote}"
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1rem",
                }}
              >
                <Avatar
                  src={testimonials[activeTestimonial].avatar}
                  name={testimonials[activeTestimonial].author}
                  size="lg"
                />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 600, color: "var(--gray-900)" }}>
                    {testimonials[activeTestimonial].author}
                  </div>
                  <div
                    style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}
                  >
                    {testimonials[activeTestimonial].role} at{" "}
                    {testimonials[activeTestimonial].company}
                  </div>
                </div>
              </div>

              {/* Dots */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "0.5rem",
                  marginTop: "2rem",
                }}
              >
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    style={{
                      width: i === activeTestimonial ? "2rem" : "0.5rem",
                      height: "0.5rem",
                      borderRadius: "var(--radius-full)",
                      background:
                        i === activeTestimonial
                          ? "var(--primary-500)"
                          : "var(--gray-300)",
                      border: "none",
                      cursor: "pointer",
                      transition: "all var(--transition-base)",
                    }}
                  />
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: "6rem 2rem",
          background: "var(--gradient-dark)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "30%",
            width: "500px",
            height: "500px",
            borderRadius: "var(--radius-full)",
            background: "var(--gradient-primary)",
            opacity: 0.1,
            filter: "blur(100px)",
          }}
        />

        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <h2
            style={{
              fontSize: "3rem",
              fontWeight: 800,
              color: "#ffffff",
              marginBottom: "1.5rem",
            }}
          >
            Ready to Scale Your Team?
          </h2>
          <p
            style={{
              fontSize: "1.25rem",
              color: "rgba(255,255,255,0.7)",
              marginBottom: "2rem",
            }}
          >
            Join hundreds of companies already using StratosTalent to build
            exceptional products.
          </p>
          <div
            style={{ display: "flex", gap: "1rem", justifyContent: "center" }}
          >
            <Link href="/talent">
              <GradientButton size="xl">
                Browse Developers
                <ArrowRight size={20} />
              </GradientButton>
            </Link>
            <Link href="/signup">
              <GradientButton
                variant="outline"
                size="xl"
                style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}
              >
                Create Free Account
              </GradientButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "4rem 2rem 2rem",
          background: "var(--gray-900)",
          color: "rgba(255,255,255,0.7)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: "3rem",
              marginBottom: "3rem",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: "2rem",
                    height: "2rem",
                    borderRadius: "var(--radius-md)",
                    background: "var(--gradient-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                  }}
                >
                  <Code2 size={16} />
                </div>
                <span
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    color: "#ffffff",
                  }}
                >
                  StratosTalent
                </span>
              </div>
              <p style={{ fontSize: "0.9375rem", maxWidth: "280px" }}>
                Rent top developers, not hire them. The smarter way to scale
                your engineering team.
              </p>
            </div>

            <div>
              <h4
                style={{
                  color: "#ffffff",
                  fontWeight: 600,
                  marginBottom: "1rem",
                }}
              >
                Product
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  "How it Works",
                  "Pricing",
                  "Browse Developers",
                  "For Companies",
                ].map((item) => (
                  <li key={item} style={{ marginBottom: "0.75rem" }}>
                    <a
                      href="#"
                      style={{
                        color: "inherit",
                        textDecoration: "none",
                        fontSize: "0.9375rem",
                      }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4
                style={{
                  color: "#ffffff",
                  fontWeight: 600,
                  marginBottom: "1rem",
                }}
              >
                For Developers
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["Join as Developer", "Requirements", "Benefits", "FAQ"].map(
                  (item) => (
                    <li key={item} style={{ marginBottom: "0.75rem" }}>
                      <a
                        href="#"
                        style={{
                          color: "inherit",
                          textDecoration: "none",
                          fontSize: "0.9375rem",
                        }}
                      >
                        {item}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div>
              <h4
                style={{
                  color: "#ffffff",
                  fontWeight: 600,
                  marginBottom: "1rem",
                }}
              >
                Company
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["About Us", "Blog", "Careers", "Contact"].map((item) => (
                  <li key={item} style={{ marginBottom: "0.75rem" }}>
                    <a
                      href="#"
                      style={{
                        color: "inherit",
                        textDecoration: "none",
                        fontSize: "0.9375rem",
                      }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: "2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p style={{ fontSize: "0.875rem" }}>
              © 2026 StratosTalent. All rights reserved.
            </p>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              {["Privacy Policy", "Terms of Service", "Cookies"].map((item) => (
                <a
                  key={item}
                  href="#"
                  style={{
                    color: "inherit",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                  }}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
