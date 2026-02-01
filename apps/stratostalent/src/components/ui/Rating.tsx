"use client";

import { HTMLAttributes, forwardRef } from "react";

interface RatingProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  reviewCount?: number;
  readonly?: boolean;
  onChange?: (value: number) => void;
}

export const Rating = forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value,
      max = 5,
      size = "md",
      showValue = true,
      reviewCount,
      readonly = true,
      onChange,
      style,
      ...props
    },
    ref,
  ) => {
    const sizeMap: Record<string, { star: number; font: string; gap: string }> =
      {
        sm: { star: 14, font: "0.75rem", gap: "0.125rem" },
        md: { star: 18, font: "0.875rem", gap: "0.25rem" },
        lg: { star: 24, font: "1rem", gap: "0.375rem" },
      };

    const currentSize = sizeMap[size];

    const containerStyles: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
      ...style,
    };

    const starsContainerStyles: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: currentSize.gap,
    };

    const valueStyles: React.CSSProperties = {
      fontSize: currentSize.font,
      fontWeight: 600,
      color: "var(--gray-800)",
    };

    const countStyles: React.CSSProperties = {
      fontSize: currentSize.font,
      color: "var(--gray-500)",
    };

    const renderStar = (index: number) => {
      const filled = index < Math.floor(value);
      const partial = index === Math.floor(value) && value % 1 !== 0;
      const partialWidth = partial ? `${(value % 1) * 100}%` : "0%";

      const starStyles: React.CSSProperties = {
        width: currentSize.star,
        height: currentSize.star,
        cursor: readonly ? "default" : "pointer",
        position: "relative",
        transition: "transform var(--transition-fast)",
      };

      return (
        <div
          key={index}
          style={starStyles}
          onClick={() => !readonly && onChange?.(index + 1)}
          onMouseEnter={(e) => {
            if (!readonly) {
              (e.currentTarget as HTMLDivElement).style.transform =
                "scale(1.1)";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
          }}
        >
          {/* Empty star background */}
          <svg
            width={currentSize.star}
            height={currentSize.star}
            viewBox="0 0 24 24"
            fill="var(--gray-200)"
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {/* Filled star overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: filled ? "100%" : partial ? partialWidth : "0%",
              overflow: "hidden",
            }}
          >
            <svg
              width={currentSize.star}
              height={currentSize.star}
              viewBox="0 0 24 24"
              fill="#fbbf24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        </div>
      );
    };

    return (
      <div ref={ref} style={containerStyles} {...props}>
        <div style={starsContainerStyles}>
          {Array.from({ length: max }, (_, i) => renderStar(i))}
        </div>
        {showValue && <span style={valueStyles}>{value.toFixed(1)}</span>}
        {reviewCount !== undefined && (
          <span style={countStyles}>({reviewCount} reviews)</span>
        )}
      </div>
    );
  },
);

Rating.displayName = "Rating";
