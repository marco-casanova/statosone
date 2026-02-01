"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { DeveloperProfile, Developer } from "@/components/profile";
import { ProjectsGrid, Project } from "@/components/projects";
import { ReviewsSection, Review } from "@/components/reviews";
import { GradientButton } from "@/components/ui";
import { ArrowLeft } from "lucide-react";

// Mock data for a developer profile
const mockDeveloper: Developer = {
  id: "1",
  name: "Alex Thompson",
  title: "Senior Full-Stack Developer",
  avatar:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  location: "Berlin, Germany",
  timezone: "CET",
  bio: "Passionate full-stack developer with 8+ years of experience building scalable web applications and leading development teams. I specialize in React, Node.js, and cloud architecture, with a focus on creating elegant solutions to complex problems.\n\nThroughout my career, I've worked with startups and enterprises alike, helping them build products that millions of users love. I believe in clean code, test-driven development, and continuous learning.",
  yearsExperience: 8,
  skills: [
    { name: "React", level: "expert", years: 6 },
    { name: "TypeScript", level: "expert", years: 5 },
    { name: "Node.js", level: "expert", years: 7 },
    { name: "PostgreSQL", level: "advanced", years: 6 },
    { name: "AWS", level: "advanced", years: 4 },
    { name: "Docker", level: "intermediate", years: 3 },
    { name: "GraphQL", level: "advanced", years: 4 },
    { name: "Next.js", level: "expert", years: 4 },
    { name: "Tailwind CSS", level: "advanced", years: 3 },
    { name: "Redis", level: "intermediate", years: 3 },
  ],
  languages: [
    { name: "English", proficiency: "Native" },
    { name: "German", proficiency: "Fluent" },
    { name: "Spanish", proficiency: "Conversational" },
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
    website: "https://alexthompson.dev",
  },
  education: [
    {
      degree: "M.Sc. Computer Science",
      school: "Technical University Munich",
      year: "2016",
    },
    {
      degree: "B.Sc. Software Engineering",
      school: "University of Berlin",
      year: "2014",
    },
  ],
  certifications: [
    {
      name: "AWS Solutions Architect",
      issuer: "Amazon Web Services",
      year: "2023",
    },
    { name: "Google Cloud Professional", issuer: "Google", year: "2022" },
    { name: "Meta Frontend Developer", issuer: "Meta", year: "2021" },
  ],
};

const mockProjects: Project[] = [
  {
    id: "1",
    title: "E-Commerce Platform Redesign",
    description:
      "Led the complete frontend redesign of a major e-commerce platform, improving load times by 60% and increasing conversion rates by 25%.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    tags: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Stripe"],
    role: "Lead Developer",
    duration: "6 months",
    teamSize: 5,
    featured: true,
    client: { name: "ShopMax", industry: "E-Commerce" },
    highlights: [
      "Reduced page load time from 4s to 1.2s",
      "Implemented headless CMS integration",
      "Built real-time inventory tracking",
    ],
  },
  {
    id: "2",
    title: "FinTech Dashboard",
    description:
      "Built a real-time financial analytics dashboard for a fintech startup, processing millions of transactions daily.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    tags: ["React", "D3.js", "Node.js", "PostgreSQL", "WebSocket"],
    role: "Full-Stack Developer",
    duration: "4 months",
    teamSize: 3,
    client: { name: "FinanceFlow", industry: "FinTech" },
  },
  {
    id: "3",
    title: "Healthcare Appointment System",
    description:
      "Developed a HIPAA-compliant appointment scheduling system with video conferencing integration for a healthcare provider.",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop",
    tags: ["React", "Node.js", "AWS", "Twilio", "MongoDB"],
    role: "Backend Lead",
    duration: "8 months",
    teamSize: 4,
    client: { name: "MediCare Plus", industry: "Healthcare" },
  },
  {
    id: "4",
    title: "AI-Powered Content Platform",
    description:
      "Created an AI-assisted content creation platform with GPT integration for automated writing suggestions.",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
    tags: ["Next.js", "OpenAI", "Python", "FastAPI", "Redis"],
    role: "Tech Lead",
    duration: "5 months",
    teamSize: 6,
    client: { name: "ContentAI", industry: "SaaS" },
  },
];

const mockReviews: Review[] = [
  {
    id: "1",
    author: {
      name: "Jennifer Martinez",
      role: "CTO",
      company: "ShopMax",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    },
    rating: 5,
    comment:
      "Alex is an exceptional developer who consistently delivers high-quality work. His expertise in React and Node.js helped us completely transform our platform. Communication was excellent, and he always met deadlines. I would hire him again without hesitation.",
    date: "January 2026",
    projectName: "E-Commerce Platform Redesign",
    duration: "6 months",
    skills: ["React", "Next.js", "TypeScript"],
    verified: true,
    helpful: 24,
  },
  {
    id: "2",
    author: {
      name: "Michael Chen",
      role: "Product Manager",
      company: "FinanceFlow",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    rating: 5,
    comment:
      "Working with Alex was a game-changer for our startup. He built our entire analytics dashboard from scratch and it's been rock-solid. His deep understanding of real-time data processing made all the difference.",
    date: "November 2025",
    projectName: "FinTech Dashboard",
    duration: "4 months",
    skills: ["D3.js", "Node.js", "WebSocket"],
    verified: true,
    helpful: 18,
  },
  {
    id: "3",
    author: {
      name: "Sarah Williams",
      role: "Director of Engineering",
      company: "MediCare Plus",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    rating: 4.5,
    comment:
      "Alex demonstrated exceptional knowledge of security best practices for our healthcare application. He was proactive in suggesting improvements and maintained excellent documentation throughout the project.",
    date: "August 2025",
    projectName: "Healthcare Appointment System",
    duration: "8 months",
    skills: ["AWS", "Node.js", "Security"],
    verified: true,
    helpful: 12,
  },
  {
    id: "4",
    author: {
      name: "David Kim",
      role: "Founder",
      company: "ContentAI",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    },
    rating: 5,
    comment:
      "Alex's experience with AI integration was invaluable. He helped us build a product that our users love. His ability to explain complex technical concepts to non-technical stakeholders made collaboration seamless.",
    date: "June 2025",
    projectName: "AI-Powered Content Platform",
    duration: "5 months",
    skills: ["OpenAI", "Python", "FastAPI"],
    verified: true,
    helpful: 15,
  },
  {
    id: "5",
    author: {
      name: "Emily Brown",
      role: "VP of Technology",
      company: "TechStart",
    },
    rating: 5,
    comment:
      "One of the best developers I've worked with. Alex has a rare combination of technical excellence and great communication skills. He truly cares about delivering value, not just code.",
    date: "March 2025",
    verified: true,
    helpful: 8,
  },
];

export default function DeveloperProfilePage() {
  const params = useParams();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--gray-50)",
      }}
    >
      {/* Navigation */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--gray-100)",
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
            href="/talent"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--gray-600)",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={18} />
            Back to Talent
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <GradientButton variant="outline" size="sm">
              Share Profile
            </GradientButton>
            <GradientButton size="sm">Contact Developer</GradientButton>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem" }}>
        {/* Developer Profile */}
        <DeveloperProfile
          developer={mockDeveloper}
          variant="full"
          showAvailability
          showActions
          onContact={() => console.log("Contact")}
          onBookmark={() => console.log("Bookmark")}
        />

        {/* Projects Section */}
        <div style={{ marginTop: "3rem" }}>
          <ProjectsGrid
            projects={mockProjects}
            title="Featured Projects"
            showFilters
          />
        </div>

        {/* Reviews Section */}
        <div style={{ marginTop: "3rem" }}>
          <ReviewsSection
            reviews={mockReviews}
            showSummary
            title="Client Reviews"
          />
        </div>
      </div>
    </div>
  );
}
