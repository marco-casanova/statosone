"use client";

import { HTMLAttributes, forwardRef } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Avatar } from "../ui/Avatar";
import { Rating } from "../ui/Rating";
import { Badge } from "../ui/Badge";
import { Quote, ThumbsUp, Calendar, Briefcase } from "lucide-react";

export interface Review {
  id: string;
  author: {
    name: string;
    role: string;
    company: string;
    avatar?: string;
    companyLogo?: string;
  };
  rating: number;
  comment: string;
  date: string;
  projectName?: string;
  duration?: string;
  skills?: string[];
  verified?: boolean;
  helpful?: number;
}

interface ReviewCardProps extends HTMLAttributes<HTMLDivElement> {
  review: Review;
  variant?: "default" | "compact" | "featured";
}

export const ReviewCard = forwardRef<HTMLDivElement, ReviewCardProps>(
  ({ review, variant = "default", style, ...props }, ref) => {
    const isFeatured = variant === "featured";
    const isCompact = variant === "compact";

    const cardStyles: React.CSSProperties = {
      position: "relative",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      ...style,
    };

    const quoteIconStyles: React.CSSProperties = {
      position: "absolute",
      top: isFeatured ? "1.5rem" : "1rem",
      right: isFeatured ? "1.5rem" : "1rem",
      width: isFeatured ? "3rem" : "2.5rem",
      height: isFeatured ? "3rem" : "2.5rem",
      borderRadius: "var(--radius-lg)",
      background: "var(--gradient-primary)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#ffffff",
      opacity: 0.8,
    };

    const headerStyles: React.CSSProperties = {
      display: "flex",
      alignItems: "flex-start",
      gap: "1rem",
      marginBottom: isCompact ? "0.75rem" : "1rem",
    };

    const authorInfoStyles: React.CSSProperties = {
      flex: 1,
    };

    const authorNameStyles: React.CSSProperties = {
      fontSize: isFeatured ? "1.0625rem" : "0.9375rem",
      fontWeight: 600,
      color: "var(--gray-900)",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      marginBottom: "0.25rem",
    };

    const authorRoleStyles: React.CSSProperties = {
      fontSize: "0.8125rem",
      color: "var(--gray-600)",
      marginBottom: "0.25rem",
    };

    const companyStyles: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: "0.375rem",
      fontSize: "0.75rem",
      color: "var(--gray-500)",
    };

    const ratingContainerStyles: React.CSSProperties = {
      marginBottom: isCompact ? "0.75rem" : "1rem",
    };

    const commentStyles: React.CSSProperties = {
      fontSize: isFeatured ? "1rem" : "0.9375rem",
      color: "var(--gray-700)",
      lineHeight: 1.7,
      marginBottom: "1rem",
      flex: 1,
      display: isCompact ? "-webkit-box" : "block",
      WebkitLineClamp: isCompact ? 3 : undefined,
      WebkitBoxOrient: isCompact ? "vertical" : undefined,
      overflow: isCompact ? "hidden" : undefined,
      fontStyle: "italic",
    };

    const projectInfoStyles: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      padding: "0.75rem",
      background: "var(--gray-50)",
      borderRadius: "var(--radius-md)",
      marginBottom: "1rem",
      fontSize: "0.8125rem",
      color: "var(--gray-600)",
    };

    const projectItemStyles: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: "0.375rem",
    };

    const footerStyles: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: "auto",
      paddingTop: "1rem",
      borderTop: "1px solid var(--gray-100)",
    };

    const dateStyles: React.CSSProperties = {
      fontSize: "0.75rem",
      color: "var(--gray-400)",
    };

    const helpfulStyles: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: "0.375rem",
      fontSize: "0.75rem",
      color: "var(--gray-500)",
      cursor: "pointer",
      padding: "0.375rem 0.75rem",
      borderRadius: "var(--radius-md)",
      transition: "all var(--transition-fast)",
    };

    const skillsStyles: React.CSSProperties = {
      display: "flex",
      flexWrap: "wrap",
      gap: "0.375rem",
      marginBottom: "1rem",
    };

    return (
      <GlassCard
        ref={ref}
        variant={isFeatured ? "gradient" : "light"}
        padding={isCompact ? "md" : "lg"}
        style={cardStyles}
        {...props}
      >
        <div style={quoteIconStyles}>
          <Quote size={isFeatured ? 20 : 16} />
        </div>

        <div style={headerStyles}>
          <Avatar
            src={review.author.avatar}
            name={review.author.name}
            size={isFeatured ? "lg" : "md"}
            verified={review.verified}
          />
          <div style={authorInfoStyles}>
            <div style={authorNameStyles}>{review.author.name}</div>
            <div style={authorRoleStyles}>{review.author.role}</div>
            <div style={companyStyles}>
              <Briefcase size={12} />
              {review.author.company}
            </div>
          </div>
        </div>

        <div style={ratingContainerStyles}>
          <Rating
            value={review.rating}
            size={isFeatured ? "md" : "sm"}
            showValue={false}
          />
        </div>

        <p style={commentStyles}>"{review.comment}"</p>

        {review.skills && review.skills.length > 0 && !isCompact && (
          <div style={skillsStyles}>
            {review.skills.map((skill, index) => (
              <Badge key={index} variant="primary" size="xs">
                {skill}
              </Badge>
            ))}
          </div>
        )}

        {(review.projectName || review.duration) && !isCompact && (
          <div style={projectInfoStyles}>
            {review.projectName && (
              <span style={projectItemStyles}>
                <Briefcase size={14} />
                {review.projectName}
              </span>
            )}
            {review.duration && (
              <span style={projectItemStyles}>
                <Calendar size={14} />
                {review.duration}
              </span>
            )}
          </div>
        )}

        <div style={footerStyles}>
          <span style={dateStyles}>{review.date}</span>
          {review.helpful !== undefined && (
            <span
              style={helpfulStyles}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "var(--gray-100)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
              }}
            >
              <ThumbsUp size={14} />
              Helpful ({review.helpful})
            </span>
          )}
        </div>
      </GlassCard>
    );
  },
);

ReviewCard.displayName = "ReviewCard";
