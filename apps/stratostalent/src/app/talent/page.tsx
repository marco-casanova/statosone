"use client";

import { useState, useMemo } from "react";
import { DeveloperProfile, Developer } from "@/components/profile";
import { GlassCard, GradientButton, Badge, SkillTag } from "@/components/ui";
import {
  Search,
  Filter,
  ChevronDown,
  X,
  SlidersHorizontal,
  Sparkles,
  Users,
  Zap,
  Globe,
} from "lucide-react";

// Mock data for developers
const mockDevelopers: Developer[] = [
  {
    id: "1",
    name: "Alex Thompson",
    title: "Senior Full-Stack Developer",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    location: "Berlin, Germany",
    timezone: "CET",
    bio: "Passionate full-stack developer with 8+ years of experience building scalable web applications. Expert in React, Node.js, and cloud architecture. Love turning complex problems into simple, beautiful solutions.",
    yearsExperience: 8,
    skills: [
      { name: "React", level: "expert", years: 6 },
      { name: "TypeScript", level: "expert", years: 5 },
      { name: "Node.js", level: "expert", years: 7 },
      { name: "PostgreSQL", level: "advanced", years: 6 },
      { name: "AWS", level: "advanced", years: 4 },
      { name: "Docker", level: "intermediate", years: 3 },
    ],
    languages: [
      { name: "English", proficiency: "Native" },
      { name: "German", proficiency: "Fluent" },
    ],
    availability: { hourly: 95, daily: 680, monthly: 12500, hoursPerWeek: 40 },
    rating: 4.9,
    reviewCount: 47,
    completedProjects: 32,
    verified: true,
    featured: true,
    status: "online",
    socialLinks: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
    },
  },
  {
    id: "2",
    name: "Sarah Chen",
    title: "React Native & iOS Developer",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    location: "London, UK",
    timezone: "GMT",
    bio: "Mobile developer specializing in React Native and native iOS development. Built apps used by millions of users worldwide.",
    yearsExperience: 6,
    skills: [
      { name: "React Native", level: "expert", years: 5 },
      { name: "iOS/Swift", level: "expert", years: 6 },
      { name: "TypeScript", level: "advanced", years: 4 },
      { name: "Firebase", level: "advanced", years: 3 },
    ],
    languages: [
      { name: "English", proficiency: "Native" },
      { name: "Mandarin", proficiency: "Native" },
    ],
    availability: { hourly: 110, daily: 800, monthly: 14000, hoursPerWeek: 32 },
    rating: 4.8,
    reviewCount: 38,
    completedProjects: 28,
    verified: true,
    featured: false,
    status: "online",
    socialLinks: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
    },
  },
  {
    id: "3",
    name: "Marcus Williams",
    title: "DevOps & Cloud Architect",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    location: "Amsterdam, NL",
    timezone: "CET",
    bio: "Cloud infrastructure expert with deep expertise in AWS, GCP, and Kubernetes. Helping companies scale from startup to enterprise.",
    yearsExperience: 10,
    skills: [
      { name: "AWS", level: "expert", years: 8 },
      { name: "Kubernetes", level: "expert", years: 5 },
      { name: "Terraform", level: "expert", years: 6 },
      { name: "Python", level: "advanced", years: 7 },
      { name: "Docker", level: "expert", years: 6 },
    ],
    languages: [
      { name: "English", proficiency: "Native" },
      { name: "Dutch", proficiency: "Conversational" },
    ],
    availability: { hourly: 130, daily: 950, monthly: 18000, hoursPerWeek: 40 },
    bookedUntil: "Mar 15",
    rating: 5.0,
    reviewCount: 52,
    completedProjects: 41,
    verified: true,
    featured: true,
    status: "busy",
    socialLinks: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      website: "https://example.com",
    },
  },
  {
    id: "4",
    name: "Emily Rodriguez",
    title: "UI/UX Designer & Frontend Dev",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    location: "Barcelona, Spain",
    timezone: "CET",
    bio: "Design-focused frontend developer creating beautiful, accessible, and performant user interfaces. Bridging design and development.",
    yearsExperience: 5,
    skills: [
      { name: "Figma", level: "expert", years: 5 },
      { name: "React", level: "advanced", years: 4 },
      { name: "CSS/Tailwind", level: "expert", years: 5 },
      { name: "Framer Motion", level: "advanced", years: 3 },
    ],
    languages: [
      { name: "Spanish", proficiency: "Native" },
      { name: "English", proficiency: "Fluent" },
    ],
    availability: { hourly: 85, daily: 600, monthly: 10000, hoursPerWeek: 40 },
    rating: 4.7,
    reviewCount: 29,
    completedProjects: 24,
    verified: true,
    featured: false,
    status: "online",
    socialLinks: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
    },
  },
  {
    id: "5",
    name: "David Kim",
    title: "Backend & AI/ML Engineer",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    location: "Seoul, South Korea",
    timezone: "KST",
    bio: "Backend engineer with deep experience in machine learning and AI. Building intelligent systems at scale.",
    yearsExperience: 7,
    skills: [
      { name: "Python", level: "expert", years: 7 },
      { name: "PyTorch", level: "expert", years: 4 },
      { name: "FastAPI", level: "advanced", years: 3 },
      { name: "PostgreSQL", level: "advanced", years: 5 },
      { name: "Redis", level: "intermediate", years: 3 },
    ],
    languages: [
      { name: "Korean", proficiency: "Native" },
      { name: "English", proficiency: "Fluent" },
    ],
    availability: { hourly: 120, daily: 880, monthly: 16000, hoursPerWeek: 40 },
    rating: 4.9,
    reviewCount: 35,
    completedProjects: 27,
    verified: true,
    featured: false,
    status: "away",
    socialLinks: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
    },
  },
  {
    id: "6",
    name: "Lisa Anderson",
    title: "Blockchain & Web3 Developer",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    location: "New York, USA",
    timezone: "EST",
    bio: "Web3 pioneer building decentralized applications. Expert in Solidity, smart contracts, and DeFi protocols.",
    yearsExperience: 4,
    skills: [
      { name: "Solidity", level: "expert", years: 4 },
      { name: "Ethereum", level: "expert", years: 4 },
      { name: "React", level: "advanced", years: 5 },
      { name: "Node.js", level: "advanced", years: 4 },
    ],
    languages: [{ name: "English", proficiency: "Native" }],
    availability: {
      hourly: 150,
      daily: 1100,
      monthly: 20000,
      hoursPerWeek: 32,
    },
    rating: 4.8,
    reviewCount: 22,
    completedProjects: 18,
    verified: true,
    featured: true,
    status: "online",
    socialLinks: {
      github: "https://github.com",
      twitter: "https://twitter.com",
    },
  },
];

const allSkills = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "AWS",
  "Docker",
  "Kubernetes",
  "PostgreSQL",
  "MongoDB",
  "GraphQL",
  "React Native",
  "iOS/Swift",
  "Figma",
  "Solidity",
  "PyTorch",
  "FastAPI",
  "Terraform",
  "Redis",
  "Firebase",
];

const experienceLevels = [
  "Any",
  "1-3 years",
  "3-5 years",
  "5-8 years",
  "8+ years",
];
const availabilityOptions = [
  "Any",
  "Available Now",
  "Within 2 weeks",
  "Within 1 month",
];
const priceRanges = ["Any", "< €80/h", "€80-100/h", "€100-150/h", "> €150/h"];

export default function TalentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experienceFilter, setExperienceFilter] = useState("Any");
  const [availabilityFilter, setAvailabilityFilter] = useState("Any");
  const [priceFilter, setPriceFilter] = useState("Any");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"rating" | "price" | "experience">(
    "rating",
  );

  const filteredDevelopers = useMemo(() => {
    let result = [...mockDevelopers];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (dev) =>
          dev.name.toLowerCase().includes(query) ||
          dev.title.toLowerCase().includes(query) ||
          dev.skills.some((s) => s.name.toLowerCase().includes(query)),
      );
    }

    // Skills filter
    if (selectedSkills.length > 0) {
      result = result.filter((dev) =>
        selectedSkills.every((skill) =>
          dev.skills.some((s) => s.name.toLowerCase() === skill.toLowerCase()),
        ),
      );
    }

    // Experience filter
    if (experienceFilter !== "Any") {
      result = result.filter((dev) => {
        const years = dev.yearsExperience;
        switch (experienceFilter) {
          case "1-3 years":
            return years >= 1 && years <= 3;
          case "3-5 years":
            return years >= 3 && years <= 5;
          case "5-8 years":
            return years >= 5 && years <= 8;
          case "8+ years":
            return years >= 8;
          default:
            return true;
        }
      });
    }

    // Availability filter
    if (availabilityFilter !== "Any") {
      result = result.filter((dev) => {
        if (availabilityFilter === "Available Now") return !dev.bookedUntil;
        return true;
      });
    }

    // Price filter
    if (priceFilter !== "Any") {
      result = result.filter((dev) => {
        const rate = dev.availability.hourly || 0;
        switch (priceFilter) {
          case "< €80/h":
            return rate < 80;
          case "€80-100/h":
            return rate >= 80 && rate <= 100;
          case "€100-150/h":
            return rate > 100 && rate <= 150;
          case "> €150/h":
            return rate > 150;
          default:
            return true;
        }
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "price":
          return (a.availability.hourly || 0) - (b.availability.hourly || 0);
        case "experience":
          return b.yearsExperience - a.yearsExperience;
        default:
          return 0;
      }
    });

    // Featured first
    result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

    return result;
  }, [
    searchQuery,
    selectedSkills,
    experienceFilter,
    availabilityFilter,
    priceFilter,
    sortBy,
  ]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSkills([]);
    setExperienceFilter("Any");
    setAvailabilityFilter("Any");
    setPriceFilter("Any");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedSkills.length > 0 ||
    experienceFilter !== "Any" ||
    availabilityFilter !== "Any" ||
    priceFilter !== "Any";

  return (
    <div style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
      {/* Hero Header */}
      <div
        style={{
          background: "var(--gradient-dark)",
          padding: "4rem 2rem 6rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "20%",
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
            position: "absolute",
            bottom: "-100px",
            right: "10%",
            width: "400px",
            height: "400px",
            borderRadius: "var(--radius-full)",
            background: "var(--gradient-secondary)",
            opacity: 0.1,
            filter: "blur(80px)",
          }}
        />

        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <Badge
              variant="secondary"
              size="md"
              style={{ marginBottom: "1rem" }}
            >
              <Sparkles size={14} />
              Pre-vetted Talent
            </Badge>
            <h1
              style={{
                fontSize: "2.75rem",
                fontWeight: 800,
                color: "#ffffff",
                marginBottom: "1rem",
              }}
            >
              Find Your Perfect Developer
            </h1>
            <p
              style={{
                fontSize: "1.125rem",
                color: "rgba(255,255,255,0.7)",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              Browse our curated network of senior developers, designers, and
              engineers. All pre-vetted, all ready to start.
            </p>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "3rem",
              marginBottom: "2rem",
            }}
          >
            {[
              {
                icon: <Users size={20} />,
                value: "500+",
                label: "Active Developers",
              },
              {
                icon: <Zap size={20} />,
                value: "48h",
                label: "Avg. Response Time",
              },
              { icon: <Globe size={20} />, value: "40+", label: "Countries" },
            ].map((stat, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                <div
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "var(--radius-lg)",
                    background: "rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search Bar */}
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRadius: "var(--radius-xl)",
                padding: "0.5rem",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                }}
              >
                <Search size={20} color="rgba(255,255,255,0.5)" />
                <input
                  type="text"
                  placeholder="Search by skill, name, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#ffffff",
                    fontSize: "1rem",
                  }}
                />
              </div>
              <GradientButton size="lg">Search Talent</GradientButton>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: "1400px",
          margin: "-3rem auto 0",
          padding: "0 2rem 4rem",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Filters Bar */}
        <GlassCard
          variant="light"
          padding="md"
          style={{ marginBottom: "2rem" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.625rem 1rem",
                  background: showFilters
                    ? "var(--primary-50)"
                    : "var(--gray-50)",
                  border: `1px solid ${showFilters ? "var(--primary-200)" : "var(--gray-200)"}`,
                  borderRadius: "var(--radius-lg)",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: showFilters ? "var(--primary-600)" : "var(--gray-700)",
                  transition: "all var(--transition-fast)",
                }}
              >
                <SlidersHorizontal size={16} />
                Filters
                {hasActiveFilters && (
                  <Badge
                    variant="primary"
                    size="xs"
                    style={{ marginLeft: "0.25rem" }}
                  >
                    {
                      [
                        searchQuery,
                        ...selectedSkills,
                        experienceFilter,
                        availabilityFilter,
                        priceFilter,
                      ].filter((f) => f && f !== "Any").length
                    }
                  </Badge>
                )}
                <ChevronDown
                  size={14}
                  style={{
                    transform: showFilters ? "rotate(180deg)" : "none",
                    transition: "transform var(--transition-fast)",
                  }}
                />
              </button>

              {/* Quick skill filters */}
              {["React", "TypeScript", "Python", "AWS", "Node.js"].map(
                (skill) => (
                  <Badge
                    key={skill}
                    variant={
                      selectedSkills.includes(skill) ? "primary" : "outline"
                    }
                    size="sm"
                    style={{ cursor: "pointer" }}
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                  </Badge>
                ),
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.5rem 0.75rem",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.8125rem",
                    color: "var(--gray-500)",
                  }}
                >
                  <X size={14} />
                  Clear all
                </button>
              )}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  padding: "0.625rem 1rem",
                  background: "var(--gray-50)",
                  border: "1px solid var(--gray-200)",
                  borderRadius: "var(--radius-lg)",
                  fontSize: "0.875rem",
                  color: "var(--gray-700)",
                  cursor: "pointer",
                }}
              >
                <option value="rating">Sort by Rating</option>
                <option value="price">Sort by Price</option>
                <option value="experience">Sort by Experience</option>
              </select>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div
              style={{
                marginTop: "1.5rem",
                paddingTop: "1.5rem",
                borderTop: "1px solid var(--gray-100)",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {/* Skills */}
              <div>
                <label
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--gray-500)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "0.75rem",
                    display: "block",
                  }}
                >
                  Skills
                </label>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.375rem",
                    maxHeight: "120px",
                    overflowY: "auto",
                  }}
                >
                  {allSkills.map((skill) => (
                    <SkillTag
                      key={skill}
                      skill={skill}
                      level="intermediate"
                      selected={selectedSkills.includes(skill)}
                      onClick={() => toggleSkill(skill)}
                    />
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div>
                <label
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--gray-500)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "0.75rem",
                    display: "block",
                  }}
                >
                  Experience
                </label>
                <select
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    background: "#ffffff",
                    border: "1px solid var(--gray-200)",
                    borderRadius: "var(--radius-lg)",
                    fontSize: "0.875rem",
                    color: "var(--gray-700)",
                  }}
                >
                  {experienceLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              {/* Availability */}
              <div>
                <label
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--gray-500)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "0.75rem",
                    display: "block",
                  }}
                >
                  Availability
                </label>
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    background: "#ffffff",
                    border: "1px solid var(--gray-200)",
                    borderRadius: "var(--radius-lg)",
                    fontSize: "0.875rem",
                    color: "var(--gray-700)",
                  }}
                >
                  {availabilityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--gray-500)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "0.75rem",
                    display: "block",
                  }}
                >
                  Hourly Rate
                </label>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    background: "#ffffff",
                    border: "1px solid var(--gray-200)",
                    borderRadius: "var(--radius-lg)",
                    fontSize: "0.875rem",
                    color: "var(--gray-700)",
                  }}
                >
                  {priceRanges.map((range) => (
                    <option key={range} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Results */}
        <div style={{ marginBottom: "1rem" }}>
          <span style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>
            Showing{" "}
            <strong style={{ color: "var(--gray-900)" }}>
              {filteredDevelopers.length}
            </strong>{" "}
            developers
          </span>
        </div>

        {/* Developer Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {filteredDevelopers.map((developer) => (
            <DeveloperProfile
              key={developer.id}
              developer={developer}
              variant="card"
              onContact={() => console.log("Contact", developer.name)}
              onBookmark={() => console.log("Bookmark", developer.name)}
            />
          ))}
        </div>

        {filteredDevelopers.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              color: "var(--gray-500)",
            }}
          >
            <div
              style={{
                width: "4rem",
                height: "4rem",
                margin: "0 auto 1rem",
                borderRadius: "var(--radius-full)",
                background: "var(--gray-100)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Search size={24} />
            </div>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "var(--gray-900)",
                marginBottom: "0.5rem",
              }}
            >
              No developers found
            </h3>
            <p>Try adjusting your filters or search query</p>
            <GradientButton
              variant="outline"
              style={{ marginTop: "1rem" }}
              onClick={clearFilters}
            >
              Clear Filters
            </GradientButton>
          </div>
        )}
      </div>
    </div>
  );
}
