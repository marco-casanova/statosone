"use client";

import { HTMLAttributes, forwardRef, useState } from "react";
import { ProjectCard, Project } from "./ProjectCard";
import { Badge } from "../ui/Badge";
import { Grid, List, Filter } from "lucide-react";

interface ProjectsGridProps extends HTMLAttributes<HTMLDivElement> {
  projects: Project[];
  showFilters?: boolean;
  title?: string;
  emptyMessage?: string;
}

export const ProjectsGrid = forwardRef<HTMLDivElement, ProjectsGridProps>(
  (
    {
      projects,
      showFilters = true,
      title = "Projects",
      emptyMessage = "No projects to display",
      style,
      ...props
    },
    ref,
  ) => {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // Extract all unique tags
    const allTags = Array.from(new Set(projects.flatMap((p) => p.tags))).slice(
      0,
      10,
    );

    // Filter projects by selected tag
    const filteredProjects = selectedTag
      ? projects.filter((p) => p.tags.includes(selectedTag))
      : projects;

    const containerStyles: React.CSSProperties = {
      ...style,
    };

    const headerStyles: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "1.5rem",
      flexWrap: "wrap",
      gap: "1rem",
    };

    const titleStyles: React.CSSProperties = {
      fontSize: "1.25rem",
      fontWeight: 700,
      color: "var(--gray-900)",
    };

    const controlsStyles: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
    };

    const viewToggleStyles: React.CSSProperties = {
      display: "flex",
      gap: "0.25rem",
      padding: "0.25rem",
      background: "var(--gray-100)",
      borderRadius: "var(--radius-md)",
    };

    const viewButtonStyles = (active: boolean): React.CSSProperties => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "2rem",
      height: "2rem",
      borderRadius: "var(--radius-sm)",
      background: active ? "#ffffff" : "transparent",
      border: "none",
      cursor: "pointer",
      color: active ? "var(--primary-600)" : "var(--gray-500)",
      boxShadow: active ? "var(--shadow-sm)" : "none",
      transition: "all var(--transition-fast)",
    });

    const filtersStyles: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      marginBottom: "1.5rem",
      flexWrap: "wrap",
    };

    const filterLabelStyles: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: "0.375rem",
      fontSize: "0.8125rem",
      fontWeight: 500,
      color: "var(--gray-600)",
    };

    const gridStyles: React.CSSProperties = {
      display: "grid",
      gridTemplateColumns:
        viewMode === "grid" ? "repeat(auto-fill, minmax(320px, 1fr))" : "1fr",
      gap: "1.5rem",
    };

    const emptyStyles: React.CSSProperties = {
      textAlign: "center",
      padding: "4rem 2rem",
      color: "var(--gray-500)",
    };

    const emptyIconStyles: React.CSSProperties = {
      width: "4rem",
      height: "4rem",
      margin: "0 auto 1rem",
      borderRadius: "var(--radius-full)",
      background: "var(--gray-100)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--gray-400)",
    };

    return (
      <div ref={ref} style={containerStyles} {...props}>
        <div style={headerStyles}>
          <h2 style={titleStyles}>{title}</h2>
          <div style={controlsStyles}>
            <div style={viewToggleStyles}>
              <button
                style={viewButtonStyles(viewMode === "grid")}
                onClick={() => setViewMode("grid")}
                title="Grid view"
              >
                <Grid size={16} />
              </button>
              <button
                style={viewButtonStyles(viewMode === "list")}
                onClick={() => setViewMode("list")}
                title="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {showFilters && allTags.length > 0 && (
          <div style={filtersStyles}>
            <span style={filterLabelStyles}>
              <Filter size={14} />
              Filter:
            </span>
            <Badge
              variant={selectedTag === null ? "primary" : "outline"}
              size="sm"
              style={{ cursor: "pointer" }}
              onClick={() => setSelectedTag(null)}
            >
              All
            </Badge>
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "primary" : "outline"}
                size="sm"
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {filteredProjects.length > 0 ? (
          <div style={gridStyles}>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                variant={viewMode === "list" ? "compact" : "default"}
              />
            ))}
          </div>
        ) : (
          <div style={emptyStyles}>
            <div style={emptyIconStyles}>
              <Grid size={24} />
            </div>
            <p>{emptyMessage}</p>
          </div>
        )}
      </div>
    );
  },
);

ProjectsGrid.displayName = "ProjectsGrid";
