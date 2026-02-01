"use client";

import { useAuth } from "@stratos/auth";
import Link from "next/link";
import { DeveloperProfile, Developer } from "@/components/profile";
import {
  GlassCard,
  GradientButton,
  Badge,
  Avatar,
  Rating,
} from "@/components/ui";
import {
  LogOut,
  Search,
  Users,
  Briefcase,
  TrendingUp,
  Calendar,
  Bell,
  Settings,
  ChevronRight,
  Star,
  Clock,
  Heart,
  MessageSquare,
  FileText,
  ArrowUpRight,
  Code2,
} from "lucide-react";

// Mock data for recommended developers
const recommendedDevelopers: Developer[] = [
  {
    id: "1",
    name: "Alex Thompson",
    title: "Senior Full-Stack Developer",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    location: "Berlin, Germany",
    timezone: "CET",
    bio: "Passionate full-stack developer with 8+ years of experience.",
    yearsExperience: 8,
    skills: [
      { name: "React", level: "expert", years: 6 },
      { name: "TypeScript", level: "expert", years: 5 },
      { name: "Node.js", level: "expert", years: 7 },
    ],
    languages: [{ name: "English", proficiency: "Native" }],
    availability: { hourly: 95, daily: 680, monthly: 12500, hoursPerWeek: 40 },
    rating: 4.9,
    reviewCount: 47,
    completedProjects: 32,
    verified: true,
    featured: true,
    status: "online",
  },
  {
    id: "2",
    name: "Sarah Chen",
    title: "React Native & iOS Developer",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    location: "London, UK",
    timezone: "GMT",
    bio: "Mobile developer specializing in React Native and native iOS development.",
    yearsExperience: 6,
    skills: [
      { name: "React Native", level: "expert", years: 5 },
      { name: "iOS/Swift", level: "expert", years: 6 },
    ],
    languages: [{ name: "English", proficiency: "Native" }],
    availability: { hourly: 110, daily: 800, monthly: 14000, hoursPerWeek: 32 },
    rating: 4.8,
    reviewCount: 38,
    completedProjects: 28,
    verified: true,
    featured: false,
    status: "online",
  },
  {
    id: "3",
    name: "Marcus Williams",
    title: "DevOps & Cloud Architect",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    location: "Amsterdam, NL",
    timezone: "CET",
    bio: "Cloud infrastructure expert with deep expertise in AWS, GCP, and Kubernetes.",
    yearsExperience: 10,
    skills: [
      { name: "AWS", level: "expert", years: 8 },
      { name: "Kubernetes", level: "expert", years: 5 },
    ],
    languages: [{ name: "English", proficiency: "Native" }],
    availability: { hourly: 130, daily: 950, monthly: 18000, hoursPerWeek: 40 },
    bookedUntil: "Mar 15",
    rating: 5.0,
    reviewCount: 52,
    completedProjects: 41,
    verified: true,
    featured: true,
    status: "busy",
  },
];

const recentActivity = [
  {
    type: "message",
    text: "New message from Alex Thompson",
    time: "2 hours ago",
    icon: <MessageSquare size={16} />,
  },
  {
    type: "review",
    text: "You received a new review",
    time: "1 day ago",
    icon: <Star size={16} />,
  },
  {
    type: "project",
    text: "Project milestone completed",
    time: "3 days ago",
    icon: <FileText size={16} />,
  },
];

export default function AppDashboard() {
  const { user, signOut } = useAuth();

  const stats = [
    {
      label: "Active Projects",
      value: "3",
      change: "+1 this month",
      icon: <Briefcase size={20} />,
      color: "var(--primary-500)",
    },
    {
      label: "Total Spent",
      value: "€24,500",
      change: "This quarter",
      icon: <TrendingUp size={20} />,
      color: "var(--accent-500)",
    },
    {
      label: "Saved Developers",
      value: "12",
      change: "In your list",
      icon: <Heart size={20} />,
      color: "var(--secondary-500)",
    },
    {
      label: "Avg. Rating Given",
      value: "4.8",
      change: "From 8 reviews",
      icon: <Star size={20} />,
      color: "var(--warning)",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--gray-50)",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: "280px",
          background: "#ffffff",
          borderRight: "1px solid var(--gray-100)",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            textDecoration: "none",
            marginBottom: "2rem",
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
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "var(--gray-900)",
            }}
          >
            StratosTalent
          </span>
        </Link>

        {/* Navigation */}
        <nav style={{ flex: 1 }}>
          <div style={{ marginBottom: "2rem" }}>
            <p
              style={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: "var(--gray-400)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "0.75rem",
                padding: "0 0.75rem",
              }}
            >
              Main Menu
            </p>
            {[
              {
                icon: <Search size={18} />,
                label: "Find Developers",
                href: "/talent",
                active: false,
              },
              {
                icon: <Briefcase size={18} />,
                label: "My Projects",
                href: "/app/projects",
                active: false,
              },
              {
                icon: <Users size={18} />,
                label: "My Team",
                href: "/app/team",
                active: false,
              },
              {
                icon: <Heart size={18} />,
                label: "Saved",
                href: "/app/saved",
                active: false,
              },
              {
                icon: <MessageSquare size={18} />,
                label: "Messages",
                href: "/app/messages",
                badge: "3",
              },
            ].map((item, index) => (
              <Link
                key={index}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem",
                  borderRadius: "var(--radius-lg)",
                  color: item.active ? "var(--primary-600)" : "var(--gray-700)",
                  background: item.active ? "var(--primary-50)" : "transparent",
                  textDecoration: "none",
                  fontSize: "0.9375rem",
                  fontWeight: 500,
                  marginBottom: "0.25rem",
                  transition: "all var(--transition-fast)",
                }}
              >
                {item.icon}
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <Badge variant="primary" size="xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </div>

          <div>
            <p
              style={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: "var(--gray-400)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "0.75rem",
                padding: "0 0.75rem",
              }}
            >
              Account
            </p>
            {[
              {
                icon: <Settings size={18} />,
                label: "Settings",
                href: "/app/settings",
              },
              {
                icon: <Bell size={18} />,
                label: "Notifications",
                href: "/app/notifications",
              },
            ].map((item, index) => (
              <Link
                key={index}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem",
                  borderRadius: "var(--radius-lg)",
                  color: "var(--gray-700)",
                  textDecoration: "none",
                  fontSize: "0.9375rem",
                  fontWeight: 500,
                  marginBottom: "0.25rem",
                  transition: "all var(--transition-fast)",
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* User section */}
        <div
          style={{
            padding: "1rem",
            background: "var(--gray-50)",
            borderRadius: "var(--radius-xl)",
            marginTop: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "0.75rem",
            }}
          >
            <Avatar name={user?.email || "User"} size="md" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "var(--gray-900)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.email?.split("@")[0] || "User"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>
                Pro Plan
              </div>
            </div>
          </div>
          <button
            onClick={signOut}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              width: "100%",
              padding: "0.625rem",
              background: "transparent",
              border: "1px solid var(--gray-200)",
              borderRadius: "var(--radius-md)",
              color: "var(--gray-600)",
              fontSize: "0.8125rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: "280px", padding: "2rem" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "2rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "var(--gray-900)",
                marginBottom: "0.25rem",
              }}
            >
              Welcome back! 👋
            </h1>
            <p style={{ fontSize: "0.9375rem", color: "var(--gray-500)" }}>
              Here's what's happening with your projects today.
            </p>
          </div>
          <Link href="/talent">
            <GradientButton>
              <Search size={18} />
              Find Developers
            </GradientButton>
          </Link>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1.25rem",
            marginBottom: "2rem",
          }}
        >
          {stats.map((stat, index) => (
            <GlassCard key={index} variant="light" padding="lg">
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "var(--radius-lg)",
                    background: `${stat.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </div>
                <ArrowUpRight size={16} color="var(--gray-400)" />
              </div>
              <div
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  color: "var(--gray-900)",
                  marginBottom: "0.25rem",
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)" }}>
                {stat.label}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--accent-600)",
                  marginTop: "0.5rem",
                }}
              >
                {stat.change}
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Main Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: "1.5rem",
          }}
        >
          {/* Recommended Developers */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  color: "var(--gray-900)",
                }}
              >
                Recommended for You
              </h2>
              <Link
                href="/talent"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--primary-600)",
                  textDecoration: "none",
                }}
              >
                View all
                <ChevronRight size={16} />
              </Link>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {recommendedDevelopers.map((developer) => (
                <DeveloperProfile
                  key={developer.id}
                  developer={developer}
                  variant="compact"
                  onClick={() =>
                    (window.location.href = `/talent/${developer.id}`)
                  }
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {/* Quick Actions */}
            <GlassCard variant="gradient" padding="lg">
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "var(--gray-900)",
                  marginBottom: "1rem",
                }}
              >
                Quick Actions
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <Link href="/talent" style={{ textDecoration: "none" }}>
                  <GradientButton fullWidth variant="primary" size="md">
                    <Search size={16} />
                    Find a Developer
                  </GradientButton>
                </Link>
                <GradientButton fullWidth variant="outline" size="md">
                  <FileText size={16} />
                  Post a Project
                </GradientButton>
              </div>
            </GlassCard>

            {/* Recent Activity */}
            <GlassCard variant="light" padding="lg">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "var(--gray-900)",
                  }}
                >
                  Recent Activity
                </h3>
                <Badge variant="primary" size="xs">
                  3 new
                </Badge>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                      padding: "0.75rem",
                      background: "var(--gray-50)",
                      borderRadius: "var(--radius-lg)",
                    }}
                  >
                    <div
                      style={{
                        width: "2rem",
                        height: "2rem",
                        borderRadius: "var(--radius-md)",
                        background: "var(--primary-100)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--primary-600)",
                        flexShrink: 0,
                      }}
                    >
                      {activity.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          color: "var(--gray-800)",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {activity.text}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--gray-400)",
                        }}
                      >
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Help Card */}
            <GlassCard
              variant="light"
              padding="lg"
              style={{ background: "var(--gradient-dark)", color: "#ffffff" }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                }}
              >
                Need Help?
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  opacity: 0.8,
                  marginBottom: "1rem",
                }}
              >
                Our team is here to help you find the perfect developer for your
                project.
              </p>
              <GradientButton
                variant="outline"
                size="sm"
                style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}
              >
                Contact Support
              </GradientButton>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}
