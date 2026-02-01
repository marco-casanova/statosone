"use client";

import { HTMLAttributes, forwardRef } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { SkillTag } from "../ui/SkillTag";
import { Rating } from "../ui/Rating";
import { AvailabilityCalendar } from "../ui/AvailabilityCalendar";
import { GradientButton } from "../ui/GradientButton";
import {
  MapPin,
  Clock,
  Mail,
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Briefcase,
  GraduationCap,
  Award,
  Heart,
} from "lucide-react";

export interface Skill {
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  years?: number;
}

export interface Developer {
  id: string;
  name: string;
  title: string;
  avatar?: string;
  location: string;
  timezone: string;
  bio: string;
  yearsExperience: number;
  skills: Skill[];
  languages: { name: string; proficiency: string }[];
  availability: {
    hourly?: number;
    daily?: number;
    monthly?: number;
    hoursPerWeek?: number;
  };
  availableFrom?: string;
  bookedUntil?: string;
  rating: number;
  reviewCount: number;
  completedProjects: number;
  verified: boolean;
  featured?: boolean;
  status: "online" | "offline" | "busy" | "away";
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  education?: { degree: string; school: string; year: string }[];
  certifications?: { name: string; issuer: string; year: string }[];
}

interface DeveloperProfileProps extends HTMLAttributes<HTMLDivElement> {
  developer: Developer;
  variant?: "full" | "card" | "compact";
  showAvailability?: boolean;
  showActions?: boolean;
  onContact?: () => void;
  onBookmark?: () => void;
}

export const DeveloperProfile = forwardRef<
  HTMLDivElement,
  DeveloperProfileProps
>(
  (
    {
      developer,
      variant = "full",
      showAvailability = true,
      showActions = true,
      onContact,
      onBookmark,
      style,
      ...props
    },
    ref,
  ) => {
    const isCard = variant === "card";
    const isCompact = variant === "compact";
    const isFull = variant === "full";

    if (isCompact) {
      return (
        <GlassCard
          ref={ref}
          variant="light"
          padding="md"
          hover
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            cursor: "pointer",
            ...style,
          }}
          {...props}
        >
          <Avatar
            src={developer.avatar}
            name={developer.name}
            size="md"
            status={developer.status}
            verified={developer.verified}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
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
                  fontWeight: 600,
                  color: "var(--gray-900)",
                  fontSize: "0.9375rem",
                }}
              >
                {developer.name}
              </span>
              {developer.featured && (
                <Badge variant="secondary" size="xs">
                  Featured
                </Badge>
              )}
            </div>
            <div
              style={{
                fontSize: "0.8125rem",
                color: "var(--gray-600)",
                marginBottom: "0.25rem",
              }}
            >
              {developer.title}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                fontSize: "0.75rem",
                color: "var(--gray-500)",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                <MapPin size={12} />
                {developer.location}
              </span>
              <Rating value={developer.rating} size="sm" showValue={false} />
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "1.125rem",
                fontWeight: 700,
                color: "var(--primary-600)",
              }}
            >
              €{developer.availability.hourly}/h
            </div>
            <div style={{ fontSize: "0.6875rem", color: "var(--gray-400)" }}>
              {developer.availability.hoursPerWeek}h/week
            </div>
          </div>
        </GlassCard>
      );
    }

    if (isCard) {
      return (
        <GlassCard
          ref={ref}
          variant="light"
          padding="lg"
          hover
          borderGradient={developer.featured}
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            ...style,
          }}
          {...props}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <Avatar
              src={developer.avatar}
              name={developer.name}
              size="xl"
              status={developer.status}
              verified={developer.verified}
            />
            <div style={{ flex: 1 }}>
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
                    fontWeight: 700,
                    color: "var(--gray-900)",
                    fontSize: "1.125rem",
                  }}
                >
                  {developer.name}
                </span>
                {developer.featured && (
                  <Badge variant="secondary" size="xs">
                    Featured
                  </Badge>
                )}
              </div>
              <div
                style={{
                  fontSize: "0.9375rem",
                  color: "var(--gray-600)",
                  marginBottom: "0.5rem",
                }}
              >
                {developer.title}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  fontSize: "0.8125rem",
                  color: "var(--gray-500)",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <MapPin size={14} />
                  {developer.location}
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <Clock size={14} />
                  {developer.timezone}
                </span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div style={{ marginBottom: "1rem" }}>
            <Rating
              value={developer.rating}
              reviewCount={developer.reviewCount}
              size="sm"
            />
          </div>

          {/* Skills */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.375rem",
              marginBottom: "1rem",
            }}
          >
            {developer.skills.slice(0, 5).map((skill, index) => (
              <SkillTag key={index} skill={skill.name} level={skill.level} />
            ))}
            {developer.skills.length > 5 && (
              <Badge variant="outline" size="sm">
                +{developer.skills.length - 5}
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.75rem",
              padding: "1rem",
              background: "var(--gray-50)",
              borderRadius: "var(--radius-lg)",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--primary-600)",
                }}
              >
                {developer.yearsExperience}+
              </div>
              <div style={{ fontSize: "0.6875rem", color: "var(--gray-500)" }}>
                Years Exp
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--accent-600)",
                }}
              >
                {developer.completedProjects}
              </div>
              <div style={{ fontSize: "0.6875rem", color: "var(--gray-500)" }}>
                Projects
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--secondary-600)",
                }}
              >
                {developer.rating.toFixed(1)}
              </div>
              <div style={{ fontSize: "0.6875rem", color: "var(--gray-500)" }}>
                Rating
              </div>
            </div>
          </div>

          {/* Price & Availability */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "auto",
              paddingTop: "1rem",
              borderTop: "1px solid var(--gray-100)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "var(--gray-900)",
                }}
              >
                €{developer.availability.hourly}
                <span
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 400,
                    color: "var(--gray-500)",
                  }}
                >
                  /hour
                </span>
              </div>
              <Badge
                variant={developer.bookedUntil ? "warning" : "success"}
                size="xs"
                dot
                pulse={!developer.bookedUntil}
              >
                {developer.bookedUntil
                  ? `Booked until ${developer.bookedUntil}`
                  : "Available Now"}
              </Badge>
            </div>
            {showActions && (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={onBookmark}
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--gray-200)",
                    background: "#ffffff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--gray-500)",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  <Heart size={18} />
                </button>
                <GradientButton size="sm" onClick={onContact}>
                  Contact
                </GradientButton>
              </div>
            )}
          </div>
        </GlassCard>
      );
    }

    // Full profile view
    return (
      <div ref={ref} style={{ ...style }} {...props}>
        {/* Hero Section */}
        <div
          style={{
            background: "var(--gradient-dark)",
            borderRadius: "var(--radius-2xl)",
            padding: "2.5rem",
            marginBottom: "2rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative elements */}
          <div
            style={{
              position: "absolute",
              top: "-50%",
              right: "-10%",
              width: "400px",
              height: "400px",
              borderRadius: "var(--radius-full)",
              background: "var(--gradient-primary)",
              opacity: 0.1,
              filter: "blur(60px)",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "2rem",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Avatar
              src={developer.avatar}
              name={developer.name}
              size="2xl"
              status={developer.status}
              verified={developer.verified}
              ring
              ringColor="var(--primary-400)"
            />
            <div style={{ flex: 1, color: "#ffffff" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "0.5rem",
                }}
              >
                <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>
                  {developer.name}
                </h1>
                {developer.featured && (
                  <Badge variant="secondary" size="sm">
                    ⭐ Featured
                  </Badge>
                )}
              </div>
              <div
                style={{
                  fontSize: "1.25rem",
                  opacity: 0.9,
                  marginBottom: "1rem",
                }}
              >
                {developer.title}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5rem",
                  fontSize: "0.9375rem",
                  opacity: 0.8,
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                  }}
                >
                  <MapPin size={16} />
                  {developer.location}
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                  }}
                >
                  <Clock size={16} />
                  {developer.timezone}
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                  }}
                >
                  <Briefcase size={16} />
                  {developer.yearsExperience}+ years experience
                </span>
              </div>

              {/* Social Links */}
              {developer.socialLinks && (
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    marginTop: "1.5rem",
                  }}
                >
                  {developer.socialLinks.github && (
                    <a
                      href={developer.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "2.5rem",
                        height: "2.5rem",
                        borderRadius: "var(--radius-lg)",
                        background: "rgba(255,255,255,0.1)",
                        color: "#ffffff",
                        transition: "all var(--transition-fast)",
                      }}
                    >
                      <Github size={18} />
                    </a>
                  )}
                  {developer.socialLinks.linkedin && (
                    <a
                      href={developer.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "2.5rem",
                        height: "2.5rem",
                        borderRadius: "var(--radius-lg)",
                        background: "rgba(255,255,255,0.1)",
                        color: "#ffffff",
                        transition: "all var(--transition-fast)",
                      }}
                    >
                      <Linkedin size={18} />
                    </a>
                  )}
                  {developer.socialLinks.twitter && (
                    <a
                      href={developer.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "2.5rem",
                        height: "2.5rem",
                        borderRadius: "var(--radius-lg)",
                        background: "rgba(255,255,255,0.1)",
                        color: "#ffffff",
                        transition: "all var(--transition-fast)",
                      }}
                    >
                      <Twitter size={18} />
                    </a>
                  )}
                  {developer.socialLinks.website && (
                    <a
                      href={developer.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "2.5rem",
                        height: "2.5rem",
                        borderRadius: "var(--radius-lg)",
                        background: "rgba(255,255,255,0.1)",
                        color: "#ffffff",
                        transition: "all var(--transition-fast)",
                      }}
                    >
                      <Globe size={18} />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Rating Card */}
            <GlassCard
              variant="light"
              padding="lg"
              style={{ minWidth: "180px", textAlign: "center" }}
            >
              <div style={{ marginBottom: "0.5rem" }}>
                <Rating value={developer.rating} showValue={false} size="lg" />
              </div>
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "var(--gray-900)",
                }}
              >
                {developer.rating.toFixed(1)}
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)" }}>
                {developer.reviewCount} reviews
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: "2rem",
          }}
        >
          {/* Left Column */}
          <div>
            {/* Bio */}
            <GlassCard
              variant="light"
              padding="lg"
              style={{ marginBottom: "1.5rem" }}
            >
              <h2
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                  color: "var(--gray-900)",
                }}
              >
                About
              </h2>
              <p
                style={{
                  fontSize: "0.9375rem",
                  lineHeight: 1.8,
                  color: "var(--gray-600)",
                }}
              >
                {developer.bio}
              </p>
            </GlassCard>

            {/* Skills */}
            <GlassCard
              variant="light"
              padding="lg"
              style={{ marginBottom: "1.5rem" }}
            >
              <h2
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                  color: "var(--gray-900)",
                }}
              >
                Skills & Expertise
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {developer.skills.map((skill, index) => (
                  <SkillTag
                    key={index}
                    skill={skill.name}
                    level={skill.level}
                    years={skill.years}
                  />
                ))}
              </div>
            </GlassCard>

            {/* Languages */}
            <GlassCard
              variant="light"
              padding="lg"
              style={{ marginBottom: "1.5rem" }}
            >
              <h2
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                  color: "var(--gray-900)",
                }}
              >
                Languages
              </h2>
              <div
                style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}
              >
                {developer.languages.map((lang, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "var(--gray-50)",
                      borderRadius: "var(--radius-lg)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span style={{ fontWeight: 500, color: "var(--gray-800)" }}>
                      {lang.name}
                    </span>
                    <Badge variant="outline" size="xs">
                      {lang.proficiency}
                    </Badge>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Education & Certifications */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
              }}
            >
              {developer.education && developer.education.length > 0 && (
                <GlassCard variant="light" padding="lg">
                  <h2
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "var(--gray-900)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <GraduationCap size={20} />
                    Education
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    {developer.education.map((edu, index) => (
                      <div key={index}>
                        <div
                          style={{ fontWeight: 500, color: "var(--gray-800)" }}
                        >
                          {edu.degree}
                        </div>
                        <div
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--gray-500)",
                          }}
                        >
                          {edu.school} • {edu.year}
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
              {developer.certifications &&
                developer.certifications.length > 0 && (
                  <GlassCard variant="light" padding="lg">
                    <h2
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: 600,
                        marginBottom: "1rem",
                        color: "var(--gray-900)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Award size={20} />
                      Certifications
                    </h2>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      {developer.certifications.map((cert, index) => (
                        <div key={index}>
                          <div
                            style={{
                              fontWeight: 500,
                              color: "var(--gray-800)",
                            }}
                          >
                            {cert.name}
                          </div>
                          <div
                            style={{
                              fontSize: "0.8125rem",
                              color: "var(--gray-500)",
                            }}
                          >
                            {cert.issuer} • {cert.year}
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}
            </div>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div>
            <div style={{ position: "sticky", top: "2rem" }}>
              {showAvailability && (
                <GlassCard
                  variant="light"
                  padding="none"
                  style={{ marginBottom: "1.5rem", overflow: "hidden" }}
                >
                  <AvailabilityCalendar
                    availability={developer.availability}
                    timezone={developer.timezone}
                    availableFrom={developer.availableFrom}
                    bookedUntil={developer.bookedUntil}
                  />
                </GlassCard>
              )}

              {showActions && (
                <GlassCard variant="gradient" padding="lg">
                  <div style={{ marginBottom: "1rem" }}>
                    <div
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--gray-500)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Ready to work with {developer.name.split(" ")[0]}?
                    </div>
                    <div
                      style={{ fontSize: "0.875rem", color: "var(--gray-600)" }}
                    >
                      Book a consultation or send a direct message.
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                    }}
                  >
                    <GradientButton fullWidth size="lg" onClick={onContact}>
                      <Mail size={18} />
                      Contact {developer.name.split(" ")[0]}
                    </GradientButton>
                    <GradientButton
                      variant="outline"
                      fullWidth
                      size="lg"
                      onClick={onBookmark}
                    >
                      <Heart size={18} />
                      Save to Favorites
                    </GradientButton>
                  </div>
                </GlassCard>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

DeveloperProfile.displayName = "DeveloperProfile";
