"use client";

import { HTMLAttributes, forwardRef, useState } from "react";
import { ReviewCard, Review } from "./ReviewCard";
import { Rating } from "../ui/Rating";
import { GlassCard } from "../ui/GlassCard";
import { Star, TrendingUp, Users, Award } from "lucide-react";

interface ReviewsSectionProps extends HTMLAttributes<HTMLDivElement> {
  reviews: Review[];
  showSummary?: boolean;
  title?: string;
  maxVisible?: number;
}

export const ReviewsSection = forwardRef<HTMLDivElement, ReviewsSectionProps>(
  (
    {
      reviews,
      showSummary = true,
      title = "Client Reviews",
      maxVisible = 6,
      style,
      ...props
    },
    ref,
  ) => {
    const [showAll, setShowAll] = useState(false);

    const visibleReviews = showAll ? reviews : reviews.slice(0, maxVisible);
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    // Calculate rating distribution
    const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: reviews.filter((r) => Math.floor(r.rating) === rating).length,
      percentage:
        reviews.length > 0
          ? (reviews.filter((r) => Math.floor(r.rating) === rating).length /
              reviews.length) *
            100
          : 0,
    }));

    const containerStyles: React.CSSProperties = {
      ...style,
    };

    const headerStyles: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "2rem",
    };

    const titleStyles: React.CSSProperties = {
      fontSize: "1.5rem",
      fontWeight: 700,
      color: "var(--gray-900)",
    };

    const summaryContainerStyles: React.CSSProperties = {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "1.5rem",
      marginBottom: "2rem",
    };

    const summaryCardStyles: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      padding: "1.5rem",
    };

    const summaryIconStyles: React.CSSProperties = {
      width: "3rem",
      height: "3rem",
      borderRadius: "var(--radius-lg)",
      background: "var(--gradient-primary)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#ffffff",
      marginBottom: "0.75rem",
    };

    const summaryValueStyles: React.CSSProperties = {
      fontSize: "2rem",
      fontWeight: 800,
      background: "var(--gradient-primary)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    };

    const summaryLabelStyles: React.CSSProperties = {
      fontSize: "0.8125rem",
      color: "var(--gray-500)",
      marginTop: "0.25rem",
    };

    const distributionContainerStyles: React.CSSProperties = {
      padding: "1.5rem",
    };

    const distributionRowStyles: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      marginBottom: "0.5rem",
    };

    const distributionLabelStyles: React.CSSProperties = {
      width: "1.5rem",
      fontSize: "0.75rem",
      fontWeight: 500,
      color: "var(--gray-600)",
      textAlign: "right",
    };

    const distributionBarContainerStyles: React.CSSProperties = {
      flex: 1,
      height: "0.5rem",
      background: "var(--gray-100)",
      borderRadius: "var(--radius-full)",
      overflow: "hidden",
    };

    const distributionBarStyles = (
      percentage: number,
    ): React.CSSProperties => ({
      height: "100%",
      width: `${percentage}%`,
      background: "var(--gradient-primary)",
      borderRadius: "var(--radius-full)",
      transition: "width var(--transition-slow)",
    });

    const distributionCountStyles: React.CSSProperties = {
      width: "2rem",
      fontSize: "0.75rem",
      color: "var(--gray-400)",
    };

    const gridStyles: React.CSSProperties = {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
      gap: "1.5rem",
    };

    const showMoreStyles: React.CSSProperties = {
      display: "flex",
      justifyContent: "center",
      marginTop: "2rem",
    };

    const showMoreButtonStyles: React.CSSProperties = {
      padding: "0.75rem 2rem",
      fontSize: "0.875rem",
      fontWeight: 500,
      color: "var(--primary-600)",
      background: "transparent",
      border: "2px solid var(--primary-200)",
      borderRadius: "var(--radius-lg)",
      cursor: "pointer",
      transition: "all var(--transition-fast)",
    };

    return (
      <div ref={ref} style={containerStyles} {...props}>
        <div style={headerStyles}>
          <h2 style={titleStyles}>{title}</h2>
          <Rating
            value={averageRating}
            reviewCount={reviews.length}
            size="lg"
          />
        </div>

        {showSummary && reviews.length > 0 && (
          <div style={summaryContainerStyles}>
            <GlassCard variant="light" padding="none" style={summaryCardStyles}>
              <div style={summaryIconStyles}>
                <Star size={20} />
              </div>
              <div style={summaryValueStyles}>{averageRating.toFixed(1)}</div>
              <div style={summaryLabelStyles}>Average Rating</div>
            </GlassCard>

            <GlassCard variant="light" padding="none" style={summaryCardStyles}>
              <div style={summaryIconStyles}>
                <Users size={20} />
              </div>
              <div style={summaryValueStyles}>{reviews.length}</div>
              <div style={summaryLabelStyles}>Total Reviews</div>
            </GlassCard>

            <GlassCard variant="light" padding="none" style={summaryCardStyles}>
              <div style={summaryIconStyles}>
                <TrendingUp size={20} />
              </div>
              <div style={summaryValueStyles}>
                {(
                  ((ratingDistribution[0].count + ratingDistribution[1].count) /
                    reviews.length) *
                  100
                ).toFixed(0)}
                %
              </div>
              <div style={summaryLabelStyles}>Satisfaction Rate</div>
            </GlassCard>

            <GlassCard
              variant="light"
              padding="none"
              style={distributionContainerStyles}
            >
              <div
                style={{
                  marginBottom: "0.75rem",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--gray-700)",
                }}
              >
                Rating Distribution
              </div>
              {ratingDistribution.map((item) => (
                <div key={item.rating} style={distributionRowStyles}>
                  <span style={distributionLabelStyles}>{item.rating}★</span>
                  <div style={distributionBarContainerStyles}>
                    <div style={distributionBarStyles(item.percentage)} />
                  </div>
                  <span style={distributionCountStyles}>{item.count}</span>
                </div>
              ))}
            </GlassCard>
          </div>
        )}

        <div style={gridStyles}>
          {visibleReviews.map((review, index) => (
            <ReviewCard
              key={review.id}
              review={review}
              variant={index === 0 ? "featured" : "default"}
            />
          ))}
        </div>

        {reviews.length > maxVisible && (
          <div style={showMoreStyles}>
            <button
              style={showMoreButtonStyles}
              onClick={() => setShowAll(!showAll)}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "var(--primary-50)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
              }}
            >
              {showAll ? "Show Less" : `Show All ${reviews.length} Reviews`}
            </button>
          </div>
        )}
      </div>
    );
  },
);

ReviewsSection.displayName = "ReviewsSection";
