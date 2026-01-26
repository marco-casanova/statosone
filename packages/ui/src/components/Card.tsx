import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md" | "lg";
  children: ReactNode;
}

export function Card({
  padding = "md",
  shadow = "sm",
  children,
  style,
  ...props
}: CardProps) {
  const paddingMap = {
    none: "0",
    sm: "1rem",
    md: "1.5rem",
    lg: "2rem",
  };

  const shadowMap = {
    none: "none",
    sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    borderRadius: "0.75rem",
    border: "1px solid #e5e7eb",
    padding: paddingMap[padding],
    boxShadow: shadowMap[shadow],
    ...style,
  };

  return (
    <div style={cardStyle} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      style={{
        marginBottom: "1rem",
        paddingBottom: "1rem",
        borderBottom: "1px solid #e5e7eb",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  style,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { children: ReactNode }) {
  return (
    <h3
      style={{
        fontSize: "1.125rem",
        fontWeight: 600,
        color: "#111827",
        margin: 0,
        ...style,
      }}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({
  children,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div style={{ ...style }} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      style={{
        marginTop: "1rem",
        paddingTop: "1rem",
        borderTop: "1px solid #e5e7eb",
        display: "flex",
        gap: "0.5rem",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
