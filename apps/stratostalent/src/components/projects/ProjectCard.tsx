"use client";

import { HTMLAttributes, forwardRef } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Badge } from "../ui/Badge";
import { ExternalLink, Github, Calendar, Users } from "lucide-react";

export interface Project {
  id: string;
  title: string;
  description: string;
  image?: string;
  tags: string[];
  role: string;
  duration: string;
  teamSize?: number;
  highlights?: string[];
  liveUrl?: string;
  githubUrl?: string;
  client?: {
    name: string;
    logo?: string;
    industry?: string;
  };
  featured?: boolean;
}

interface ProjectCardProps extends HTMLAttributes<HTMLDivElement> {
  project: Project;
  variant?: "default" | "compact" | "featured";
}

export const ProjectCard = forwardRef<HTMLDivElement, ProjectCardProps>(
  ({ project, variant = "default", style, ...props }, ref) => {
    const isFeatured = variant === "featured" || project.featured;
    const isCompact = variant === "compact";

    const cardStyles: React.CSSProperties = {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      ...style,
    };

    const imageContainerStyles: React.CSSProperties = {
      position: "relative",
      width: "100%",
      height: isCompact ? "140px" : isFeatured ? "240px" : "180px",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      marginBottom: "1rem",
      background: project.image ? "transparent" : "var(--gradient-primary)",
    };

    const imageStyles: React.CSSProperties = {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    };

    const imagePlaceholderStyles: React.CSSProperties = {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: isCompact ? "2rem" : "3rem",
      color: "rgba(255,255,255,0.5)",
      fontWeight: 700,
    };

    const overlayStyles: React.CSSProperties = {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background:
        "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.7) 100%)",
      opacity: 0,
      transition: "opacity var(--transition-base)",
    };

    const linksStyles: React.CSSProperties = {
      position: "absolute",
      bottom: "1rem",
      left: "1rem",
      right: "1rem",
      display: "flex",
      gap: "0.5rem",
      opacity: 0,
      transform: "translateY(10px)",
      transition: "all var(--transition-base)",
    };

    const linkButtonStyles: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.375rem",
      padding: "0.5rem 0.875rem",
      background: "rgba(255,255,255,0.9)",
      color: "var(--gray-800)",
      borderRadius: "var(--radius-md)",
      fontSize: "0.75rem",
      fontWeight: 500,
      textDecoration: "none",
      transition: "all var(--transition-fast)",
    };

    const contentStyles: React.CSSProperties = {
      flex: 1,
      display: "flex",
      flexDirection: "column",
    };

    const titleStyles: React.CSSProperties = {
      fontSize: isFeatured ? "1.25rem" : "1.0625rem",
      fontWeight: 600,
      color: "var(--gray-900)",
      marginBottom: "0.5rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    };

    const descriptionStyles: React.CSSProperties = {
      fontSize: "0.875rem",
      color: "var(--gray-600)",
      lineHeight: 1.6,
      marginBottom: "1rem",
      display: "-webkit-box",
      WebkitLineClamp: isCompact ? 2 : 3,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    };

    const tagsContainerStyles: React.CSSProperties = {
      display: "flex",
      flexWrap: "wrap",
      gap: "0.375rem",
      marginBottom: "1rem",
    };

    const metaContainerStyles: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      marginTop: "auto",
      paddingTop: "1rem",
      borderTop: "1px solid var(--gray-100)",
      fontSize: "0.75rem",
      color: "var(--gray-500)",
    };

    const metaItemStyles: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: "0.375rem",
    };

    const clientStyles: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.5rem 0.75rem",
      background: "var(--gray-50)",
      borderRadius: "var(--radius-md)",
      marginBottom: "1rem",
    };

    const clientLogoStyles: React.CSSProperties = {
      width: "1.5rem",
      height: "1.5rem",
      borderRadius: "var(--radius-sm)",
      objectFit: "cover",
    };

    const clientNameStyles: React.CSSProperties = {
      fontSize: "0.8125rem",
      fontWeight: 500,
      color: "var(--gray-700)",
    };

    return (
      <GlassCard
        ref={ref}
        variant="light"
        padding={isCompact ? "sm" : "lg"}
        hover
        style={cardStyles}
        {...props}
      >
        <div
          style={imageContainerStyles}
          onMouseEnter={(e) => {
            const overlay = e.currentTarget.querySelector(
              ".project-overlay",
            ) as HTMLElement;
            const links = e.currentTarget.querySelector(
              ".project-links",
            ) as HTMLElement;
            if (overlay) overlay.style.opacity = "1";
            if (links) {
              links.style.opacity = "1";
              links.style.transform = "translateY(0)";
            }
          }}
          onMouseLeave={(e) => {
            const overlay = e.currentTarget.querySelector(
              ".project-overlay",
            ) as HTMLElement;
            const links = e.currentTarget.querySelector(
              ".project-links",
            ) as HTMLElement;
            if (overlay) overlay.style.opacity = "0";
            if (links) {
              links.style.opacity = "0";
              links.style.transform = "translateY(10px)";
            }
          }}
        >
          {project.image ? (
            <img src={project.image} alt={project.title} style={imageStyles} />
          ) : (
            <div style={imagePlaceholderStyles}>{project.title.charAt(0)}</div>
          )}
          <div className="project-overlay" style={overlayStyles} />
          <div className="project-links" style={linksStyles}>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={linkButtonStyles}
              >
                <ExternalLink size={14} />
                Live
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={linkButtonStyles}
              >
                <Github size={14} />
                Code
              </a>
            )}
          </div>
          {isFeatured && (
            <Badge
              variant="secondary"
              size="xs"
              style={{
                position: "absolute",
                top: "0.75rem",
                right: "0.75rem",
              }}
            >
              Featured
            </Badge>
          )}
        </div>

        <div style={contentStyles}>
          {project.client && !isCompact && (
            <div style={clientStyles}>
              {project.client.logo ? (
                <img
                  src={project.client.logo}
                  alt={project.client.name}
                  style={clientLogoStyles}
                />
              ) : (
                <div
                  style={{
                    ...clientLogoStyles,
                    background: "var(--gradient-accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "0.625rem",
                    fontWeight: 600,
                  }}
                >
                  {project.client.name.charAt(0)}
                </div>
              )}
              <span style={clientNameStyles}>{project.client.name}</span>
              {project.client.industry && (
                <Badge variant="outline" size="xs">
                  {project.client.industry}
                </Badge>
              )}
            </div>
          )}

          <h3 style={titleStyles}>{project.title}</h3>

          <p style={descriptionStyles}>{project.description}</p>

          <div style={tagsContainerStyles}>
            {project.tags.slice(0, isCompact ? 3 : 5).map((tag, index) => (
              <Badge key={index} variant="primary" size="xs">
                {tag}
              </Badge>
            ))}
            {project.tags.length > (isCompact ? 3 : 5) && (
              <Badge variant="outline" size="xs">
                +{project.tags.length - (isCompact ? 3 : 5)}
              </Badge>
            )}
          </div>

          {!isCompact && (
            <div style={metaContainerStyles}>
              <span style={metaItemStyles}>
                <Calendar size={14} />
                {project.duration}
              </span>
              {project.teamSize && (
                <span style={metaItemStyles}>
                  <Users size={14} />
                  Team of {project.teamSize}
                </span>
              )}
              <Badge variant="accent" size="xs" style={{ marginLeft: "auto" }}>
                {project.role}
              </Badge>
            </div>
          )}
        </div>
      </GlassCard>
    );
  },
);

ProjectCard.displayName = "ProjectCard";
