"use client";

import { HTMLAttributes, forwardRef } from "react";

interface SkillTagProps extends HTMLAttributes<HTMLSpanElement> {
  skill: string;
  level?: "beginner" | "intermediate" | "advanced" | "expert";
  years?: number;
  selected?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

const levelColors: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  beginner: {
    bg: "rgba(156, 163, 175, 0.1)",
    text: "var(--gray-600)",
    border: "var(--gray-300)",
  },
  intermediate: {
    bg: "rgba(59, 130, 246, 0.1)",
    text: "var(--primary-600)",
    border: "var(--primary-300)",
  },
  advanced: {
    bg: "rgba(139, 92, 246, 0.1)",
    text: "var(--secondary-600)",
    border: "var(--secondary-300)",
  },
  expert: {
    bg: "rgba(16, 185, 129, 0.1)",
    text: "var(--accent-600)",
    border: "var(--accent-400)",
  },
};

export const SkillTag = forwardRef<HTMLSpanElement, SkillTagProps>(
  (
    {
      skill,
      level = "intermediate",
      years,
      selected = false,
      removable = false,
      onRemove,
      style,
      ...props
    },
    ref,
  ) => {
    const colors = levelColors[level];

    const baseStyles: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.375rem 0.875rem",
      fontSize: "0.8125rem",
      fontWeight: 500,
      borderRadius: "var(--radius-lg)",
      background: selected ? "var(--gradient-primary)" : colors.bg,
      color: selected ? "#ffffff" : colors.text,
      border: selected ? "none" : `1px solid ${colors.border}`,
      transition: "all var(--transition-fast)",
      cursor: removable ? "default" : "pointer",
      ...style,
    };

    const yearsStyles: React.CSSProperties = {
      fontSize: "0.6875rem",
      opacity: 0.8,
      background: selected ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.05)",
      padding: "0.125rem 0.375rem",
      borderRadius: "var(--radius-sm)",
    };

    const removeButtonStyles: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "1rem",
      height: "1rem",
      marginLeft: "0.25rem",
      marginRight: "-0.25rem",
      borderRadius: "var(--radius-full)",
      background: "rgba(0,0,0,0.1)",
      border: "none",
      cursor: "pointer",
      color: "inherit",
      padding: 0,
      transition: "all var(--transition-fast)",
    };

    return (
      <span ref={ref} style={baseStyles} {...props}>
        {skill}
        {years && <span style={yearsStyles}>{years}y</span>}
        {removable && (
          <button
            type="button"
            style={removeButtonStyles}
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </span>
    );
  },
);

SkillTag.displayName = "SkillTag";
